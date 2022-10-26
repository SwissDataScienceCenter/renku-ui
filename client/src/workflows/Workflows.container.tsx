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

import React, { useEffect } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { WorkflowsCoordinator } from "./Workflows.state";
import { WorkflowsTreeBrowser as WorkflowsTreeBrowserPresent } from "./Workflows.present";
import { checkRenkuCoreSupport } from "../utils/helpers/HelperFunctions";


const MIN_CORE_VERSION_WORKFLOWS = 9;

interface WorkflowsListProps {
  client: any;
  fullPath: string;
  model: any;
  reference: string;
  repositoryUrl: string;
  versionUrl: string;
}

const WorkflowsSorting = {
  authors: "Authors",
  duration: "Estimated duration",
  executions: "Executions",
  lastExecuted: "Last execution",
  name: "Name",
  workflowType: "Workflow type"
};

function WorkflowsList({ client, fullPath, model, reference, repositoryUrl, versionUrl }: WorkflowsListProps) {
  const workflowsCoordinator = new WorkflowsCoordinator(client, model);
  const workflows = useSelector((state: RootStateOrAny) => state.stateModel.workflows);
  const { id }: Record<string, string> = useParams();
  const selected = id;
  const unsupported = !checkRenkuCoreSupport(MIN_CORE_VERSION_WORKFLOWS, versionUrl);
  const workflow = useSelector((state: RootStateOrAny) => state.stateModel.workflow);
  // ? either the workflow is available, or the latest version is available
  const selectedAvailable =
    (!!workflows.list.find((w: any) => w.workflowId === selected)) ||
    (workflow.details?.latest && !!workflows.list.find((w: any) => w.id === workflow.details.latest));

  const toggleAscending = () => workflowsCoordinator.toggleOrderAscending();
  const toggleExpanded = (workflowId: string) => workflowsCoordinator.toggleExpanded(workflowId);
  const toggleInactive = () => workflowsCoordinator.toggleInactive();
  const setDetailExpanded = (targetElement: Record<string, any> = {}) =>
    workflowsCoordinator.setDetailExpanded(targetElement);
  const setOrderProperty = (newProperty: string) => workflowsCoordinator.setOrderProperty(newProperty);

  // fetch workflows list
  useEffect(() => {
    workflowsCoordinator.fetchWorkflowsList(repositoryUrl, reference, versionUrl, unsupported, fullPath);
  }, [repositoryUrl, reference, versionUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // fetch workflow details
  useEffect(() => {
    workflowsCoordinator.fetchWorkflowDetails(selected, repositoryUrl, reference, versionUrl, fullPath);
  }, [selected, repositoryUrl, reference, versionUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // ? consider removing this or including the workflow detail target too
  const targetChanged = (repositoryUrl + reference) !== workflows.target;
  const versionUrlAvailable = !versionUrl ? false : true;
  const waiting = !versionUrlAvailable || targetChanged;

  return (
    <WorkflowsTreeBrowserPresent
      ascending={workflows.orderAscending}
      expanded={workflows.expanded}
      fullPath={fullPath}
      orderBy={workflows.orderProperty}
      orderByMatrix={WorkflowsSorting}
      selected={selected}
      selectedAvailable={selectedAvailable}
      setDetailExpanded={setDetailExpanded}
      setOrderBy={setOrderProperty}
      showInactive={workflows.showInactive}
      toggleAscending={toggleAscending}
      toggleExpanded={toggleExpanded}
      toggleInactive={toggleInactive}
      unsupported={unsupported}
      waiting={waiting}
      workflows={workflows}
      workflow={workflow}
    />
  );
}

export { WorkflowsList };
