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

import { SessionCloudStorageV2 } from "./startSessionOptions.types";

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

export interface SessionStatus {
  details: SessionStatusStep[];
  message?: string;
  readyNumContainers: number;
  state: SessionStatusState;
  totalNumContainers: number;
  [key: string]: unknown;
}

interface SessionStatusStep {
  status: string;
  step: string;
}

export type SessionStatusState = keyof typeof SessionStatusStateEnum;

export enum SessionStatusStateEnum {
  failed = "failed",
  running = "running",
  starting = "starting",
  stopping = "stopping",
  hibernated = "hibernated",
}

export interface GetSessionsRawResponse {
  servers: Record<string, Session>;
}

export interface StartSessionParams {
  branch: string;
  cloudStorageV2: SessionCloudStorageV2[];
  commit: string;
  defaultUrl: string;
  environmentVariables: Record<string, string>;
  image?: string;
  lfsAutoFetch: boolean;
  namespace: string;
  project: string;
  sessionClass: number;
  storage: number;
}

export interface PatchSessionParams {
  sessionName: string;
  state: Extract<"running" | "hibernated", SessionStatusState>;
}

export type CloudStorageDefinitionForSessionApi =
  | {
      configuration: {
        type: "s3";
        endpoint: string;
        access_key_id?: string;
        secret_access_key?: string;
      };
      readonly: boolean;
      source_path: string;
      target_path: string;
    }
  | {
      configuration: {
        type: "azureblob";
        endpoint: string;
        secret_access_key: string;
      };
      readonly: boolean;
      source_path: string;
      target_path: string;
    };
