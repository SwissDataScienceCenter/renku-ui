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

function addPipelineMethods(client) {
  client.runPipeline = (projectId) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/pipeline`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        ref: "master"
      })
    })
  }

  /**
   * Get the array of pipeline from GitLab
   * 
   * @param {number|string} projectId - project id or slug
   * @param {string} commit - commit id of the pipelines
   */
  client.getPipelines = (projectId, commitId) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    const url = `${client.baseUrl}/projects/${projectId}/pipelines`;
    const parameters = { sha: commitId };

    return client.clientFetch(url, {
      method: 'GET',
      headers,
      queryParams: parameters
    }).then(response => response.data);
  }

  /**
   * Get all jobs for a specific pipeline
   * 
   * @param {number|string} projectId - project id or slug
   * @param {number} pipelineId - pipeline id
   */
  client.getPipelineJobs = (projectId, pipelineId) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    const url = `${client.baseUrl}/projects/${projectId}/pipelines/${pipelineId}/jobs`;

    return client.clientFetch(url, {
      method: 'GET',
      headers,
    }).then(response => response.data);
  }

  /**
   * Run again all jobs for a specific pipeline
   * 
   * @param {number|string} projectId - project id or slug
   * @param {number} pipelineId - pipeline id
   */
  client.retryPipeline = (projectId, pipelineId) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    const url = `${client.baseUrl}/projects/${projectId}/pipelines/${pipelineId}/retry`;

    return client.clientFetch(url, {
      method: 'POST',
      headers,
    }).then(response => response.data);
  }
}

export default addPipelineMethods;
