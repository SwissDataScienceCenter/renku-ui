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

const ExpectedAnnotations = {
  "renku.io": {
    required: ["branch", "commit-sha", "namespace", "projectId", "projectName"],
    default: {
      "branch": "unknown",
      "commit-sha": "00000000",
      "namespace": "unknown",
      "projectId": 0,
      "projectName": "unknown"
    }
  }
}

function cleanAnnotations(annotations, domain) {
  let cleaned = {};
  if (domain === "renku.io") {
    const prefix = `${domain}/`;
    ExpectedAnnotations[domain].required.forEach(annotation => {
      cleaned[annotation] = annotations[prefix+annotation] !== undefined ?
        annotations[prefix+annotation] :
        ExpectedAnnotations[domain].default[annotation];
    });
  }
  return {...cleaned};
}

function addNotebookServersMethods(client) {
  client.getNotebookServers = (id, branch, commit) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers`;
    return client.clientFetch(url, {
      method: 'GET',
      headers
    }).then(resp => {
      let { servers } = resp.data;
      if (id) {
        // TODO: remove this filter when this API will support projectId filtering
        servers = Object.keys(servers)
          .filter(server => {
            const annotations = cleanAnnotations(servers[server]["annotations"], "renku.io");
            if (parseInt(annotations.projectId) === parseInt(id)) {
              return server;
            }
            return null;
          })
          .reduce((obj, key) => {obj[key] = servers[key]; return obj}, {});
      }
      return { "data": servers };
    });
  }

  client.stopNotebookServer = (serverName) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers/${serverName}`;

    return client.clientFetch(url, {
      method: 'DELETE',
      headers
    }, "text")
      .then(resp => {
        return true;
      });
  }

  client.getNotebookServerOptions = (projectUrl, commitId) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/${projectUrl}/${commitId}/server_options`;

    return client.clientFetch(url, {
      method: 'GET',
      headers
    }).then((resp) => {
      let { data } = resp;
      Object.keys(data).forEach(key => {
        data[key].selected = data[key].default;
      })
      return data;
    });
  }

  client.startNotebook = (projectUrl, branchName, commitId, options) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    const url = `${client.baseUrl}/notebooks/${projectUrl}/${commitId}`;

    return client.clientFetch(url, {
      method: 'POST',
      headers,
      queryParams: { branch: branchName },
      body: JSON.stringify(options)
    }).then((resp) => {
      return resp.data;
    });
  }
}

export { cleanAnnotations, ExpectedAnnotations };
export default addNotebookServersMethods;
