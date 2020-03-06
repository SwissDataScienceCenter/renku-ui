/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

/**
 * Merge namespaces and groups to return a list of namespaces including subgroups
 *
 * @param {array} namespaces   namespaces from Gitlab
 * @param {array} groups       groups from Gitlab
 */

 import _ from "lodash/object";

function mergeNamespacesAndGroups(namespaceResponse, groupResponse) {
  const namespaces = namespaceResponse.data;
  const groups = groupResponse.data;
  const nsMap = {};
  namespaces.forEach(d => nsMap[d.id] = d);
  const missingNsGps = groups.filter(d => undefined === nsMap[d.id]);
  const missingNs = missingNsGps.map((d) =>
    ({ kind: "group", ..._.pick(d, ["id", "name", "path", "full_path", "parent_id", "avatar_url", "web_url"]) })
  );
  return {data: namespaces.concat(missingNs), pagination: namespaceResponse.pagination };
}

function addInstanceMethods(client) {
  client.getAllNamespaces = async (queryParams = {}) => {
    // Get all pages of namespaces and all pages of groups and merge them together
    const promises = [client.getNamespaces(queryParams), client.getGroups(queryParams)];
    const [ns, gs] = await Promise.all(promises);
    return mergeNamespacesAndGroups(ns, gs);
  };

  client.getNamespaces = async (queryParams = {}) => {
    // Default the number of rows to 100
    if (undefined === queryParams.per_page) queryParams.per_page = 100;
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/namespaces`, {
      method: "GET",
      headers,
      queryParams
    });
  };

  client.getGroupByPath = path => {
    const headers = client.getBasicHeaders();
    const urlEncodedPath = encodeURIComponent(path);
    return client.clientFetch(`${client.baseUrl}/groups/${urlEncodedPath}`, {
      method: "GET",
      headers
    });
  };

  client.getGroups = async (queryParams = {}) => {
    // Default the number of rows to 100
    if (undefined === queryParams.per_page) queryParams.per_page = 100;
    const headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/groups`, {
      method: "GET",
      headers,
      queryParams
    });
  };
}

export default addInstanceMethods;

export { mergeNamespacesAndGroups };
