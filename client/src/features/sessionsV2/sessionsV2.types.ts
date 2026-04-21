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

import type { ReactNode } from "react";

import type { ResourceClassWithId } from "./api/computeResources.api";
import type {
  BuildParametersPost,
  DefaultUrl,
  EnvironmentGid,
  EnvironmentId,
  EnvironmentPort,
  EnvironmentPost,
  EnvironmentUid,
  SessionLauncherPost,
} from "./api/sessionLaunchersV2.api";

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
      | "context_dir"
      | "frontend_variant"
      | "repository_revision"
      | "repository"
    > {
  resourceClass: ResourceClassWithId;

  // Substitute for Environment Kind and Environment Image Source in forms
  environmentSelect: "global" | "custom + image" | "custom + build";

  // For "global" environments
  environmentId: EnvironmentId;

  // For "custom + image" environments
  default_url: DefaultUrl;
  uid: EnvironmentUid;
  gid: EnvironmentGid;
  port: EnvironmentPort;

  args: string;
  command: string;
  strip_path_prefix: boolean;

  // For "custom + build" environments
  platform: string;
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

export interface BuilderSelectorOption<T extends string = string> {
  label: string;
  value: T;
  description?: ReactNode;
}

export enum LauncherStep {
  Environment = "environment",
  LauncherDetails = "launcherDetails",
}

export type SessionStatusState = keyof typeof SessionStatusStateEnum;

export enum SessionStatusStateEnum {
  failed = "failed",
  running = "running",
  starting = "starting",
  stopping = "stopping",
  hibernated = "hibernated",
}

export interface SessionEnvironmentVariable {
  name: string;
  value: string;
}

export interface SessionLauncherResourceUsageAvailable {
  hours: number | undefined;
  totalLimit: number | undefined;
  quotaEnforced: boolean; // TODO: Replace this placeholder with the actual value when available from the API
}
