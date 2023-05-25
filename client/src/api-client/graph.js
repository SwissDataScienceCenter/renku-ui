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
  /**
   * Get the lineage nodes and edges
   *
   * @param {string} projectPath   project slug (username/projectName)
   * @param {string} filePath   full file path
   * @example client.getFileLineage("myGitlabUser/myGitlabProject",
   *  "3bf1c3c424833228708087686584afb77899f702",
   *  "figs/grid_plot.png")
   */
  client.getFileLineage = (projectPath, filePath) => {
    const urlEncodedPath = encodeURIComponent(filePath);
    const url = `${client.baseUrl}/kg/projects/${projectPath}/files/${urlEncodedPath}/lineage`;
    const headers = client.getBasicHeaders();
    return client.clientFetch(url, { method: "GET", headers }).then((resp) => {
      return resp.data;
    });
  };
}

export default addGraphMethods;
