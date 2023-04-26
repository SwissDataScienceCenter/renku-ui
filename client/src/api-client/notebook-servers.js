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

import { FETCH_DEFAULT } from "./index";
import { RETURN_TYPES } from "./utils";

function addNotebookServersMethods(client) {
  client.getNotebookServers = (
    namespace,
    project,
    branch,
    commit,
    anonymous = false
  ) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers`;
    let parameters = {};
    if (namespace) parameters.namespace = decodeURIComponent(namespace);
    if (project) parameters.project = project;
    if (branch) parameters.branch = branch;
    if (commit) parameters.commit_sha = commit;

    return client
      .clientFetch(
        url,
        { method: "GET", headers, queryParams: parameters },
        FETCH_DEFAULT.returnType,
        FETCH_DEFAULT.alertOnErr,
        FETCH_DEFAULT.reLogin,
        anonymous
      )
      .then((resp) => {
        return { data: resp.data.servers };
      });
  };

  client.stopNotebookServer = (serverName, force = false) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/servers/${serverName}`;
    let parameters = {};
    if (force) parameters.force = true;

    return client
      .clientFetch(
        url,
        {
          method: "DELETE",
          headers,
          queryParams: parameters,
        },
        "text"
      )
      .then(() => {
        return true;
      });
  };

  client.getNotebookServerOptions = (anonymous = false) => {
    const headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/notebooks/server_options`;

    return client
      .clientFetch(
        url,
        { method: "GET", headers },
        FETCH_DEFAULT.returnType,
        FETCH_DEFAULT.alertOnErr,
        FETCH_DEFAULT.reLogin,
        anonymous
      )
      .then((resp) => {
        let { data } = resp;

        // ? rename defaultUrl to default_url to prevent conflicts later with project options
        if (data && "defaultUrl" in data) {
          data.default_url = data.defaultUrl;
          delete data.defaultUrl;
        }

        Object.keys(data).forEach((key) => {
          data[key].selected = data[key].default;
        });
        return data;
      });
  };

  client.startNotebook = (
    namespacePath,
    projectPath,
    branchName,
    commitId,
    image,
    options,
    env_variables = {}
  ) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const url = `${client.baseUrl}/notebooks/servers`;
    let notebook;

    // ? rename default_url to legacy defaultUrl
    if (
      options &&
      options.serverOptions &&
      "default_url" in options.serverOptions
    ) {
      options.serverOptions.defaultUrl = options.serverOptions.default_url;
      delete options.serverOptions.default_url;
    }
    if (
      options &&
      options.serverOptions &&
      "notebook" in options.serverOptions
    ) {
      notebook = options.serverOptions.notebook;
      delete options.serverOptions.notebook;
    }

    let parameters = {
      namespace: decodeURIComponent(namespacePath),
      project: projectPath,
      commit_sha: commitId,
      branch: branchName,
      notebook,
      environment_variables: env_variables,
      ...options,
    };
    if (image) parameters.image = image;

    return client
      .clientFetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(parameters),
      })
      .then((resp) => {
        return resp.data;
      })
      .catch((error) => {
        if (
          error.errorData &&
          error.errorData.error &&
          error.errorData.error.message
        ) {
          const err = new Error(error.errorData.error.message);
          err.cause = error;
          throw err;
        }
      });
  };

  client.getNotebookServerLogs = (serverName, lines = 250) => {
    const headers = client.getBasicHeaders();
    headers.append("Accept", "text/plain");
    const url = `${client.baseUrl}/notebooks/logs/${serverName}`;

    return client
      .clientFetch(url, {
        method: "GET",
        headers,
        queryParams: { max_lines: lines },
      })
      .then((resp) => {
        return resp.data;
      });
  };

  client.getProjectAutosaves = async (namespace, project) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const projectId = encodeURIComponent(`${namespace}/${project}`); // %2F
    const url = `${client.baseUrl}/notebooks/${projectId}/autosave`;

    let response;
    try {
      response = await client.clientFetch(url, { method: "GET", headers });
    } catch (errorResponse) {
      if (errorResponse?.errorData?.error?.message)
        return errorResponse.errorData.error.message;

      return errorResponse;
    }
    return response.data;
  };

  client.deleteProjectAutosave = async (namespace, project, autosave) => {
    const headers = client.getBasicHeaders();
    const projectId = encodeURIComponent(`${namespace}/${project}`); // %2F
    const autosaveSafe = encodeURIComponent(autosave);
    const url = `${client.baseUrl}/notebooks/${projectId}/autosave/${autosaveSafe}`;

    // the API doesn't return any response, hence returning `true` or `false` based on the response status
    try {
      const response = await client.clientFetch(
        url,
        { method: "DELETE", headers },
        RETURN_TYPES.full
      );
      if (response.status >= 200 && response.status < 400) return true;
      return false;
    } catch (errorResponse) {
      return false;
    }
  };

  client.getImageStatus = async (registryUrl) => {
    const queryParams = { image_url: registryUrl };
    const url = `${client.baseUrl}/notebooks/images`;

    return client.simpleFetch(url, "GET", queryParams).then((resp) => {
      if (resp.status === 200) return true;
      else if (resp.status === 404) return false;

      // Throw error for any other case
      throw new Error(`Error ${resp.status}`);
    });
  };
}

export default addNotebookServersMethods;
