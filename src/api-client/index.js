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

import { APIError, alertAPIErrors, API_ERRORS } from './errors';
import { renkuFetch, RETURN_TYPES } from './utils';
import processPaginationHeaders from './pagination';

import addProjectMethods  from './project';
import addRepositoryMethods  from './repository';
import addUserMethods  from './user';
import addKuMethods  from './ku';
import addInstanceMethods from './instance';

import testClient from './test-client'

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
  // ku    -->  issue


  constructor(baseUrl, jupyterhubUrl, renkuVersion) {
    this.baseUrl = baseUrl;
    this.jupyterhubUrl = jupyterhubUrl;
    this.renkuVersion = renkuVersion;
    this.returnTypes = RETURN_TYPES

    addProjectMethods(this);
    addRepositoryMethods(this);
    addUserMethods(this);
    addKuMethods(this);
    addInstanceMethods(this);
  }

  // A fetch method which is attached to a API client instance so that it can
  // contain a user token.
  clientFetch(
    url,
    options={headers: new Headers()},
    returnType=RETURN_TYPES.json,
    alertOnErr=false
  ) {

    return renkuFetch(url, options)
      .catch((error) => {

        // For permission errors we send the user to login
        if (error.case === API_ERRORS.permissionError) {
          return this.doLogin()
        }

        // Alert only if corresponding option is set to true
        else if (alertOnErr) {
          alertAPIErrors(error);
        }

        // Default case: Re-raise the error for the application
        // to take care of it.
        else {
          return Promise.reject(error);
        }

      })

      .then(response => {
        switch (returnType) {

        case RETURN_TYPES.json:
          return response.json().then(data => {
            return {
              data,
              pagination: processPaginationHeaders(this, response.headers)
            }
          })

        case RETURN_TYPES.text:
          return response.text();

        case RETURN_TYPES.full:
          return response;

        default:
          return response;
        }
      })
  }

  doLogin() {
    window.location = `${this.baseUrl}/auth/login?redirect_url=${encodeURIComponent(window.location.href)}`;
  }
  
  doLogout(){
    window.location=`${this.baseUrl}/auth/logout?redirect_url=${encodeURIComponent(window.location.href)}`
  }

  getBasicHeaders() {
    let headers = {
      'Accept': 'application/json'
    };
    return new Headers(headers);
  }
}

export default APIClient;
export { alertAPIErrors, APIError, ACCESS_LEVELS, API_ERRORS, testClient };
