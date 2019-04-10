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
  client.getNotebookServers = () => {
    let headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers`;
    return client.clientFetch(url, {
      method: 'GET',
      headers: headers
    }).then(resp => {
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

export default addNotebookServersMethods;
