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

import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "react-router";
import { StateModelProject } from "../features/project/project.types";
import { useCoreSupport } from "../features/project/useProjectCoreSupport";
import {
  useGetWorkflowDetailQuery,
  useGetWorkflowListQuery,
} from "../features/workflows/WorkflowsApi";
import { workflowsSlice } from "../features/workflows/WorkflowsSlice";
import useAppDispatch from "../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";
import { WorkflowsTreeBrowser as WorkflowsTreeBrowserPresent } from "./Workflows.present";

const MIN_CORE_VERSION_WORKFLOWS = 9;

const WorkflowsSorting = {
  authors: "Authors",
  duration: "Estimated duration",
  executions: "Executions",
  lastExecuted: "Last execution",
  name: "Name",
  workflowType: "Workflow type",
};

/* eslint-disable @typescript-eslint/no-explicit-any */

interface WorkflowsListProps {
  fullPath: string;
  reference: string;
  repositoryUrl: string;
}

function deserializeError(error: any) {
  if (!error || !error?.message) return null;
  if (
    error.message &&
    error.message.startsWith("{") &&
    error.message.endsWith("}")
  ) {
    try {
      return JSON.parse(error.message);
    } catch {
      return error.message;
    }
  }
}

function WorkflowsList({
  fullPath,
  reference,
  repositoryUrl,
}: WorkflowsListProps) {
  // Get the workflow id from the query parameters
  const { workflowId } = useParams<"workflowId">();
  const selected = workflowId ?? "";

  const { defaultBranch } = useLegacySelector<StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );
  const { coreSupport } = useCoreSupport({
    gitUrl: repositoryUrl,
    branch: defaultBranch,
  });
  const {
    apiVersion,
    backendAvailable,
    computed: coreSupportComputed,
    metadataVersion,
  } = coreSupport;

  // Verify backend support and availability
  const unsupported =
    (coreSupportComputed && !backendAvailable) ||
    (metadataVersion && metadataVersion < MIN_CORE_VERSION_WORKFLOWS) ||
    false;

  // Configure the functions to dispatch workflowsDisplay changes
  const dispatch = useAppDispatch();
  const toggleAscending = () =>
    dispatch(workflowsSlice.actions.toggleAscending());
  const toggleExpanded = (workflowId: string) =>
    dispatch(workflowsSlice.actions.toggleExpanded({ workflowId }));
  const toggleInactive = () =>
    dispatch(workflowsSlice.actions.toggleInactive());
  const setOrderProperty = (newProperty: string) =>
    dispatch(workflowsSlice.actions.setOrderProperty({ newProperty }));
  const setDetailExpanded = (targetDetails: Record<string, any>) =>
    dispatch(workflowsSlice.actions.setDetail({ targetDetails }));
  const workflowsDisplay = useAppSelector(
    ({ workflowsDisplay }) => workflowsDisplay
  );

  // Fetch workflow list
  const skipList = !metadataVersion || !repositoryUrl || unsupported;
  const workflowsQuery = useGetWorkflowListQuery(
    !skipList
      ? {
          apiVersion,
          gitUrl: repositoryUrl,
          metadataVersion,
          reference,
          fullPath,
        }
      : skipToken
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
  const waiting =
    !metadataVersion || !coreSupportComputed || workflowsQuery.isLoading;

  // Fetch workflow details
  const workflowDetailQuery = useGetWorkflowDetailQuery(
    !skipList && selected
      ? {
          apiVersion,
          gitUrl: repositoryUrl,
          metadataVersion,
          workflowId: selected,
          reference,
          fullPath,
        }
      : skipToken
  );
  const workflow = {
    details: workflowDetailQuery.data,
    error: deserializeError(workflowDetailQuery.error),
    fetched:
      workflowDetailQuery.data !== null && !workflowDetailQuery.isLoading,
    fetching: workflowDetailQuery.isFetching || workflowDetailQuery.isLoading,
    expanded: workflowsDisplay.details,
  };

  const selectedAvailable =
    !!workflows.list?.find((w: any) => w.workflowId === selected) ||
    !!(
      workflow.details?.latest &&
      !!workflows.list?.find((w: any) => w.id === workflow.details?.latest)
    );

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
