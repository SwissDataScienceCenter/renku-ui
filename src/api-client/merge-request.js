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

function addMergeRequestMethods(client) {


  client.createMergeRequest = (projectId, title, source_branch, target_branch, options = {
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


  client.getMergeRequests = (projectId, queryParams = { scope: 'all', state: 'opened' }) => {
    let headers = client.getBasicHeaders();
    const url = projectId ? `${client.baseUrl}/projects/${projectId}/merge_requests` :
      `${client.baseUrl}/merge_requests`
    return client.clientFetch(url, {
      method: 'GET',
      headers,
      queryParams: { ...queryParams, per_page: 100 }
    })
  }


  client.getMergeRequestChanges = (projectId, mrIid) => {
    let headers = client.getBasicHeaders();
    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests/${mrIid}/changes`, {
      method: 'GET',
      headers
    })
  }


  client.getDiscussions = (projectId, mrIid) => {
    let headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests/${mrIid}/discussions`, {
      method: 'GET',
      headers: headers
    })
  }


  client.getMergeRequestCommits = (projectId, mrIid) => {
    let headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests/${mrIid}/commits`, {
      method: 'GET',
      headers: headers
    })
  }


  client.postDiscussion = (projectId, mrIid, contribution) => {
    let headers = client.getBasicHeaders();
    headers.append('Content-Type', 'application/json');

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/merge_requests/${mrIid}/discussions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ body: contribution })
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
              const mrInfo = { mrIid: mrChange.iid, source_branch: mrChange.source_branch }
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
      body: JSON.stringify({ should_remove_source_branch: true })
    })
  }

}
export default addMergeRequestMethods;
