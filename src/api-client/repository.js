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

import { API_ERRORS, alertAPIErrors } from './errors'


function addRepositoryMethods(client) {

  client.postCommit = (projectId, commitPayload) => {
    const headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/repository/commits`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(commitPayload)
    })
  }


  client.getCommits = (projectId, ref='master') => {
    let headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/repository/commits?ref_name=${ref}`, {
      method: 'GET',
      headers: headers
    })
      .then(resp => {
        if (resp.data.length > 0) {
          return resp;
        }
        else {
          throw API_ERRORS.notFoundError;
        }
      })
  }


  client.getProjectReadme = (projectId) => {
    return client.getRepositoryFile(projectId, 'README.md', 'master', 'raw')
      .then(text => {
        return {text: text || 'Could not find a README.md file. Why don\'t you add one to the repository?'}
      });
  }


  client.getRepositoryFileMeta = (projectId, path, ref='master') => {
    let headers = client.getBasicHeaders();
    const encodedPath = encodeURIComponent(path);
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/files/${encodedPath}?ref=${ref}`, {
        method: 'HEAD',
        headers: headers
      }, client.returnTypes.full, false
    ).then(response => {
      const headers = response.headers
      return {
        blobId: headers.get('X-Gitlab-Blob-Id'),
        commitId: headers.get('X-Gitlab-Commit-Id'),
        contentSha256: headers.get('X-Gitlab-Content-Sha256'),
        encoding: headers.get('X-Gitlab-Encoding'),
        fileName: headers.get('X-Gitlab-File-Name'),
        filePath: headers.get('X-Gitlab-File-Path'),
        lastCommitId: headers.get('X-Gitlab-Last-Commit-Id'),
        ref: headers.get('X-Gitlab-Ref'),
        size: headers.get('X-Gitlab-Size')
      };
    })
  }

  client.getProjectFile = (projectId, path, ref='master', alertOnErr=true) => {
    let headers = client.getBasicHeaders();
    const encodedPath = encodeURIComponent(path);
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/files/${encodedPath}/raw?ref=${ref}`, {
        method: 'GET',
        headers: headers
      }, client.returnTypes.text, alertOnErr
    )
  }

  client.getRepositoryCommit = (projectId, commitSHA) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/commits/${commitSHA}`, {
        method: 'GET',
        headers: headers
      },
      client.returnTypes.full,
      false
    ).then(response => {
      return response.json();
    })
  }


  // TODO: Merge to following methods into one
  client.getRepositoryFile = (projectId, path, ref='master', encoding='base64') => {
    let headers = client.getBasicHeaders();
    const pathEncoded = encodeURIComponent(path);
    const raw = encoding === 'raw' ? '/raw' : '';
    return client.clientFetch(
      `${client.baseUrl}/projects/${projectId}/repository/files/${pathEncoded}${raw}?ref=${ref}`, {
        method: 'GET',
        headers: headers
      },
      client.returnTypes.full,
      false
    )
      .then(response => {
        if (encoding === 'raw') return response.text();
        if (encoding === 'base64') return response.json();
      })
      // .catch((error) => {
      //   if (error.case === API_ERRORS.notFoundError) {
      //     console.error(`Attempted to access non-existing repository file ${path}`)
      //     return undefined;
      //   }
      // })
  }


  client.getRepositoryTree = (
    projectId,
    {path='', recursive=false, per_page=500, page = 1, previousResults=[]} = {}
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
      method: 'GET',
      headers,
      queryParams
    }, client.returnTypes.full, false)
      .then(response => {
        if(response.headers.get('X-Next-Page')) {
          return response.json().then(data => {
            return client.getRepositoryTree(projectId, {
              path,
              recursive,
              per_page,
              previousResults: previousResults.concat(data),
              page: response.headers.get('X-Next-Page')
            })
          });
        }
        else {
          return response.json().then(data => {
            return previousResults.concat(data)
          });
        }
      })
      .catch((error) => {
        if (error.case === API_ERRORS.notFoundError) {
          return []
        }
        else {
          alertAPIErrors(error);
        }
      })
  }

  // TODO: Unfotunately, the API doesn't offer a way to query only for unmerged branches -
  // TODO: add this capability to the gateway.
  // TODO: Page through results in gateway, for the moment assuming a max of 100 branches seems ok.
  client.getBranches = (projectId) => {
    let headers = client.getBasicHeaders();
    const url = `${client.baseUrl}/projects/${projectId}/repository/branches`;
    return client.clientFetch(url, {
      method: 'GET',
      headers,
      queryParams: {per_page: 100}
    })
  }


  client.createMergeRequest = (projectId, title, source_branch, target_branch, options={
    allow_collaboration: true,
    remove_source_branch: true
  }) => {
    let headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        ...options,
        title,
        source_branch,
        target_branch,
      })
    })
  }


  client.getMergeRequests = (projectId, queryParams={scope: 'all', state: 'opened'}) => {
    let headers = client.getBasicHeaders();
    const url = projectId ? `${client.baseUrl}/projects/${projectId}/merge_requests` :
      `${client.baseUrl}/merge_requests`
    return client.clientFetch(url, {
      method: 'GET',
      headers,
      queryParams: {...queryParams, per_page:100}
    })
  }


  client.getMergeRequestChanges = (projectId, mrIid) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests/${mrIid}/changes`, {
      method: 'GET',
      headers
    })
  }


  // Get all files in a project that have modifications in an open merge request.
  // Return an object giving for each file with modifications an array of merge requests (iids)
  // in which the file is modified.
  // TODO: This method should go to the gateway.
  client.getModifiedFiles = (projectId) => {
    return client.getMergeRequests(projectId)
      .then(resp => {

        // For each MR get the changes introduced by the MR, creates an array
        // of promises.
        const mergeRequestsChanges = resp.data.map((mergeRequest) => {
          return client.getMergeRequestChanges(projectId, mergeRequest.iid)
        });

        // On resolution of all promises, form an object which lists for each file
        // the merge requests that modify this file.
        return Promise.all(mergeRequestsChanges)
          .then((mrChangeResponses) => {
            const openMrs = {};
            mrChangeResponses.forEach((mrChangeResponse) => {
              const mrChange = mrChangeResponse.data
              const changesArray = mrChange.changes;
              const mrInfo = {mrIid: mrChange.iid, source_branch: mrChange.source_branch}
              changesArray
                .filter((change) => change.old_path === change.new_path)
                .forEach((change) => {
                  if (!openMrs[change.old_path]) openMrs[change.old_path] = [];
                  openMrs[change.old_path].push(mrInfo)
                })
            });
            return openMrs;
          });
      })
  }


  client.mergeMergeRequest = (projectId, mrIid) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests/${mrIid}/merge`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({should_remove_source_branch: true})
    })
  }
}

export default addRepositoryMethods;
