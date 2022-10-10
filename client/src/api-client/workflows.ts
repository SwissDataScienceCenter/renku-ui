/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

function addWorkflowsMethods(client: any) {
  client.fetchWorkflowsList = async (repositoryUrl: string, reference: string = "", versionUrl = null) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url: string = client.versionedCoreUrl("workflow_plans.list", versionUrl);
    let queryParams: Record<string, string> = { git_url: repositoryUrl };
    if (reference)
      queryParams.branch = reference;

    const result = await client.clientFetch(url, { method: "GET", headers, queryParams });
    return result.data ? result.data : result;
  };

  client.fetchWorkflowDetails = async (
    workflowId: string, repositoryUrl: string, reference: string = "", versionUrl = null
  ) => {
    let headers = client.getBasicHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("X-Requested-With", "XMLHttpRequest");

    const url: string = client.versionedCoreUrl("workflow_plans.show", versionUrl);
    let queryParams: Record<string, string> = { plan_id: workflowId, git_url: repositoryUrl };
    if (reference)
      queryParams.branch = reference;

    const result = await client.clientFetch(url, { method: "GET", headers, queryParams });
    return result.data ? result.data : result;
  };
}

export default addWorkflowsMethods;
