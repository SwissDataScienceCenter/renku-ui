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

import * as Sentry from "@sentry/node";
import express from "express";
import { Issuer, generators, Client, TokenSet } from "openid-client";

import config from "../config";
import logger from "../logger";
import {
  Storage,
  StorageGetOptions,
  StorageSaveOptions,
  TypeData,
} from "../storage";
import { sleep } from "../utils";
import { APIError } from "../utils/apiError";
import { HttpStatusCode } from "../utils/baseError";
import jwt from "jsonwebtoken";

const verifierSuffix = "-verifier";
const parametersSuffix = "-parameters";
const maxAttempts = config.auth.retryConnectionAttempts;

type GetStorageValueReturn = {
  storageKey: string;
  value: string | null;
};

class Authenticator {
  authServerUrl: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;

  storage: Storage;

  retryAttempt = 0;
  authClient: Client;
  ready = false;
  private saveStorageOptions: StorageSaveOptions = {
    type: TypeData.String,
  };
  private getStorageOptions: StorageGetOptions = {
    type: TypeData.String,
  };

  constructor(
    storage: Storage,
    authServerUrl: string = config.auth.serverUrl,
    clientId: string = config.auth.clientId,
    clientSecret: string = config.auth.clientSecret,
    callbackUrl: string = config.server.url +
      config.server.prefix +
      config.routes.auth +
      "/callback"
  ) {
    // Validate and save parameters
    for (const param of [
      "storage",
      "authServerUrl",
      "clientId",
      "clientSecret",
      "callbackUrl",
    ]) {
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
        response_types: ["code"],
      });
      this.ready = true;
      logger.info("Authenticator succesfully initialized.");
      return true;
    } catch (error) {
      this.retryAttempt++;
      logger.error(
        "Cannot initialize the auth client. The authentication server may be down or some paramaters may be wrong. " +
          `Attempt number ${this.retryAttempt} of ${maxAttempts} ` +
          "Please check the next log entry for further details."
      );
      logger.error(error);
      if (this.retryAttempt < maxAttempts) {
        await sleep(10);
        return this.init();
      }
      throw error;
    }
  }

  private checkInit(): boolean {
    if (!this.ready) {
      const newError = new Error(
        "Cannot interact with the authentication server. Did you invoke `await init()`?"
      );
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
   * Delete a value from storage
   * @param storageKey - the key under which the value has been stored
   * @param actionDesc - a description of the action, used for error messages
   * @returns true if the operation did not fail, false if it did fail
   */
  private async deleteStorageValue(
    storageKey: string,
    actionDesc: string
  ): Promise<boolean> {
    const numDeleted = await this.storage.delete(storageKey);
    if (numDeleted < 0) {
      const errorMessage = `Could not delete ${actionDesc} from storage.`;
      logger.error(errorMessage);
      Sentry.captureMessage(errorMessage);
      return false;
    }
    return true;
  }

  private async getStorageValueAsString(
    key: string
  ): Promise<GetStorageValueReturn> {
    const storageKey = `${config.auth.storagePrefix}${key}`;
    const storageValue = await this.storage.get(
      storageKey,
      this.getStorageOptions
    );
    return { storageKey, value: storageValue as string };
  }

  private async saveStorageValueAsString(
    key: string,
    value: string
  ): Promise<boolean> {
    const storageKey = `${config.auth.storagePrefix}${key}`;
    return await this.storage.save(storageKey, value, this.saveStorageOptions);
  }

  /**
   * The parameters for the redirect URL after login need to be temporarily stored. Get the parameter
   * string to attach to the final login, and optionally delete the entry from the storage.
   *
   * @param sessionId - session id
   * @param deleteAfter - boolean defaults to true
   * @returns url search string, including the initial `?`
   */
  async getPostLoginParametersAndDelete(
    sessionId: string,
    deleteAfter = true
  ): Promise<string> {
    const parametersKey = this.getParametersKey(sessionId);
    const { storageKey, value: parametersString } =
      await this.getStorageValueAsString(parametersKey);
    if (parametersString == null) return "";
    if (deleteAfter) {
      await this.deleteStorageValue(
        storageKey,
        `login parameters for session ${sessionId}`
      );
    }
    return parametersString;
  }

  /**
   * Starts the authentication flow. It saves the code verifier and it returns the url to redirect to.
   *
   * @param sessionId - session id
   */
  async startAuthFlow(
    sessionId: string,
    redirectParams: string = null
  ): Promise<string> {
    // ? REF: https://darutk.medium.com/diagrams-of-all-the-openid-connect-flows-6968e3990660
    this.checkInit();

    // create and store the verifier
    const verifier = generators.codeVerifier();
    const challenge = generators.codeChallenge(verifier);
    const verifierKey = this.getVerifierKey(sessionId);
    if (!(await this.saveStorageValueAsString(verifierKey, verifier))) {
      throw new Error("Redis not available to support auth flow.");
    }
    if (redirectParams) {
      const parametersKey = this.getParametersKey(sessionId);
      if (
        !(await this.saveStorageValueAsString(parametersKey, redirectParams))
      ) {
        throw new Error("Redis not available to support auth flow.");
      }
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
    if (params["code"] != null) return params["code"];
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
    const { storageKey, value: verifier } = await this.getStorageValueAsString(
      verifierKey
    );
    if (verifier == null) {
      const error =
        "Code challenge not available. Are you re-loading an old page?";
      throw new APIError(
        "Auth callback reloading page error",
        HttpStatusCode.INTERNAL_SERVER,
        error
      );
    }

    await this.deleteStorageValue(
      storageKey,
      `cleanup verifier for ${sessionId}`
    );

    try {
      const tokens = await this.authClient.callback(
        this.callbackUrl,
        { code },
        { code_verifier: verifier }
      );
      if (tokens) return tokens;
      return null;
    } catch (error) {
      throw new APIError(
        "Error callback for Authorization Server",
        HttpStatusCode.INTERNAL_SERVER,
        error
      );
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

    const result = await this.saveStorageValueAsString(
      sessionId,
      JSON.stringify(tokens)
    );
    if (!result) {
      const errorMessage = `Could not store refresh tokens for session ${sessionId}`;
      logger.error(errorMessage);
      Sentry.captureMessage(errorMessage);
    }
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
    const { value: stringyTokens } = await this.getStorageValueAsString(
      sessionId
    );
    if (stringyTokens == null) return null;
    let tokens = new TokenSet(JSON.parse(stringyTokens) as TokenSet);

    const tokenExpired = this.checkTokenExpiration(tokens);
    if (!tokenExpired) return tokens;
    if (!autoRefresh) return null; // ? may implement something more useful once it's used
    try {
      tokens = await this.refreshTokens(sessionId, tokens);
    } catch (error) {
      if (error.toString().includes("invalid"))
        logger.info(`Tokens invalid for session ${sessionId}`);
      else logger.error(error);
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
      expires_at:
        tokens.expires_at - (config.auth.tokenExpirationTolerance as number),
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
    return await this.deleteStorageValue(
      `${config.auth.storagePrefix}${sessionId}`,
      `tokens for session ${sessionId}`
    );
  }

  /**
   * Refresh tokens when possible. Otherwise, remove the expired/corrupted credentials.
   *
   * @param sessionId - session id
   */
  async refreshTokens(
    sessionId: string,
    tokens: TokenSet = null,
    removeIfFailed = true
  ): Promise<TokenSet> {
    // get the tokens from the store when not provided.
    if (tokens == null) {
      tokens = await this.getTokens(sessionId, false);
      if (tokens == null) return null; // can't refresh them if they doesn't exist
    }

    const refreshedTokens = await this.authClient.refresh(tokens.refresh_token);
    if (refreshedTokens != null)
      await this.storeTokens(sessionId, refreshedTokens);
    else if (removeIfFailed) await this.deleteTokens(sessionId);

    return refreshedTokens;
  }
}

/**
 * Return user Id from token
 *
 * @param authHeader - jwt token using bearer schema
 */
const getUserIdFromToken = (authHeader: string): string => {
  if (!authHeader) return undefined;

  const authItems = authHeader.split(" ");

  if (authItems.length <= 1) return undefined;

  const user = jwt.decode(authItems[1]);
  return (user.sub as string) || undefined;
};

export { Authenticator, getUserIdFromToken };
