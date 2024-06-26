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

import { CoreErrorContent } from "../../utils/types/coreService.types";

export interface BaseVersionResponse {
  name: string;
  versions: BaseVersion[];
}

interface BaseVersion {
  version: string;
}

interface CoreComponent extends BaseVersion {
  data: {
    metadata_version: string;
  };
}

export interface CoreVersionDetails extends BaseVersionResponse {
  versions: CoreComponent[];
}

export interface CoreVersionResponse {
  error?: CoreErrorContent;
  result?: CoreVersionDetails;
}

export interface CoreVersions {
  name: string;
  coreVersions: string[];
  metadataVersions: number[];
  details?: CoreComponent[];
}

export interface DataServicesVersionResponse {
  version: string;
}

export interface DataServicesVersion {
  name: string;
  version: string;
}

export type KgVersionResponse = BaseVersionResponse;

export interface KgVersion {
  name: string;
  version: string;
}

interface NotebookComponent extends BaseVersion {
  data: {
    anonymousSessionsEnabled: boolean;
    cloudstorageEnabled: boolean;
    sshEnabled: boolean;
    defaultCullingThresholds: {
      registered: {
        hibernation: number;
        idle: number;
      };
      anonymous: {
        hibernation: number;
        idle: number;
      };
    };
  };
}

export interface NotebooksVersionResponse extends BaseVersionResponse {
  name: string;
  versions: NotebookComponent[];
}

export interface NotebooksVersion {
  anonymousSessionsEnabled: boolean;
  cloudStorageEnabled: boolean;
  defaultCullingThresholds: {
    registered: {
      hibernation: number;
      idle: number;
    };
    anonymous: {
      hibernation: number;
      idle: number;
    };
  };
  name: string;
  sshEnabled: boolean;
  version: string;
}
