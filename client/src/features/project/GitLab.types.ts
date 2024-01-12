/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { Visibilities } from "../../components/visibility/Visibility";
import { PaginatedResponse } from "../../utils/types/pagination.types";

export interface Pagination {
  currentPage?: number;
  firstPageLink?: string;
  lastPageLink?: string;
  nextPage?: number;
  nextPageLink?: string;
  perPage?: number;
  previousPage?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface GitlabProjectResponse {
  visibility: Visibilities;
  path_with_namespace: string;
}

// GitLab Pipelines API

export interface GitLabPipeline {
  id: number;
}

export interface GitLabPipelineJob {
  id: number;
  name: string;
  pipeline: GitLabPipeline;
  status:
    | "success"
    | "running"
    | "created"
    | "pending"
    | "stopping"
    | "failed"
    | "canceled";
  web_url: string;
}

export interface GetPipelineJobByNameParams {
  jobName: string;
  pipelineIds: number[];
  projectId: number;
}

export interface GetPipelinesParams {
  commit?: string;
  projectId: number;
}

export interface RetryPipelineParams {
  pipelineId: number;
  projectId: number;
}

export interface RunPipelineParams {
  projectId: number;
  ref: string;
}

// GitLab Registry API

export interface GitLabRegistryTag {
  location: string;
}

export interface GitLabRegistry {
  id: number;
  name: string;
}

export interface GetRegistryTagParams {
  projectId: number;
  registryId: number;
  tag: string;
}

export interface GetRenkuRegistryParams {
  projectId: string;
}

// GitLab Repository API

export interface GitLabRepositoryBranch {
  default: boolean;
  merged: boolean;
  name: string;
}

export interface GitLabRepositoryCommit {
  author_name: string;
  committed_date: string;
  id: string;
  message: string;
  short_id: string;
  web_url: string;
}

export type GitLabRepositoryBranchList =
  PaginatedResponse<GitLabRepositoryBranch>;
export type GitLabRepositoryCommitList =
  PaginatedResponse<GitLabRepositoryCommit>;

export interface GetRepositoryBranchParams {
  branch: string;
  projectId: string;
}

export interface GetRepositoryBranchesParams {
  page?: number;
  perPage?: number;
  projectId: string;
}

export interface GetAllRepositoryBranchesParams {
  perPage?: number;
  projectId: string;
}

export type GetRepositoryBranchResponse = {
  can_push: boolean;
  commit: {
    author_email: string;
    author_name: string;
    authored_date: string;
    committed_date: string;
    committer_email: string;
    committer_name: string;
    created_at: string;
    id: string;
    message: string;
    parent_ids: unknown;
    short_id: string;
    title: string;
    trailers: unknown;
    web_url: string;
  };
  default: boolean;
  developers_can_merge: boolean;
  developers_can_push: boolean;
  merged: boolean;
  name: string;
  protected: boolean;
  web_url: string;
}[];

export interface GetRepositoryCommitParams {
  commitSha: string;
  projectId: string;
}

export interface GetRepositoryCommits2Params {
  branch: string;
  page?: number;
  perPage?: number;
  projectId: string;
}

export interface GetAllRepositoryCommitsParams {
  branch: string;
  perPage?: number;
  projectId: string;
}

export interface GetConfigFromRepositoryParams {
  commit: string;
  projectId: number;
}
