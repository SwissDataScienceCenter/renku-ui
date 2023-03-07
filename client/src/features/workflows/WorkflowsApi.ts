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

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  WorkflowDetails, WorkflowDetailsRequestParams, WorkflowListElement, WorkflowRequestParams
} from "./Workflows";
import { Url } from "../../utils/helpers/url";

const PLANS_PREFIX = "/plans/";

/**
 * Convert creators list into a single string
 * @param creators - array of Creators
 * @returns single string of Creators
 */
function stringifyCreators(creators: Array<Record<string, any>>): string {
  const creatorNames = creators.map(c => c.name ? c.name : null);
  return creatorNames.join(" ");
}

/**
 * Enrich workflows list by adding or modifying properties required by the UI
 * @param workflowsList - list of workflows ar returned by the API
 * @returns list containing enhanced workflows objects
 */
function adjustWorkflowsList(workflowsList: Array<Record<string, any>>, fullPath: string): WorkflowListElement[] {
  return workflowsList.map(workflow => {
    return {
      ...workflow,
      active: workflow.touches_existing_files,
      authors: stringifyCreators(workflow.creators),
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
      uniqueId: workflow.id.replace(PLANS_PREFIX, ""),
      workflowId: workflow.id.replace(PLANS_PREFIX, ""),
      workflowType: workflow.type,
    } as WorkflowListElement;
  });
}

/**
 * Enrich workflow details by adding or modifying required by the UI
 * @param workflowDetails - workflow details object as returned by the API
 * @returns object containing enhanced workflow details
 */
function adjustWorkflowDetails(workflowDetails: Record<string, any>, fullPath: string): WorkflowDetails {
  return {
    ...workflowDetails,
    latestUrl: workflowDetails.latest === workflowDetails.id ?
      null :
      Url.get(Url.pages.project.workflows.detail, {
        namespace: "", path: fullPath, target: "/" + workflowDetails.latest.replace(PLANS_PREFIX, "")
      }),
    renkuCommand: `renku workflow execute ${workflowDetails.name}`
  } as WorkflowDetails;
}

export const workflowsApi = createApi({
  reducerPath: "workflowsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getWorkflowList: builder.query<WorkflowListElement[], WorkflowRequestParams>({
      query: (data) => {
        let url = `/renku${data.coreUrl}/workflow_plans.list`;
        let params: Record<string, any> = { git_url: data.gitUrl };
        if (data.reference)
          params.branch = data.reference;
        return {
          url: "/ui-server/api" + url,
          params
        };
      },
      transformResponse: (response: any, meta, arg) => {
        if (response.result)
          return adjustWorkflowsList(response.result.plans, arg.fullPath);
        else if (response.error)
          throw new Error(JSON.stringify(response.error));
        throw new Error("Unexpected response");
      }
    }),
    getWorkflowDetail: builder.query<WorkflowDetails, WorkflowDetailsRequestParams>({
      query: (data) => {
        let url = `/renku${data.coreUrl}/workflow_plans.show`;
        const workflowFullId = PLANS_PREFIX + data.workflowId;
        let params: Record<string, any> = { git_url: data.gitUrl, plan_id: workflowFullId };
        if (data.reference)
          params.branch = data.reference;
        return {
          url: "/ui-server/api" + url,
          params
        };
      },
      transformResponse: (response: any, meta, arg) => {
        if (response.result)
          return adjustWorkflowDetails(response.result, arg.fullPath);
        else if (response.error)
          throw new Error(JSON.stringify(response.error));
        throw new Error("Unexpected response");
      },
    }),
  }),
  refetchOnMountOrArgChange: 20,
  keepUnusedDataFor: 5,
});

export const { useGetWorkflowDetailQuery, useGetWorkflowListQuery } = workflowsApi;
