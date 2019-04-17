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
  client.getNotebookServers = (id) => {
    let headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers`;
    return client.clientFetch(url, {
      method: 'GET',
      headers: headers
    }).then(resp => {
      if (id) {
        // TODO: the id filter should be applyed in the gateway, pass it as parameter
      }

      return {
        "names": Object.keys(resp.data.servers),
        "data": { ...resp.data.servers }
      }
    });
  }

  client.stopNotebookServer = (serverName) => {
    let headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers/${serverName}`;

    return client.clientFetch(url, {
      method: 'DELETE',
      headers: headers
    }, "text")
      .then(resp => {
        return true;
      });
  }
}

export { cleanAnnotations, ExpectedAnnotations };
export default addNotebookServersMethods;
