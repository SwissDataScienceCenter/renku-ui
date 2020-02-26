/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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

function addNotebookServersMethods(client) {
  client.getNotebookServers = (namespace, project, branch, commit) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers`;
    let parameters = {};
    if (namespace) parameters.namespace = decodeURIComponent(namespace);
    if (project) parameters.project = project;
    if (branch) parameters.branch = branch;
    if (commit) parameters.commit_sha = commit;

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams: parameters
    }).then(resp => {
      return { "data": resp.data.servers };
    });
  };

  client.stopNotebookServer = (serverName, force = false) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers/${serverName}`;
    let parameters = {};
    if (force) parameters.force = true;

    return client.clientFetch(url, {
      method: "DELETE",
      headers,
      queryParams: parameters
    }, "text")
      .then(resp => {
        return true;
      });
  };

  client.getNotebookServerOptions = () => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/server_options`;

    return client.clientFetch(url, {
      method: "GET",
      headers
    }).then((resp) => {
      let { data } = resp;
      Object.keys(data).forEach(key => {
        data[key].selected = data[key].default;
      });
      return data;
    });
  };

  client.startNotebook = (namespacePath, projectPath, branchName, commitId, options) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/notebooks/servers`;
    const parameters = {
      namespace: decodeURIComponent(namespacePath),
      project: projectPath,
      commit_sha: commitId,
      branch: branchName,
      ...options
    };

    return client.clientFetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(parameters)
    }).then((resp) => {
      return resp.data;
    });
  };

  client.getNotebookServerLogs = (serverName, lines = 250) => {
    const headers = client.getBasicHeaders();
    headers.append("Accept", "text/plain");
    const url = `${client.baseUrl}/notebooks/logs/${serverName}`;

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams: { max_lines: lines }
    }).then((resp) => {
      return resp.data;
    });
  };
}

export default addNotebookServersMethods;
