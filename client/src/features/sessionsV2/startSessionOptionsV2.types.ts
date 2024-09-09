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

import type {
  DockerImageStatus,
  SessionEnvironmentVariable,
} from "../session/startSessionOptions.types";
import type { CloudStorageGetRead } from "../projectsV2/api/storagesV2.api";

export interface SessionStartCloudStorageConfiguration {
  active: boolean;
  cloudStorage: CloudStorageGetRead;
  sensitiveFieldDefinitions: {
    friendlyName: string;
    help: string;
    name: string;
  }[];
  sensitiveFieldValues: Record<string, string>;
  saveCredentials: boolean;
  savedCredentialFields: string[];
}

export interface StartSessionOptionsV2 {
  cloudStorage: SessionStartCloudStorageConfiguration[];
  defaultUrl: string;
  dockerImageStatus: DockerImageStatus;
  environmentVariables: SessionEnvironmentVariable[];
  lfsAutoFetch: boolean;
  repositories: SessionRepository[];
  sessionClass: number;
  storage: number;
}

export interface SessionRepository {
  url: string;
}
