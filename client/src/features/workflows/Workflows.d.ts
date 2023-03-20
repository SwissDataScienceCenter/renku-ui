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

import { WorkflowType } from "../../components/entities";


/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Creator {
  affiliation: string,
  email: string,
  name: string
}

// ***** Workflows ***** //

export interface WorkflowListElement {
  active: boolean,
  authors: string,
  created: Date,
  executions: number,
  indentation: number,
  itemType: "workflow",
  lastExecuted: Date,
  tagList: string[],
  timeCaption: Date,
  title: string,
  url: string,
  urlSingle: string,
  uniqueId: string,
  workflowId: string,
  workflowType: WorkflowType
}


// ***** Workflow details ***** //

interface WorkflowDetailsCommon {
  annotations: string
  created: Date,
  creators: Creator[],
  description: string,
  duration: number
  id: string,
  keywords: string[],
  latest: string,
  latestUrl: string?,
  name: string,
  renkuCommand: string?,
  touches_existing_files: boolean,
  type: WorkflowType
}

export interface WorkflowDetailsStep extends WorkflowDetailsCommon {
  command: string,
  full_command: string,
  inputs: Record<string, any>,
  last_executed: Date
  number_of_executions: number,
  outputs: Record<string, any>,
  parameters: string[],
  type: WorkflowType.CompositePlan
}

export interface WorkflowDetailsComposite extends WorkflowDetailsCommon {
  description: string,
  duration: number
  links: Record<string, any>,
  mappings: Record<string, any>,
  plans: Record<string, any>,
  type: WorkflowType.Plan
}

export type WorkflowDetails = WorkflowDetailsStep | WorkflowDetailsComposite;


// ***** Workflow local slices and API parameters ***** //

export interface WorkflowsDisplay {
  details: Record<string, any>, // TODO: add the Details section types
  expanded: string[],
  orderAscending: boolean,
  orderProperty: string,
  showInactive: boolean,
}

export interface WorkflowRequestParams {
  coreUrl: string;
  gitUrl: string;
  reference: string;
  fullPath: string;
}

export interface WorkflowDetailsRequestParams extends WorkflowRequestParams {
  workflowId: string
}

export { WorkflowType };
