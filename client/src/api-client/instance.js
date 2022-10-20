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

import { renkuFetch } from "./utils";
import { ACCESS_LEVELS } from "./index";

function addInstanceMethods(client) {
  /**
   * Fetch user namespaces and groups
   *
   * @param {number} per_page - result per page
   * @param {ACCESS_LEVELS} min_access_level - to filter by access level, by default is developer access level (30)
   */
  client.getNamespaces = async (per_page = 100, min_access_level = ACCESS_LEVELS.MAINTAINER) => {
    const urlNamespaces = `${client.baseUrl}/namespaces`;
    const urlGroups = `${client.baseUrl}/groups`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const options = { method: "GET", headers, queryParams: { per_page } };
    const namespacesIterator = client.clientIterableFetch(urlNamespaces, { options });

    const groupOptions = options;
    groupOptions.queryParams["min_access_level"] = min_access_level;
    const groupsIterator = client.clientIterableFetch(urlGroups, { options: groupOptions });

    let namespaces = [], paginationNamespace = {}, paginationGroups = {}, error = false;
    try {
      for await (const namespacesPage of namespacesIterator) {
        const onlyUserNamespaces = namespacesPage.data?.filter( namespace => namespace.kind !== "group");
        namespaces = [...namespaces, ...onlyUserNamespaces];
        paginationNamespace = { ...namespacesPage.pagination, done: false };
      }
      paginationNamespace.done = true;

      for await (const groupsPage of groupsIterator) {
        const groups = groupsPage.data.map( group => {
          return { ...group, kind: "group" };
        });
        namespaces = [...namespaces, ...groups];
        paginationGroups = { ...paginationGroups.pagination, done: false };
      }
      paginationGroups.done = true;
    }
    catch (exception) {
      error = exception;
    }
    finally {
      return { data: namespaces, pagination: paginationNamespace && paginationGroups, error };
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

  client.isValidUrlForIframe = async (url) => {
    const response = await renkuFetch(`${client.baseUrl}/allows-iframe/${encodeURIComponent(url)}`, {
      method: "GET",
      headers: new Headers({ "Accept": "application/json" })
    });
    const data = await response.json();
    return data?.isIframeValid ?? false;
  };
}

export default addInstanceMethods;
