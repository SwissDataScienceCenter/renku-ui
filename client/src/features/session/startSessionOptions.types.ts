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

export interface StartSessionOptions {
  branch: string;
  cloudStorage: SessionCloudStorage[];
  commit: string;
  defaultUrl: string;
  dockerImageBuildStatus: DockerImageBuildStatus;
  dockerImageStatus: DockerImageStatus;
  environmentVariables: SessionEnvironmentVariable[];
  lfsAutoFetch: boolean;
  pinnedDockerImage: string;
  sessionClass: number;
  storage: number;
}

export interface SessionCloudStorage {
  active: boolean;
  configuration: Record<string, boolean | number | string | undefined>;
  name: string;
  private: boolean;
  readonly: boolean;
  source_path: string;
  sensitive_fields?: { name: string; help: string; value: string }[];
  storage_id: string | null;
  storage_type: string;
  supported: boolean;
  target_path: string;
}

// ? See: ./components/options/SessionProjectDockerImage.md
export type DockerImageBuildStatus =
  | "unknown"
  | "available"
  | "checking-ci-registry"
  | "checking-ci-image"
  | "checking-ci-pipelines"
  | "checking-ci-jobs"
  | "ci-job-running"
  | "checking-ci-done-registry"
  | "checking-ci-done-image"
  | "waiting-ci-image"
  | "error";

export type DockerImageStatus =
  | "unknown"
  | "available"
  | "not-available"
  | "building";

export interface SessionEnvironmentVariable {
  name: string;
  value: string;
}
