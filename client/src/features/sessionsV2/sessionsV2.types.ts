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

import { CSSProperties, ReactNode } from "react";
import { Icon } from "react-bootstrap-icons";

import {
  SessionType,
  SubmissionId,
} from "~/features/sessionsV2/api/sessionsV2.generated-api";
import type { ResourceClassWithId } from "./api/computeResources.api";
import type {
  BuildParametersPost,
  DefaultUrl,
  EnvironmentGid,
  EnvironmentId,
  EnvironmentPort,
  EnvironmentPost,
  EnvironmentUid,
  LauncherType,
  SessionLauncherPost,
} from "./api/sessionLaunchersV2.api";

export interface SvgIconProps {
  className?: string;
  style?: CSSProperties;
}

export type LauncherCategory = "session" | "job";

/** Shared API discriminator for `launcher_type` and `session_type`. */
export type SessionLauncherKind = LauncherType & SessionType;

export const SESSION_LAUNCHER_KIND = {
  INTERACTIVE: "interactive",
  NON_INTERACTIVE: "non-interactive",
} as const satisfies Record<string, SessionLauncherKind>;

export type LauncherApiType = SessionLauncherKind;

export type EnvironmentSelectOption =
  | "global"
  | "custom + image"
  | "custom + build";

export interface LauncherCategoryDefinition {
  apiType: LauncherApiType;
  text: {
    display: string;
    inline: string;
    action: string;
  };
  icon: Icon;
  description: string;
  allowedEnvironmentSelects: EnvironmentSelectOption[];
}

export interface SessionLauncherForm
  extends
    Pick<
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
  environmentSelect: EnvironmentSelectOption;

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
  state:
    | "running"
    | "starting"
    | "stopping"
    | "failed"
    | "hibernated"
    | "succeeded";
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
  session_type: SessionLauncherKind;
  submission_id?: SubmissionId;
  command_args?: string[] | null;
  job_completed_at?: string | null;
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
  succeeded = "succeeded",
}

export interface SessionEnvironmentVariable {
  name: string;
  value: string;
}

export type ImageStatus =
  | "only-old-image-available"
  | "no-available"
  | "available";
