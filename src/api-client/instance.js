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

// API methods that return Gitlab server instance-level information

function addInstanceMethods(client) {
  client.getNamespaces = (queryParams={}) => {
    // Default the number of rows to 100
    if (undefined === queryParams.per_page) queryParams.per_page = 100;
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.apiUrl}/namespaces`, {
      method: 'GET',
      headers,
      queryParams
    })
  }

  client.getGroupByPath = (path) => {
    const headers = client.getBasicHeaders();
    const urlEncodedPath = encodeURIComponent(path);
    return client.clientFetch(`${client.apiUrl}/groups/${urlEncodedPath}`, {
      method: 'GET',
      headers
    })
  }
}

export default addInstanceMethods;
