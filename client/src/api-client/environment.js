/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

function addEnvironmentMethods(client) {
  /**
   * Get the versions of the RenkuLab components.
   */
  client.getComponentsVersion = async () => {
    const urlApi = `${client.uiserverUrl}/api/versions`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    return client.clientFetch(urlApi, {
      method: "GET",
      headers: headers
    }).then(resp => resp.data);
  };

  /**
   * Check core version availability
   *
   * @param {string} version - target core version to test
   */
  client.checkCoreAvailability = async (version) => {
    const urlApi = `${client.uiserverUrl}/api/renku/${version}/version`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");
    const resp = await client.clientFetch(urlApi, {
      method: "GET",
      headers: headers
    });
    if (resp.error) {
      if (resp.error.reason === "Not found")
        return { available: false };
      return resp;
    }
    if (resp.data.result?.supported_project_version)
      return { ...resp.data.result, available: true };
    return resp.data;
  };
}

export default addEnvironmentMethods;
