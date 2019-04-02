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

function addGraphMethods(client) {
  // using simpleFetch instead of clientFetch because we can get a 4xx response and we never have a body
  // https://github.com/SwissDataScienceCenter/renku-graph/tree/master/webhook-service
  client.checkGraphWebhook = (projectId) => {
    const url = `${client.baseUrl}/projects/${projectId}/graph-hooks/validation`;
    return client.simpleFetch(url, 'POST').then((resp) => {
      if (resp.status === 200) {
        return true;
      }
      else if (resp.status === 404) {
        return false;
      }
      else {
        // erros expected: 401, 500
        throw new Error(`Error ${resp.status}`);
      }
    });
  }

  client.createGraphWebhook = (projectId) => {
    const url = `${client.baseUrl}/projects/${projectId}/graph-hooks`;
    return client.simpleFetch(url, 'POST').then((resp) => {
      if (resp.status === 200 || resp.status === 201) {
        return true;
      }
      else if (resp.status === 404) {
        return false;
      }
      else {
        // erros expected: 500
        throw new Error(`Error ${resp.status}`);
      }
    });
  }

}

export default addGraphMethods;
