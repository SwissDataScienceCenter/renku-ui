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

import { APIError, alertAPIErrors, API_ERRORS } from "./errors";
import { renkuFetch, RETURN_TYPES } from "./utils";
import processPaginationHeaders from "./pagination";
import ApolloClient from "apollo-boost";
// ? Consider a minimal graphql lib: https://github.com/yoshuawuyts/nanographql

import addProjectMethods from "./project";
import addRepositoryMethods from "./repository";
import addUserMethods from "./user";
import addIssueMethods from "./issue";
import addInstanceMethods from "./instance";
import addNotebookServersMethods from "./notebook-servers";
import addGraphMethods from "./graph";
import addPipelineMethods from "./pipeline";
import addDatasetMethods from "./dataset";
import addMergeRequestMethods from "./merge-request";

import testClient from "./test-client";

const ACCESS_LEVELS = {
  GUEST: 10,
  REPORTER: 20,
  DEVELOPER: 30,
  MAINTAINER: 40,
  OWNER: 50,
};

class APIClient {

  // GitLab api client for Renku. Note that we do some
  // renaming of GitLab resources within this client:
  //
  // Renku      GitLab
  // -----------------
  // ku    -->  issue (old)


  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.returnTypes = RETURN_TYPES;
    this.graphqlClient = new ApolloClient({
      uri: `${baseUrl}/graphql`
    });

    addProjectMethods(this);
    addRepositoryMethods(this);
    addUserMethods(this);
    addIssueMethods(this);
    addInstanceMethods(this);
    addNotebookServersMethods(this);
    addGraphMethods(this);
    addPipelineMethods(this);
    addDatasetMethods(this);
    addMergeRequestMethods(this);
  }

  // A fetch method which is attached to a API client instance so that it can
  // contain a user token.
  clientFetch(
    url,
    options = { headers: new Headers() },
    returnType = RETURN_TYPES.json,
    alertOnErr = false,
    reLogin = true
  ) {

    return renkuFetch(url, options)
      .catch((error) => {

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
        switch (returnType) {

          case RETURN_TYPES.json:
            return response.json().then(data => {
              return {
                data,
                pagination: processPaginationHeaders(this, response.headers)
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
    method = "GET"
  ) {
    const urlObject = new URL(url);
    let headers = new Headers({
      "credentials": "same-origin",
      "X-Requested-With": "XMLHttpRequest"
    });
    return fetch(urlObject, { headers, method });
  }

  doLogin() {
    window.location = `${this.baseUrl}/auth/login?redirect_url=${encodeURIComponent(window.location.href)}`;
  }

  doLogout() {
    window.location = `${this.baseUrl}/auth/logout?redirect_url=${encodeURIComponent(window.location.href)}`;
  }

  getBasicHeaders() {
    let headers = {
      "Accept": "application/json"
    };
    return new Headers(headers);
  }
}

export default APIClient;
export { alertAPIErrors, APIError, ACCESS_LEVELS, API_ERRORS, testClient };
