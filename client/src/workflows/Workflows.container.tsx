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

import React from "react";
import { RootStateOrAny, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import { WorkflowsTreeBrowser as WorkflowsTreeBrowserPresent } from "./Workflows.present";
import { checkRenkuCoreSupport } from "../utils/helpers/HelperFunctions";
import { useGetWorkflowDetailQuery, useGetWorkflowListQuery } from "../features/workflows/WorkflowsApi";
import { workflowsSlice, useWorkflowsSelector } from "../features/workflows/WorkflowsSlice";


const MIN_CORE_VERSION_WORKFLOWS = 9;

const WorkflowsSorting = {
  authors: "Authors",
  duration: "Estimated duration",
  executions: "Executions",
  lastExecuted: "Last execution",
  name: "Name",
  workflowType: "Workflow type"
};

/* eslint-disable @typescript-eslint/no-explicit-any */

interface WorkflowsListProps {
  fullPath: string;
  reference: string;
  repositoryUrl: string;
  versionUrl: string;
  backendAvailable: boolean;
}

function deserializeError(error: any) {
  if (!error || !error?.message)
    return null;
  if (error.message && error.message.startsWith("{") && error.message.endsWith("}")) {
    try {
      return JSON.parse(error.message);
    }
    catch {
      return error.message;
    }
  }
}

function WorkflowsList({ fullPath, reference, repositoryUrl, versionUrl, backendAvailable }: WorkflowsListProps) {
  // Get the workflow id from the query parameters
  const { id }: Record<string, string> = useParams();
  const selected = id;

  // Verify backend support and availability
  const unsupported = !backendAvailable || !checkRenkuCoreSupport(MIN_CORE_VERSION_WORKFLOWS, versionUrl);

  // Configure the functions to dispatch workflowsDisplay changes
  const dispatch = useDispatch();
  const toggleAscending = () => dispatch(workflowsSlice.actions.toggleAscending());
  const toggleExpanded = (workflowId: string) => dispatch(workflowsSlice.actions.toggleExpanded({ workflowId }));
  const toggleInactive = () => dispatch(workflowsSlice.actions.toggleInactive());
  const setOrderProperty = (newProperty: string) => dispatch(workflowsSlice.actions.setOrderProperty({ newProperty }));
  const setDetailExpanded = (targetDetails: Record<string, any>) =>
    dispatch(workflowsSlice.actions.setDetail({ targetDetails }));
  const workflowsDisplay = useWorkflowsSelector((state: RootStateOrAny) => state[workflowsSlice.name]);

  // Fetch workflow list
  const skipList = !versionUrl || !repositoryUrl || unsupported;
  const workflowsQuery = useGetWorkflowListQuery(
    { coreUrl: versionUrl, gitUrl: repositoryUrl, reference, fullPath },
    { skip: skipList }
  );
  const workflows = {
    list: workflowsQuery.data,
    error: deserializeError(workflowsQuery.error),
    fetched: workflowsQuery.data !== null && !workflowsQuery.isLoading,
    fetching: workflowsQuery.isFetching || workflowsQuery.isLoading,
    expanded: workflowsDisplay.expanded,
    showInactive: workflowsDisplay.showInactive,
    orderAscending: workflowsDisplay.orderAscending,
    orderProperty: workflowsDisplay.orderProperty,
  };
  const waiting = !versionUrl || workflowsQuery.isLoading;

  // Fetch workflow details
  const skipDetails = (skipList || !selected) ? true : false;
  const workflowDetailQuery = useGetWorkflowDetailQuery(
    { coreUrl: versionUrl, gitUrl: repositoryUrl, workflowId: selected, reference, fullPath },
    { skip: skipDetails }
  );
  const workflow = {
    details: workflowDetailQuery.data,
    error: deserializeError(workflowDetailQuery.error),
    fetched: workflowDetailQuery.data !== null && !workflowDetailQuery.isLoading,
    fetching: workflowDetailQuery.isFetching || workflowDetailQuery.isLoading,
    expanded: workflowsDisplay.details,
  };

  const selectedAvailable =
    (!!workflows.list?.find((w: any) => w.workflowId === selected)) ||
    !!(workflow.details?.latest && !!workflows.list?.find((w: any) => w.id === workflow.details?.latest));

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
