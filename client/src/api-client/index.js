/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

import ApolloClient from "apollo-boost"; // ? Consider a minimal graphql lib: https://github.com/yoshuawuyts/nanographql

import addDatasetMethods from "./dataset";
import addEnvironmentMethods from "./environment";
import addGraphMethods from "./graph";
import addInstanceMethods from "./instance";
import addIssueMethods from "./issue";
import addJobMethods from "./job";
import addMergeRequestMethods from "./merge-request";
import addMigrationMethods from "./migration";
import addNotebookServersMethods from "./notebook-servers";
import processPaginationHeaders from "./pagination";
import addPipelineMethods from "./pipeline";
import addProjectMethods from "./project";
import addRepositoryMethods from "./repository";
import addTemplatesMethods from "./templates";
import testClient from "./test-client";

import addUserMethods from "./user";
import { APIError, alertAPIErrors, API_ERRORS } from "./errors";
import { renkuFetch, RETURN_TYPES } from "./utils";

const ACCESS_LEVELS = {
  GUEST: 10,
  REPORTER: 20,
  DEVELOPER: 30,
  MAINTAINER: 40,
  OWNER: 50,
};

const FETCH_DEFAULT = {
  options: { headers: new Headers() },
  returnType: RETURN_TYPES.json,
  alertOnErr: false,
  reLogin: true,
  anonymousLogin: false,
  maxIterations: 10
};


/**
 * API client to query all the RenkuLab API
 */
class APIClient {
  /**
   * @param {string} apiUrl - base API url
   * @param {string} uiserverUrl - UI server base url, mainly used for authentication
   */
  constructor(apiUrl, uiserverUrl) {
    this.baseUrl = apiUrl;
    this.uiserverUrl = uiserverUrl;
    this.returnTypes = RETURN_TYPES;
    this.graphqlClient = new ApolloClient({
      uri: `${apiUrl}/kg/graphql`,
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    addDatasetMethods(this);
    addEnvironmentMethods(this);
    addGraphMethods(this);
    addInstanceMethods(this);
    addIssueMethods(this);
    addJobMethods(this);
    addMergeRequestMethods(this);
    addMigrationMethods(this);
    addNotebookServersMethods(this);
    addPipelineMethods(this);
    addProjectMethods(this);
    addRepositoryMethods(this);
    addTemplatesMethods(this);
    addUserMethods(this);
  }

  /**
   * A fetch method which is attached to an API client instance so that it can contain a user token.
   * Optional arguments default values are set from FETCH_DEFAULT.
   *
   * @param {string} url - Target API url
   * @param {object} [options] - Fetch options, like method, headers, body, ... Default only include basic headers.
   * @param {string} [returnType] - Expected content type. Allowed values are "json" (default), "text" and "full".
   * @param {bool} [alertOnErr] - whether to trigger a default error on fetch errors. Default is false
   * @param {bool} [reLogin] - whether to trigger a re-login on 401 error. Default is true
   * @param {bool} [anonymousLogin] - whether to trigger an anonymous login to work with anonymous credentials.
   *   Default is false
   */
  async clientFetch(
    url,
    options = FETCH_DEFAULT.options,
    returnType = FETCH_DEFAULT.returnType,
    alertOnErr = FETCH_DEFAULT.alertOnErr,
    reLogin = FETCH_DEFAULT.reLogin,
    anonymousLogin = FETCH_DEFAULT.anonymousLogin
  ) {
    return renkuFetch(url, options)
      .catch((error) => {
        if (error.case === API_ERRORS.authExpired) {
          this.doLogin();
          return Promise.reject(error);
        }
        // For permission errors we send the user to login
        if (reLogin && error.case === API_ERRORS.unauthorizedError)
          return this.doLogin();
        // Alert only if corresponding option is set to true
        else if (alertOnErr)
          alertAPIErrors(error);
        // Default case: Re-raise the error for the application
        // to take care of it.
        else
          return Promise.reject(error);
      })
      .then(response => {
        // This avoids showing errors for a second while doing the anonymous log-in.
        // It should be solved in a more elegant way once we support interruptable fetch #776
        if (!response && anonymousLogin)
          return returnType === RETURN_TYPES.json ? { data: {} } : "";
        else if (!response)
          return null;
        switch (returnType) {
          case RETURN_TYPES.json:
            return response.json().then(data => {
              return {
                data,
                pagination: processPaginationHeaders(response.headers)
              };
            });
          case RETURN_TYPES.text:
            return response.text();
          case RETURN_TYPES.full:
            return response;
          default:
            return response;
        }
      });
  }

  /**
   * Create an iterable object to manage pagination. At each iteration, another page is fetched.
   * You can use the for await syntax to fetch all the avilable pages (see exmaple).
   * Optional arguments default values are set from FETCH_DEFAULT
   *
   * @param {string} url - API url
   * @param {object} [parameters] - Optional parameters object to be provided to clientFetch.
   * @param {number} [parameters.maxIterations] - Maximum iterations before throwing an error. Used to prevent
   *   long/endless loops that would trigger the gateway rate limit. Set 0 for unlimited.
   * @example "for await" syntax that consumes the async iterator
   * for await (const partialData of clientIterableFetch("myApiUrl")) { console.log(partialData) }
   */
  async* clientIterableFetch(url, {
    options = FETCH_DEFAULT.options,
    returnType = FETCH_DEFAULT.returnType,
    alertOnErr = FETCH_DEFAULT.alertOnErr,
    reLogin = FETCH_DEFAULT.reLogin,
    anonymousLogin = FETCH_DEFAULT.anonymousLogin,
    maxIterations = FETCH_DEFAULT.maxIterations
  } = {}) {
    let iterations = 1, page = 1;
    do {
      // throw an error if the number of iterations is more than the maximum
      if (maxIterations && iterations > maxIterations)
        throw new Error(`Cannot iterate more than ${maxIterations} times.`);

      // set target page and fetch
      if (options.queryParams)
        options.queryParams.page = page;
      else
        options.queryParams = { page: page };
      const response = await this.clientFetch(url, options, returnType, alertOnErr, reLogin, anonymousLogin);
      if (!response.pagination)
        throw new Error("Invoked API doesn't return structured data, making pagination unusable.");
      page = response.pagination.nextPage;
      response.pagination.progress = response.pagination.currentPage / response.pagination.totalPages;
      iterations++;
      yield response;
    } while (page);
  }

  graphqlFetch(query, variables) {
    return this.graphqlClient.query({ query, variables })
      .catch(error => {
        // TODO implement here common error solutions (re-login, ...)
        return Promise.reject(error);
      })
      .then(response => {
        return response.data;
      });
  }

  // clientFetch does't handle non-2xx responses (ex: graph APIs)
  // can't suppress the error on chrome console on 404 anyway...
  // REF: https://stackoverflow.com/questions/4500741/suppress-chrome-failed-to-load-resource-messages-in-console
  simpleFetch(
    url,
    method = "GET",
    queryParams = null
  ) {
    const urlObject = new URL(url);
    if (queryParams)
      urlObject.search = new URLSearchParams(queryParams).toString();
    let headers = new Headers({
      "credentials": "same-origin",
      "X-Requested-With": "XMLHttpRequest"
    });
    return fetch(urlObject, { headers, method });
  }

  doLogin() {
    // This is invoked to check authentication.
    // ? It may be safer to invoke `LoginHelper.notifyLogout()`, but it doesn't seem to be necessary
    window.location = `${this.uiserverUrl}/auth/login?redirect_url=${encodeURIComponent(window.location.href)}`;
  }

  doLogout() {
    // ? Whenever this will be used, remember to invoke `LoginHelper.notifyLogout()`
    window.location = `${this.uiserverUrl}/auth/logout?redirect_url=${encodeURIComponent(window.location.href)}`;
  }

  getBasicHeaders() {
    let headers = {
      "Accept": "application/json"
    };
    return new Headers(headers);
  }

  /**
   * Return a versioned endpoint url for the core service.
   * @param {string} endpoint
   * @param {string or null} version
   * @returns string
   */
  versionedCoreUrl(endpoint, version) {
    const urlAddition = version ? version : "";
    return `${this.baseUrl}/renku${urlAddition}/${endpoint}`;
  }
}

export default APIClient;
export { alertAPIErrors, APIError, ACCESS_LEVELS, API_ERRORS, FETCH_DEFAULT, testClient };
