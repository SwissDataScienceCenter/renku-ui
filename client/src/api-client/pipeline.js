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

import { API_ERRORS } from "./errors";

function addPipelineMethods(client) {
  client.runPipeline = async (projectId, defaultBranch = "master") => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/pipeline`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        ref: defaultBranch
      })
    });
  };

  /**
   * Get the array of pipeline from GitLab
   *
   * @param {number|string} projectId - project id or slug
   * @param {string} commit - commit id of the pipelines
   */
  client.getPipelines = (projectId, commitId) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/projects/${projectId}/pipelines`;
    const parameters = { sha: commitId };

    return client.clientFetch(url, {
      method: "GET",
      headers,
      queryParams: parameters
    }).then(response => response.data);
  };

  /**
   * Get all jobs for a specific pipeline
   *
   * @param {number|string} projectId - project id or slug
   * @param {number} pipelineId - pipeline id
   */
  client.getPipelineJobs = (projectId, pipelineId) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/projects/${projectId}/pipelines/${pipelineId}/jobs`;

    return client.clientFetch(url, {
      method: "GET",
      headers,
    }).then(response => response.data);
  };

  /**
   * Get single job
   *
   * @param {number|string} projectId - project id or slug
   * @param {number} jobId - job id
   */
  client.getProjectJob = (projectId, jobId) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/projects/${projectId}/jobs/${jobId}`;

    return client.clientFetch(url, {
      method: "GET",
      headers,
    }).then(response => response.data);
  };

  /**
   * Run again all jobs for a specific pipeline
   *
   * @param {number|string} projectId - project id or slug
   * @param {number} pipelineId - pipeline id
   */
  client.retryPipeline = (projectId, pipelineId) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/projects/${projectId}/pipelines/${pipelineId}/retry`;

    return client.clientFetch(url, {
      method: "POST",
      headers,
    }).then(response => response.data);
  };

  /**
   * Get the list of available container registries. It should be 1 per project if there
   * is at least a valid tagged image, otherwise 0.
   *
   * @param {number|string} projectId - project id or slug
   */
  client.getRegistries = (projectId) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/projects/${projectId}/registry/repositories`;

    return client.clientFetch(url, {
      method: "GET",
      headers,
    }).then(response => response.data);
  };

  /**
   * Get the image data for a specific tag.
   *
   * @param {number|string} projectId - project id or slug
   * @param {number} registryId - registry id
   * @param {string} tag - tag name, our convention uses the first 7 chars from commit id
   */
  client.getRegistryTag = (projectId, registryId, tag) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/projects/${projectId}/registry/repositories` +
      `/${registryId}/tags/${tag}`;

    return client.clientFetch(url, { method: "GET", headers })
      .then(response => response.data)
      .catch((error) => {
        // 404 is expected when nothing is available for the target tag
        if (error.case === API_ERRORS.notFoundError)
          return null;
        throw error;
      });
  };
}

export default addPipelineMethods;
