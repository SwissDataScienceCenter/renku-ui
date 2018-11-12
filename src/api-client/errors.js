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

class APIError extends Error {
  constructor(arg){
    super(arg || 'Renku API error')
  }
}

const API_ERRORS = {
  unauthorizedError: 'UNAUTHORIZED',
  forbiddenError: 'FORBIDDEN',
  notFoundError: 'NOT_FOUND',
  internalServerError: 'SERVER_ERROR',
  networkError: 'NETWORK_PROBLEM'
};

function throwAPIErrors(response) {
  return response.json().then(errorData => {
    let error;
    switch (response.status) {
    case 401:
      error = new APIError();
      error.case = API_ERRORS.unauthorizedError;
      break;
    case 403:
      error = new APIError();
      error.case = API_ERRORS.forbiddenError;
      break;
    case 404:
      error = new APIError();
      error.case = API_ERRORS.notFoundError;
      break;
    case 500:
      error = new APIError();
      error.case = API_ERRORS.internalServerError;
      break;
    default:
      error = new APIError();
    }
    error.response = response;
    error.errorData = errorData;
    return Promise.reject(error);
  });


}

function alertAPIErrors(error) {
  switch (error.case) {
  case API_ERRORS.permissionError:
    alert('You don\'t have the necessary permission to view this information or perform this action.');
    break;
  case API_ERRORS.notFoundError:
    alert('We could not find the requested resource on the server.');
    break;
  case API_ERRORS.internalServerError:
    alert('There is a problem with the server - please try again later.');
    break;
  case API_ERRORS.networkError:
    alert('There seems to be problem with your network connection. Please check and try again.');
    break;
  default:
    // No alert on default exception
  }
}

export { APIError, API_ERRORS, alertAPIErrors, throwAPIErrors}
