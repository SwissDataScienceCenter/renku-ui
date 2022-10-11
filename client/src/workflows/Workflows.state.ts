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

import { Url } from "../utils/helpers/url";
import { workflowsSchema } from "../model/RenkuModels";


const PLANS_PREFIX = "/plans/";


/**
 * Enrich workflows list by adding or modifying required by the UI
 * @param workflowsList - list of workflows ar returned by the API
 * @returns list containing enhanced workflows objects
 */
function adjustWorkflowsList(workflowsList: Array<Record<string, any>>, fullPath: string) {
  return workflowsList.map(workflow => {
    return {
      ...workflow,
      active: workflow.touches_existing_files,
      created: workflow.created ? new Date(workflow.created) : workflow.created,
      executions: workflow.number_of_executions,
      indentation: 0,
      itemType: "workflow",
      lastExecuted: workflow.last_executed ? new Date(workflow.last_executed) : workflow.last_executed,
      tagList: workflow.keywords,
      timeCaption: workflow.created,
      title: workflow.name,
      url: Url.get(Url.pages.project.workflows.detail, {
        namespace: "", path: fullPath, target: "/" + workflow.id.replace(PLANS_PREFIX, "")
      }),
      urlSingle: Url.get(Url.pages.project.workflows.single, {
        namespace: "", path: fullPath, target: "/" + workflow.id.replace(PLANS_PREFIX, "")
      }),
      workflowId: workflow.id.replace(PLANS_PREFIX, ""),
      workflowType: workflow.type,
    };
  });
}

class WorkflowsCoordinator {
  client: any;
  workflowModel: any;
  workflowsModel: any;

  constructor(client: any, model: any) {
    this.client = client;
    this.workflowModel = model.subModel("workflow");
    this.workflowsModel = model.subModel("workflows");
  }

  async fetchWorkflowsList(
    repositoryUrl: string, reference: string, versionUrl: string, unsupported: boolean, fullPath: string
  ) {
    // reset on target change
    const target = repositoryUrl + reference;
    const oldTarget = this.workflowsModel.get("target");
    if (oldTarget && target !== oldTarget) {
      const pristine = workflowsSchema.createInitialized();
      this.workflowsModel.setObject({ $set: pristine });
    }

    // do not fetch if we don't have the specific core url or already fetching
    if (!versionUrl || unsupported) return;
    if (this.workflowsModel.get("fetching") === true) return;

    // pre-fetching state changes
    let newWorkflowsState: Record<string, any> = { fetching: true };
    if (this.workflowsModel.get("error"))
      newWorkflowsState.error = null;
    this.workflowsModel.setObject(newWorkflowsState);

    const workflowsList = await this.client.fetchWorkflowsList(repositoryUrl, reference, versionUrl);

    // post fetch state changes
    newWorkflowsState = { fetching: false, fetched: new Date(), target: repositoryUrl + reference };
    if (workflowsList?.error)
      newWorkflowsState.error = workflowsList.error;
    else if (workflowsList?.result)
      newWorkflowsState.list = { $set: adjustWorkflowsList(workflowsList.result.plans, fullPath) };
    else
      newWorkflowsState.list = { $set: [] };
    this.workflowsModel.setObject(newWorkflowsState);
  }

  async fetchWorkflowDetails(
    workflowId: string, repositoryUrl: string, reference: string, versionUrl: string
  ) {
    // do not fetch if we don't have the specific core url or already fetching the same resource
    if (!versionUrl || !workflowId) return;
    if (this.workflowModel.get("fetching") === true && this.workflowModel.get("mounted") === workflowId) return;

    // pre-fetching state changes
    let newWorkflowState: Record<string, any> = { fetching: true };
    if (this.workflowModel.get("error"))
      newWorkflowState.error = null;
    this.workflowModel.setObject(newWorkflowState);

    const workflowFullId = PLANS_PREFIX + workflowId;
    const workflowDetails = await this.client.fetchWorkflowDetails(
      workflowFullId, repositoryUrl, reference, versionUrl
    );

    // post-fetch state changes -- to be ignored when the fetch is outdated
    newWorkflowState = { fetching: false, fetched: new Date(), target: repositoryUrl + reference + workflowId };
    if (workflowDetails?.error)
      newWorkflowState.error = workflowDetails.error;
    else if (workflowDetails?.result)
      newWorkflowState.details = { $set: workflowDetails.result };
    else
      newWorkflowState.details = { $set: {} };
    this.workflowModel.setObject(newWorkflowState);
  }

  toggleExpanded(workflowId: string) {
    const expanded = this.workflowsModel.get("expanded");
    let newExpanded: string[] = [];
    if (expanded.includes(workflowId))
      newExpanded = expanded.filter((e: any) => e !== workflowId);
    else
      newExpanded = [...expanded, workflowId];
    this.workflowsModel.set("expanded", newExpanded);
  }

  toggleInactive() {
    this.workflowsModel.set("showInactive", !this.workflowsModel.get("showInactive"));
  }

  toggleOrderAscending() {
    this.workflowsModel.set("orderAscending", !this.workflowsModel.get("orderAscending"));
  }

  setOrderProperty(newProperty: string) {
    this.workflowsModel.set("orderProperty", newProperty);
  }
}


/**
 * Temporary function to simulate a response
 * @param workflowId - real id to keep the simulated response data coherent (also for the cache comparison)
 * @returns fake response
 */
// ! TODO: move this to a cypress test
async function tmpReturnResponse(workflowId: string) { // eslint-disable-line
  await new Promise(r => setTimeout(r, 500));
  return {
    "error": null,
    "result": {
      "id": workflowId,
      "name": "echo-A-09883",
      "description": "Echo a file",
      "creators": [
        {
          "name": "John Doe",
          "email": "jd@example.com",
          "affiliation": "SDSC"
        }
      ],
      "type": "Plan",
      "created": "2022-09-26T13:45:35.171Z",
      "last_executed": "2022-09-26T13:45:35.171Z",
      "keywords": [
        "bio",
        "image-processing"
      ],
      "number_of_executions": 5,
      "touches_existing_files": true,
      "command": "python",
      "full_command": "python myscript.py -i input.txt > output.txt", // eslint-disable-line
      "inputs": [
        {
          "id": "/plans/ecf03c735e9f4554adf14fce6271bd93/inputs/1",
          "plan_id": "/plans/ecf03c735e9f4554adf14fce6271bd93",
          "type": "Input",
          "name": "input-1",
          "description": "string",
          "default_value": "string",
          "prefix": "-p",
          "position": 0,
          "mapped_to": "stdin", // eslint-disable-line
          "encoding_format": [
            "inode/directory"
          ],
          "exists": true
        }
      ],
      "outputs": [
        {
          "id": "/plans/ecf03c735e9f4554adf14fce6271bd93/outputs/2",
          "plan_id": "/plans/ecf03c735e9f4554adf14fce6271bd93",
          "type": "Output",
          "name": "output-2",
          "description": "string",
          "default_value": "string",
          "prefix": "--o=",
          "position": 0,
          "mapped_to": "stdout",
          "encoding_format": [
            "inode/directory"
          ],
          "create_folder": true,
          "exists": true,
          "last_touched_by_this_plan": true
        }
      ],
      "parameters": [
        {
          "id": "/plans/ecf03c735e9f4554adf14fce6271bd93/parameters/1",
          "plan_id": "/plans/ecf03c735e9f4554adf14fce6271bd93",
          "type": "Parameter",
          "name": "string",
          "description": "string",
          "default_value": "string",
          "prefix": "-p",
          "position": 0
        }
      ],
      "success_codes": [
        0
      ],
      "annotations": [
        {
          "id": "/annotations/abcf03c735e9f4554adf14fce6271bd93",
          "source": "renku",
          "body": {}
        }
      ]
    }
  };
}

export { WorkflowsCoordinator };
