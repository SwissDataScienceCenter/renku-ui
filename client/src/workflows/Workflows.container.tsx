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

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { WorkflowsCoordinator } from "./Workflows.state";
import { WorkflowDetail as WorkflowDetailPresent, WorkflowsList as WorkflowsListPresent } from "./Workflows.present";


interface WorkflowsListProps {
  client: any;
  fullPath: string;
  model: any;
  reference: string;
  repositoryUrl: string;
  versionUrl: string;
}

const WorkflowsSorting = {
  created: "Creation date",
  executions: "Executions",
  lastExecuted: "Last execution",
  name: "Name",
  workflowType: "Workflow type"
};

function WorkflowsList({ client, fullPath, model, reference, repositoryUrl, versionUrl }: WorkflowsListProps) {
  const workflowsCoordinator = new WorkflowsCoordinator(client, model);
  const workflows = useSelector((state: any) => state.stateModel.workflows);
  const [orderBy, setOrderBy] = useState("created");
  const [orderByAscending, setOrderByAscending] = useState(false);
  const [excludeInactive, setExcludeInactive] = useState(true);
  const toggleAscending = () => setOrderByAscending(!orderByAscending);
  const toggleExcludeInactive = () => setExcludeInactive(!excludeInactive);

  const minVersion = 9;
  const projectVersion = versionUrl != null && versionUrl.length ?
    parseInt(versionUrl.replace(/^\/+|\/+$/g, "")) :
    0;
  const unsupported = projectVersion && projectVersion < minVersion ? true : false;

  useEffect(() => {
    workflowsCoordinator.fetchWorkflowsList(repositoryUrl, reference, versionUrl, unsupported, fullPath);
  }, [repositoryUrl, reference, versionUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const targetChanged = (repositoryUrl + reference) !== workflows.target;
  const versionUrlAvailable = !versionUrl ? false : true;
  const waiting = !versionUrlAvailable || targetChanged;

  return (
    <WorkflowsListPresent
      ascending={orderByAscending} excludeInactive={excludeInactive} fullPath={fullPath} orderBy={orderBy}
      orderByMatrix={WorkflowsSorting} setOrderBy={setOrderBy} toggleAscending={toggleAscending}
      toggleExcludeInactive={toggleExcludeInactive} unsupported={unsupported}
      waiting={waiting} workflows={workflows}
    />
  );
}


function WorkflowDetail({ client, fullPath, model, reference, repositoryUrl, versionUrl }: WorkflowsListProps) {
  const workflowsCoordinator = new WorkflowsCoordinator(client, model);
  const workflow = useSelector((state: any) => state.stateModel.workflow);

  const { id }: Record<string, string> = useParams();
  const workflowId = id;

  // fetch workflow details
  useEffect(() => {
    workflowsCoordinator.fetchWorkflowDetails(workflowId, repositoryUrl, reference, versionUrl);
  }, [workflowId, repositoryUrl, reference, versionUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const targetChanged = (repositoryUrl + reference + workflowId) !== workflow.target;
  const versionUrlAvailable = !versionUrl ? false : true;
  const waiting = !versionUrlAvailable || targetChanged;

  return (<WorkflowDetailPresent waiting={waiting} workflowId={workflowId} workflow={workflow} />);
}


export { WorkflowDetail, WorkflowsList };
