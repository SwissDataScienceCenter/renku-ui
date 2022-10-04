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


/**
 * Enrich workflows list by adding or modifying required by the UI
 * @param workflowsList - list of workflows ar returned by the API
 * @returns list containing enhanced workflows objects
 */
function adjustWorkflowsList(workflowsList: Array<Record<string, any>>) {
  return workflowsList.map(workflow => {
    return {
      ...workflow,
      active: workflow.touches_existing_files,
      executions: workflow.number_of_executions,
      itemType: "workflow",
      lastExecuted: workflow.last_executed,
      tagList: workflow.keywords,
      timeCaption: workflow.created,
      title: workflow.name,
      url: "/workflow" + workflow.id, // ! UPDATE ME!
      workflowType: workflow.type,
    };
  });
}

class WorkflowsCoordinator {
  client: any;
  model: any;

  constructor(client: any, model: any) {
    this.client = client;
    this.model = model.subModel("workflows");
  }

  async fetchWorkflowsList(repositoryUrl: string, reference: string, versionUrl: string, unsupported: boolean) {
    // do not fetch if we don't have the specific core url or already fetching
    if (!versionUrl || unsupported) return;
    if (this.model.get("fetching") === true) return;

    // pre-fetching state changes
    let newWorkflowsState: Record<string, any> = { fetching: true };
    if (this.model.get("error"))
      newWorkflowsState.error = null;
    this.model.setObject(newWorkflowsState);

    const workflowsList = await this.client.fetchWorkflowsList(repositoryUrl, reference, versionUrl);

    // post fetch state changes
    newWorkflowsState = { fetching: false, fetched: new Date(), target: repositoryUrl + reference };
    if (workflowsList?.error)
      newWorkflowsState.error = workflowsList.error;
    else if (workflowsList?.result)
      newWorkflowsState.list = { $set: adjustWorkflowsList(workflowsList.result.plans) };
    else
      newWorkflowsState.list = { $set: [] };
    this.model.setObject(newWorkflowsState);
  }
}

export { WorkflowsCoordinator };
