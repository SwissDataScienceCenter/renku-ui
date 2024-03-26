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

export interface SessionEnvironment {
  container_image: string;
  creation_date: string;
  id: string;
  name: string;
  default_url?: string;
  description?: string;
}

export type SessionEnvironmentList = SessionEnvironment[];

export type SessionLauncher = {
  id: string;
  project_id: string;
  name: string;
  creation_date: string;
  default_url?: string;
  description?: string;
  environment_kind: EnvironmentKind;
} & SessionLauncherEnvironment;

export type EnvironmentKind = "global_environment" | "container_image";

export type SessionLauncherEnvironment =
  | {
      environment_kind: Extract<EnvironmentKind, "global_environment">;
      environment_id: string;
    }
  | {
      environment_kind: Extract<EnvironmentKind, "container_image">;
      container_image: string;
    };

export type SessionLauncherList = SessionLauncher[];

export interface GetProjectSessionLaunchersParams {
  projectId: string;
}

export type AddSessionLauncherParams = {
  default_url?: string;
  description?: string;
  name: string;
  project_id: string;
  environment_kind: EnvironmentKind;
} & SessionLauncherEnvironment;

export interface UpdateSessionLauncherParams {
  launcherId?: string;
  default_url?: string;
  description?: string;
  name?: string;
  environment_kind?: EnvironmentKind;
  environment_id?: string;
  container_image?: string;
}

export interface DeleteSessionLauncherParams {
  launcherId: string;
}
