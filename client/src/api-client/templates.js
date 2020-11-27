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

function addTemplatesMethods(client) {
  /**
   * Fetch and read manifest file from the target repository containing Renku templates.
   *
   * @param {string} url - Target repository containing a manifest file and renku templates.
   * @param {string} ref - Reference, possibly a tag. Commits and branches are valid.
   */
  client.getTemplatesManifest = (url, ref = "master") => {
    const parameters = { url, ref };
    const urlApi = `${client.baseUrl}/renku/templates.read_manifest`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    return client.clientFetch(
      urlApi,
      { method: "GET", headers, queryParams: parameters }
    ).then(resp => resp.data);
  };

  /**
   * Create a new project.
   *
   * @param {Object} data - new project data, consisting in:
   *   - url: template url,
   *   - ref: template reference (tag, commit or branch),
   *   - identifier: template identifier as specified in the manifest,
   *   - parameters: list of variables as { key, value },
   *   - project_repository: target repository, usually fixed for each RenkuLab deployment,
   *   - project_namespace: target namespace,
   *   - project_name: target name
   */
  client.postNewProject = (data) => {
    const urlApi = `${client.baseUrl}/renku/templates.create_project`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    return client.clientFetch(
      urlApi,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      }
    ).then(resp => resp.data);
  };
}


export default addTemplatesMethods;
