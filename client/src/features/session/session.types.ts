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

export interface DockerImage {
  image: string;
  available: boolean;
}

export interface GetDockerImageParams {
  image: string;
}

export interface ServerOption<T extends number | string = number | string> {
  allow_any_value?: boolean;
  default: T;
  displayName: string;
  options: T[];
  order: number;
  type: "enum" | "int" | "float" | "boolean";
}

export interface ServerOptions {
  defaultUrl: ServerOption<string>;
  legacyOptions: Record<string, ServerOption>;
}

export type ServerOptionsResponse = Record<string, ServerOption>;

export type Sessions = Record<string, Session>;

export interface Session {
  annotations: Record<string, unknown>;
  cloudstorage: unknown;
  image: string;
  name: string;
  resources: SessionResources;
  started: string;
  state: unknown;
  status: SessionStatus;
  url: string;
}

interface SessionResources {
  requests?: { cpu?: number; memory?: string; storage?: string };
  usage?: { cpu?: number; memory?: string; storage?: string };
}

interface SessionStatus {
  message: string;
  state: "failed" | "running" | "starting" | "stopping";
  [key: string]: unknown;
}

export interface GetSessionsRawResponse {
  servers: Record<string, Session>;
}

export interface StartSessionParams {
  //       "branch": "master",
  // "cloudstorage": [],
  // "commit_sha": "string",
  // "default_url": "/lab",
  // "environment_variables": {},
  // "image": null,
  // "lfs_auto_fetch": false,
  // "namespace": "string",
  // "notebook": null,
  // "project": "string",
  // "resource_class_id": null,
  // "serverOptions": {
  //   "cpu_request": 0,
  //   "defaultUrl": "/lab",
  //   "disk_request": "1G",
  //   "gpu_request": 0,
  //   "lfs_auto_fetch": false,
  //   "mem_request": "0G"
  // },
  // "storage": 1

  // branch
  // :
  // "pinned-image"
  // commit_sha
  // :
  // "6493d331ae07e69c70f32699d41b2e73e0cd48a2"
  // default_url
  // :
  // "/lab"
  // environment_variables
  // :
  // {foo: "bar"}
  // image
  // :
  // "python:3"
  // lfs_auto_fetch
  // :
  // false
  // namespace
  // :
  // "johann.thiebaut1"
  // project
  // :
  // "another-playground-project"
  // resource_class_id
  // :
  // 2
  // storage
  // :
  // 4

  branch: string;
  cloudstorage?: unknown[];
  commit: string;
  defaultUrl: string;
  environmentVariables?: Record<string, string>;
  image?: string;
  lfsAutoFetch: boolean;
  namespace: string;
  project: string;
  sessionClass: number;
  storage: number;
}
