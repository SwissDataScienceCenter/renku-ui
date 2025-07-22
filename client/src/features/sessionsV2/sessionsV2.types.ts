/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { ReactNode } from "react";
import { ResourceClass } from "../dataServices/dataServices.types";
import { CloudStorageDetailsOptions } from "../project/components/cloudStorage/projectCloudStorage.types";
import type {
  BuildParametersPost,
  DefaultUrl,
  EnvironmentGid,
  EnvironmentId,
  EnvironmentKind,
  EnvironmentPort,
  EnvironmentPost,
  EnvironmentUid,
  SessionLauncherEnvironmentParams,
  SessionLauncherPost,
} from "./api/sessionLaunchersV2.api";

export type SessionLauncherEnvironment = {
  id?: string;
  name: string;
  description?: string;
  container_image: string;
  default_url?: string;
  uid?: number;
  gid?: number;
  working_directory?: string;
  mount_directory?: string;
  port?: number;
  environment_kind: EnvironmentKind;
  command?: string[];
  args?: string[];
};

export interface GetProjectSessionLauncherParams {
  id: string;
}
export interface GetProjectSessionLaunchersParams {
  projectId: string;
}

export type AddSessionLauncherParams = {
  description?: string;
  name: string;
  project_id: string;
  resource_class_id?: number;
  disk_storage?: number;
  environment: SessionLauncherEnvironmentParams;
};

export interface UpdateSessionLauncherParams {
  launcherId: string;
  description?: string;
  name?: string;
  resource_class_id?: number;
  disk_storage?: number | null;
  environment?: SessionLauncherEnvironmentParams;
}

export interface DeleteSessionLauncherParams {
  launcherId: string;
}

export interface SessionLauncherForm
  extends Pick<
      SessionLauncherPost,
      "name" | "description" | "disk_storage" | "project_id"
    >,
    Pick<
      EnvironmentPost,
      "container_image" | "mount_directory" | "working_directory"
    >,
    Pick<
      BuildParametersPost,
      | "builder_variant"
      | "frontend_variant"
      | "repository"
      | "repository_revision"
      | "context_dir"
    > {
  resourceClass: ResourceClass;

  // Substitute for Environment Kind and Environment Image Source in forms
  environmentSelect: "global" | "custom + image" | "custom + build";

  // For "global" environments
  environmentId: EnvironmentId;

  // For "custom" + "image" environments
  default_url: DefaultUrl;
  uid: EnvironmentUid;
  gid: EnvironmentGid;
  port: EnvironmentPort;

  args: string;
  command: string;
}

export interface SessionResources {
  requests?: {
    cpu?: number;
    gpu?: number;
    memory?: number;
    storage?: number;
  };
}

export interface SessionStatus {
  message?: string;
  state: "running" | "starting" | "stopping" | "failed" | "hibernated";
  will_hibernate_at?: string | null;
  will_delete_at?: string | null;
  ready_containers: number;
  total_containers: number;
}

export type SessionList = SessionV2[];
export interface SessionV2 {
  image: string;
  name: string;
  resources: SessionResources;
  started: string | null;
  status: SessionStatus;
  url: string;
  project_id: string;
  launcher_id: string;
  resource_class_id: number;
}

export interface SessionCloudStorageV2 {
  configuration: CloudStorageDetailsOptions;
  readonly: boolean;
  source_path: string;
  storage_id: string;
  target_path: string;
}

export interface LaunchSessionParams {
  launcher_id: string;
  disk_storage?: number;
  cloudstorage?: SessionCloudStorageV2[];
  resource_class_id?: number;
}

export interface PatchSessionParams {
  session_id: string;
  state?: Extract<"running" | "hibernated", SessionStatus["state"]>;
  resource_class_id?: number;
}

export interface GetLogsParams {
  session_id: string;
  max_lines: number;
}

export interface StopSessionParams {
  session_id: string;
}
export interface SessionImageParams {
  image_url: string;
}

export interface DockerImage {
  error?: unknown;
}

export interface BuilderSelectorOption {
  label: string;
  value: string;
  description?: ReactNode;
}

export enum LauncherStep {
  Environment = "environment",
  LauncherDetails = "launcherDetails",
}
