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

import { gql } from "apollo-boost";

function addGraphMethods(client) {
  // using simpleFetch instead of clientFetch because we can get a 4xx response
  // https://github.com/SwissDataScienceCenter/renku-graph/tree/master/webhook-service
  client.checkGraphWebhook = (projectId) => {
    const url = `${client.baseUrl}/projects/${projectId}/graph/webhooks/validation`;
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
    const url = `${client.baseUrl}/projects/${projectId}/graph/webhooks`;
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

  client.checkGraphStatus = (projectId) => {
    const url = `${client.baseUrl}/projects/${projectId}/graph/status`;
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, {method:'GET', headers}).then((resp) => {
      return resp.data;
    });
  }

  /**
   * Get the lineage nodes and edges
   *
   * @param {string} projectPath   project slug (username/projectname)
   * @param {string} filePath   full file path
   * @example client.getFileLineage("myGitlabUser/myGitlabProject",
   *  "3bf1c3c424833228708087686584afb77899f702",
   *  "figs/grid_plot.png")
   */
  client.getFileLineage = (projectPath, filePath) => {
    const query = gql`
      query getLineage($projectPath: ProjectPath!, $filePath: FilePath!) {
        lineage(projectPath: $projectPath, filePath: $filePath) {
          nodes { id, label, type },
          edges { source, target }
        }
      }
    `;
    const variables = { projectPath, filePath };

    return client.graphqlFetch(query, variables).then(data => data.lineage, d => null);
  }
}

export default addGraphMethods;
