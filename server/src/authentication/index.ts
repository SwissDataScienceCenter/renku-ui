/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import express from "express";
import { Issuer, generators, Client, TokenSet } from "openid-client";

import config from "../config";
import logger from "../logger";
import { Storage } from "../storage";


const verifierSuffix = "-verifier";
const parametersSuffix = "-parameters";


class Authenticator {
  authServerUrl: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;

  storage: Storage;

  authClient: Client;
  ready = false;

  constructor(
    storage: Storage,
    authServerUrl: string = config.auth.serverUrl,
    clientId: string = config.auth.clientId,
    clientSecret: string = config.auth.clientSecret,
    callbackUrl: string = config.server.url + config.server.prefix + config.auth.suffix + config.auth.callbackSuffix
  ) {
    // Validate and save parameters
    for (const param of ["storage", "authServerUrl", "clientId", "clientSecret", "callbackUrl"]) {
      if (!param || !param.length) {
        const newError = new Error(`The parameter "${param}" is mandatory.`);
        logger.error(newError);
        throw newError;
      }
    }

    this.storage = storage;
    this.authServerUrl = authServerUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.callbackUrl = callbackUrl;
  }

  /**
   * Initialize client to interact with the authentication server.
   */
  async init(): Promise<boolean> {
    try {
      const issuer = await Issuer.discover(this.authServerUrl);
      this.authClient = new issuer.Client({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uris: [this.callbackUrl],
        response_types: ["code"]
      });
      this.ready = true;
      logger.info("Authenticator succesfully initialized.");
      return true;
    }
    catch (error) {
      logger.error(
        "Cannot initialize the auth client. The authentication server may be down or some paramaters may be wrong. " +
        "Please check the next log entry for further details."
      );
      logger.error(error);
      throw error;
    }
  }

  private checkInit(): boolean {
    if (!this.ready) {
      const newError = new Error("Cannot interact with the authentication server. Did you invoke `await init()`?");
      logger.error(newError);
      throw newError;
    }
    return true;
  }

  private getVerifierKey(sessionId: string): string {
    return sessionId + verifierSuffix;
  }

  private getParametersKey(sessionId: string): string {
    return sessionId + parametersSuffix;
  }

  /**
   * The parameters for the redirect URL after login need to be temporarily stored. Get the parameter
   * string to attach to the final login, and optionally delete the entry from the storage.
   *
   * @param sessionId - session id
   * @param deleteAfter - boolean defaults to true
   * @returns url search string, including the initial `?`
   */
  async getPostLoginParametersAndDelete(sessionId: string, deleteAfter = true): Promise<string> {
    const parametersKey = this.getParametersKey(sessionId);
    const parametersString = await this.storage.get(parametersKey);
    if (parametersString && parametersString != null) {
      if (deleteAfter)
        await this.storage.delete(parametersKey);
      return parametersString;
    }
    return "";
  }


  /**
   * Starts the authentication flow. It saves the code verifier and it returns the url to redirect to.
   *
   * @param sessionId - session id
   */
  async startAuthFlow(sessionId: string, redirectParams: string = null): Promise<string> {
    // ? REF: https://darutk.medium.com/diagrams-of-all-the-openid-connect-flows-6968e3990660
    this.checkInit();

    // create and store the verifier
    const verifier = generators.codeVerifier();
    const challenge = generators.codeChallenge(verifier);
    const verifierKey = this.getVerifierKey(sessionId);
    await this.storage.save(verifierKey, verifier);
    if (redirectParams) {
      const parametersKey = this.getParametersKey(sessionId);
      await this.storage.save(parametersKey, redirectParams);
    }

    // create and return the login url
    const authUrl = this.authClient.authorizationUrl({
      scope: "openid",
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    return authUrl;
  }


  /**
   * Starts the authentication flow. It saves the code verifier and it returns the url to redirect to.
   *
   * @param req - express request containing the code challange
   */
  getAuthCode(req: express.Request): string {
    this.checkInit();

    // get the code param
    const params = this.authClient.callbackParams(req);
    if (params["code"] != null)
      return params["code"];
    // TODO: return error response when needed
  }


  /**
   * Complete the authentication flow. It cleans-up the code verifier, which is not needed anymore.
   *
   * @param sessionId - session id
   */
  async finishAuthFlow(sessionId: string, code: string): Promise<TokenSet> {
    this.checkInit();

    // get the verifier code and remove it from redis
    const verifierKey = this.getVerifierKey(sessionId);
    const verifier = await this.storage.get(verifierKey);
    if (verifier != null) {
      await this.storage.delete(verifierKey);
    }
    else {
      const error = "Code challange not available. Are you re-loading an old page?";
      logger.error(error);
      throw new Error(error);
    }

    try {
      const tokens = await this.authClient.callback(
        this.callbackUrl,
        { code },
        { code_verifier: verifier }
      );
      if (tokens)
        return tokens;
      return null;
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }


  /**
   * Store stringified token set to the storage.
   *
   * @param sessionId - session id
   * @param tokens - tokens object as received from the authentication server (must contain access and refresh token)
   */
  async storeTokens(sessionId: string, tokens: TokenSet): Promise<boolean> {
    this.checkInit();

    const result = await this.storage.save(sessionId, JSON.stringify(tokens));
    return result;
  }


  /**
   * Get token set from the storage.
   *
   * @param sessionId - session id
   * @param autoRefresh - automatically refresh tokens when necessary
   * @returns tokens - tokens object as received from the authentication server (must contain access and refresh token)
   */
  async getTokens(sessionId: string, autoRefresh = true): Promise<TokenSet> {
    this.checkInit();

    // Get tokens from the store
    const stringyTokens = await this.storage.get(sessionId);
    if (stringyTokens == null)
      return null;
    let tokens = new TokenSet(JSON.parse(stringyTokens) as TokenSet);

    const tokenExpired = this.checkTokenExpiration(tokens);
    if (!tokenExpired)
      return tokens;
    if (!autoRefresh)
      return null; // ? may implement something more useful once it's used
    try {
      tokens = await this.refreshTokens(sessionId, tokens);
    }
    catch (error) {
      if (error.toString().includes("invalid"))
        logger.info(`Tokens invalid for session ${sessionId}`);
      else
        logger.error(error);
      throw error;
    }
    return tokens;
  }


  /**
   * Check tokens expiration.
   *
   * @param tokens - token set
   * @returns number representing the TokenStatus
   */
  checkTokenExpiration(tokens: TokenSet): boolean {
    // add tolerance
    const tokensWithTolerance = {
      ...tokens,
      expires_at: tokens.expires_at - (config.auth.tokenExpirationTolerance as number)
    };

    // re-initialize the TokenSet as a proper object.
    const tokensObject = new TokenSet(tokensWithTolerance);
    const expired = tokensObject.expired();
    return expired;
  }


  /**
   * delete token set from the storage.
   *
   * @param sessionId - session id
   * @returns true if the delete operation succeeded, false otherwise. Mind that trying to delete an
   * already delete key won't make the operation fail.
   */
  async deleteTokens(sessionId: string): Promise<boolean> {
    this.checkInit();

    const result = await this.storage.delete(sessionId);
    return result >= 0 ?
      true :
      false;
  }


  /**
   * Refresh tokens when possible. Otherwise, remove the expired/corrupted credentials.
   *
   * @param sessionId - session id
   */
  async refreshTokens(sessionId: string, tokens: TokenSet = null, removeIfFailed = true) : Promise<TokenSet> {
    // get the tokens from the store when not provided.
    if (tokens == null) {
      tokens = await this.getTokens(sessionId, false);
      if (tokens == null)
        return null; // can't refresh them if they doesn't exist
    }

    const refreshedTokens = await this.authClient.refresh(tokens.refresh_token);
    if (refreshedTokens != null)
      await this.storeTokens(sessionId, refreshedTokens);
    else if (removeIfFailed)
      await this.deleteTokens(sessionId);

    return refreshedTokens;
  }
}


export { Authenticator };
