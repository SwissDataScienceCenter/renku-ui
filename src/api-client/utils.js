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

import { APIError, API_ERRORS, throwAPIErrors } from './errors';

const RETURN_TYPES = {
  json: 'json',
  text: 'text',
  full: 'fullResponseObject'
}

// Wrapper around fetch which will throw exceptions on all non 20x responses.
// Adapted from https://github.com/github/fetch/issues/155
function renkuFetch(url, options) {

  // Add query parameters to URL instance. This will also work
  // if url is already an instance of URL. Note that this also encodes the URL
  // and the parameters.

  const URLobject = new URL(url);
  if (options.queryParams) {
    Object.keys(options.queryParams).forEach((key) => {
      URLobject.searchParams.append(key, options.queryParams[key])
    });
  }

  // This is the default behaviour for most browsers.
  options['credentials'] = 'same-origin';

  // Add a custom header for protection against CSRF attacks.
  options.headers.set('X-Requested-With', 'XMLHttpRequest');

  return fetch(URLobject, options)

    // Label an error raised here already as networking problem.
    .catch((fetchError) => {
      const networkError = new APIError();
      networkError.case = API_ERRORS.networkError;
      networkError.error = fetchError;
      return Promise.reject(networkError);
    })

    // Raise an error for all non 200 responses.
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        return throwAPIErrors(response)
      }
    })

}


function fetchJson(...args) {
  return fetch(...args).then(response => response.json())
}

export { renkuFetch, fetchJson, RETURN_TYPES }
