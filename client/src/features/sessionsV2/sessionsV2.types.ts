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

import { ResourceClass } from "../dataServices/dataServices.types";

export interface SessionEnvironment {
  container_image: string;
  creation_date: string;
  id: string;
  name: string;
  default_url?: string;
  description?: string;
  uid?: number;
  gid?: number;
  working_directory?: string;
  mount_directory?: string;
  port?: number;
  environment_kind: EnvironmentKind;
  command?: string[];
  args?: string[];
}

export type SessionEnvironmentList = SessionEnvironment[];

export type SessionLauncher = {
  id: string;
  project_id: string;
  name: string;
  creation_date: string;
  description?: string;
  resource_class_id?: number;
  environment: SessionLauncherEnvironment;
};

export type EnvironmentKind = "GLOBAL" | "CUSTOM";

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

export type SessionLauncherEnvironmentParams =
  | {
      id: string;
    }
  | {
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
      command?: string[] | null;
      args?: string[] | null;
    };

export type SessionLauncherList = SessionLauncher[];

export interface GetProjectSessionLaunchersParams {
  projectId: string;
}

export type AddSessionLauncherParams = {
  description?: string;
  name: string;
  project_id: string;
  resource_class_id?: number;
  environment: SessionLauncherEnvironmentParams;
};

export interface UpdateSessionLauncherParams {
  launcherId?: string;
  description?: string;
  name?: string;
  resource_class_id?: number;
  environment?: SessionLauncherEnvironmentParams;
}

export interface DeleteSessionLauncherParams {
  launcherId: string;
}

export interface SessionLauncherForm {
  name: string;
  container_image: string;
  description: string;
  default_url: string;
  environment_kind: EnvironmentKind;
  environment_id: string;
  resourceClass: ResourceClass;
  port: number;
  working_directory: string;
  uid: number;
  gid: number;
  mount_directory: string;
  command: string;
  args: string;
}
