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

function addIssueMethods(client) {

  client.getProjectIssues = (projectId) => {
    let headers = client.getBasicHeaders();

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/issues?scope=all`, {
      method: "GET",
      headers: headers
    });

  };


  client.postProjectIssue = (projectPathWithNamespace, issue) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    return client.clientFetch(`${client.baseUrl}/projects/${encodeURIComponent(projectPathWithNamespace)}/issues`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(issue)
    });

  };


  client.getProjectIssue = (projectId, issueIid) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/issues/${issueIid}/`, {
      method: "GET",
      headers: headers,
    });

  };


  client.getContributions = (projectId, issueIid) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/issues/${issueIid}/notes`, {
      method: "GET",
      headers: headers
    });

  };


  client.postContribution = (projectId, issueIid, contribution) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");

    return client.clientFetch(`${client.baseUrl}/projects/${projectId}/issues/${issueIid}/notes`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ body: contribution })
    });

  };


  client.closeIssue = (projectId, issueIid) => {
    return updateIssue(client, projectId, issueIid, { state_event: "close" });
  };

  client.reopenIssue = (projectId, issueIid) => {
    return updateIssue(client, projectId, issueIid, { state_event: "reopen" });
  };
}


function updateIssue(client, projectId, issueIid, body) {
  let headers = client.getBasicHeaders();
  headers.append("Content-Type", "application/json");

  return client.clientFetch(`${client.baseUrl}/projects/${projectId}/issues/${issueIid}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(body)
  });
}

export default addIssueMethods;
