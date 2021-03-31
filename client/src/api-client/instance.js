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
  client.getNamespaces = async (per_page = 100) => {
    const url = `${client.baseUrl}/namespaces`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const queryParams = { per_page };
    const options = { method: "GET", headers, queryParams };
    const namespacesIterator = client.clientIterableFetch(url, { options });

    let namespaces = [], pagination = {}, error = false;
    try {
      for await (const namespacesPage of namespacesIterator) {
        namespaces = [...namespaces, ...namespacesPage.data];
        pagination = { ...namespacesPage.pagination, done: false };
      }
      pagination.done = true;
    }
    catch (exception) {
      error = exception;
    }
    finally {
      return { data: namespaces, pagination, error };
    }
  };

  client.getGroupByPath = (path) => {
    const headers = client.getBasicHeaders();
    const urlEncodedPath = encodeURIComponent(path);
    return client.clientFetch(`${client.baseUrl}/groups/${urlEncodedPath}`, {
      method: "GET",
      headers
    });
  };
}

export default addInstanceMethods;
