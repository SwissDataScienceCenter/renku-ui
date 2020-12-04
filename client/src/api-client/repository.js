/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

import { API_ERRORS, alertAPIErrors } from "./errors";


function addRepositoryMethods(client) {

  client.postCommit = (projectId, commitPayload) => {
    const headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/repository/commits`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(commitPayload)
    });
  };

  client.getCommits = async (projectId, ref = "master", per_page = 100) => {
    const url = `${client.baseUrl}/projects/${projectId}/repository/commits`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const queryParams = { ref_name: ref, per_page };
    const options = { method: "GET", headers, queryParams };
    const commitsIterator = client.clientIterableFetch(url, { options });

    let commits = [], pagination = {}, error = false;
    try {
      for await (const commitsPage of commitsIterator) {
        commits = [...commits, ...commitsPage.data];
        pagination = { ...commitsPage.pagination, done: false };
      }
      pagination.done = true;
    }
    catch (exception) {
      error = exception;
    }
    finally {
      return { data: commits, pagination, error };
    }
  };

  client.getProjectReadme = (projectId) => {
    return client.getRepositoryFile(projectId, "README.md", "master", "raw")
      .then(text => {
        return { text: text || "Could not find a README.md file. Why don't you add one to the repository?" };
      });
  };

  client.getRepositoryFileMeta = (projectId, path, ref = "master") => {
    let headers = client.getBasicHeaders();
    const encodedPath = encodeURIComponent(path);
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/files/${encodedPath}?ref=${ref}`, {
        method: "HEAD",
        headers: headers
      }, client.returnTypes.full, false
    ).then(response => {
      const headers = response.headers;
      return {
        blobId: headers.get("X-Gitlab-Blob-Id"),
        commitId: headers.get("X-Gitlab-Commit-Id"),
        contentSha256: headers.get("X-Gitlab-Content-Sha256"),
        encoding: headers.get("X-Gitlab-Encoding"),
        fileName: headers.get("X-Gitlab-File-Name"),
        filePath: headers.get("X-Gitlab-File-Path"),
        lastCommitId: headers.get("X-Gitlab-Last-Commit-Id"),
        ref: headers.get("X-Gitlab-Ref"),
        size: headers.get("X-Gitlab-Size")
      };
    });
  };

  client.getProjectFile = (projectId, path, ref = "master", alertOnErr = true) => {
    let headers = client.getBasicHeaders();
    const encodedPath = encodeURIComponent(path);
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/files/${encodedPath}/raw?ref=${ref}`, {
        method: "GET",
        headers: headers
      }, client.returnTypes.text, alertOnErr
    );
  };

  client.getRepositoryCommit = async (projectId, commitSHA) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/commits/${commitSHA}`, {
        method: "GET",
        headers: headers
      },
      client.returnTypes.full,
      false
    ).then(response => {
      return response.json();
    });
  };


  // TODO: Merge to following methods into one
  client.getRepositoryFile = async (projectId, path, ref = "master", encoding = "base64") => {
    let headers = client.getBasicHeaders();
    const pathEncoded = encodeURIComponent(path);
    const raw = encoding === "raw" ? "/raw" : "";
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/files/${pathEncoded}${raw}?ref=${ref}`, {
        method: "GET",
        headers: headers
      },
      client.returnTypes.full,
      false
    )
      .then(response => {
        if (encoding === "raw") return response.text();
        if (encoding === "base64") return response.json();
      });
    // .catch((error) => {
    //   if (error.case === API_ERRORS.notFoundError) {
    //     console.error(`Attempted to access non-existing repository file ${path}`)
    //     return undefined;
    //   }
    // })
  };


  client.getRepositoryTree = (
    projectId,
    { path = "", recursive = false, per_page = 500, page = 1, previousResults = [] } = {}
  ) => {
    let headers = client.getBasicHeaders();
    const queryParams = {
      path,
      recursive,
      per_page,
      page
    };


    // TODO: Think about general pagination strategy for API client.
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/repository/tree`, {
      method: "GET",
      headers,
      queryParams
    }, client.returnTypes.full, false)
      .then(response => {
        if (response.headers.get("X-Next-Page")) {
          return response.json().then(data => {
            return client.getRepositoryTree(projectId, {
              path,
              recursive,
              per_page,
              previousResults: previousResults.concat(data),
              page: response.headers.get("X-Next-Page")
            });
          });
        }

        return response.json().then(data => {
          return previousResults.concat(data);
        });

      })
      .catch((error) => {
        if (error.case === API_ERRORS.notFoundError)
          return [];


        alertAPIErrors(error);

      });
  };

  // ? Unfortunately, the API doesn't offer a way to query only for unmerged branches
  // ? REF: https://docs.gitlab.com/ee/api/branches.html
  client.getBranches = async (projectId, per_page = 100) => {
    const url = `${client.baseUrl}/projects/${projectId}/repository/branches`;
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    const queryParams = { per_page };
    const options = { method: "GET", headers, queryParams };
    const branchesIterator = client.clientIterableFetch(url, { options });

    let branches = [], pagination = {}, error = false;
    try {
      for await (const branchesPage of branchesIterator) {
        branches = [...branches, ...branchesPage.data];
        pagination = { ...branchesPage.pagination, done: false };
      }
      pagination.done = true;
    }
    catch (exception) {
      error = exception;
    }
    finally {
      return { data: branches, pagination, error };
    }
  };

}

export default addRepositoryMethods;
