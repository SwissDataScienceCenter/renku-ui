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

import { CoreErrorContent } from "../../utils/definitions";
import {
  MigrationStartScopes,
  ProjectIndexingStatuses,
  ProjectMigrationLevel,
} from "./projectEnums";

export interface CoreServiceParams {
  versionUrl?: string;
}

type DatasetImage = {
  _links: { href: string }[];
};

export interface GetDatasetFilesParams extends CoreServiceParams {
  git_url: string;
  name: string;
}

export interface GetDatasetFilesResponse {
  result: {
    files: IDatasetFile[];
    name: string;
  };
  error: {
    userMessage?: string;
    reason?: string;
  };
}

export interface GetDatasetKgParams {
  id: string;
}

export interface IDatasetFiles {
  hasPart: { name: string; atLocation: string }[];
}

export interface Creator {
  name: string;
  affiliation: string | null;
  email: string;
}

export type DatasetAbstract = {
  annotations: string[];
  description: string;
  identifier: string;
  keywords: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mediaContent: any;
  name: string;
  title: string;
};

export interface DatasetCore extends DatasetAbstract {
  creators: Creator[];
  created_at: string;
}

export interface DatasetKg extends DatasetAbstract {
  created: string;
  hasPart: Part[];
  published: Published;
  url: string;
  usedIn: UsedIn;
  sameAs?: string;
}

interface IDataset extends DatasetAbstract {
  created: string;
  exists: boolean;
  insideKg: boolean;
  hasPart?: Part[];
  published?: Published;
  sameAs?: string;
  url?: string;
  usedIn?: UsedIn;
}

export type IDatasetFiles = {
  fetched: boolean;
  fetching: boolean;
  files: IDatasetFile[];
};

export type IDatasetFile = {
  path: string;
  added: string;
  name: string;
};

export interface Part {
  atLocation: string;
}

export interface Published {
  creator: Creator[];
  datePublished?: string;
}

export type StateModelProject = {
  branches: unknown;
  datasets: {
    core: {
      datasets: unknown;
    };
  };
  filesTree?: {
    hash: Record<string, unknown>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forkedFromProject?: any;
  lockStatus: unknown;
  metadata: {
    accessLevel: number;
    defaultBranch: string;
    externalUrl: string;
    httpUrl: string;
    id: string;
    namespace: string;
    path: string;
    pathWithNamespace: string;
    visibility: string;
  };
  migration: unknown;
};

export type UsedIn = {
  _links: [
    {
      rel: string;
      href: string;
    }
  ];
  path: string;
  name: string;
};

export interface CoreSectionError extends CoreErrorContent {
  type: "error";
}

export interface MigrationStatusParams {
  branch?: string;
  gitUrl: string;
}

export interface CoreCompatibilityStatus {
  current_metadata_version: string;
  migration_required: boolean;
  project_metadata_version: string;
  type: "detail";
}

export interface MigrationStatusDetails {
  core_renku_version: string;
  project_renku_version: string;
  project_supported: boolean;
  core_compatibility_status: CoreSectionError | CoreCompatibilityStatus;
  dockerfile_renku_status:
    | CoreSectionError
    | {
        automated_dockerfile_update: boolean;
        dockerfile_renku_version: string;
        latest_renku_version: string;
        newer_renku_available: boolean;
        type: "detail";
      };
  template_status:
    | CoreSectionError
    | {
        automated_template_update: boolean;
        latest_template_version: string;
        newer_template_available: boolean;
        project_template_version: string;
        ssh_supported: boolean;
        template_id: string;
        template_ref: string;
        template_source: string;
        type: "detail";
      };
}

export interface MigrationStatusResponse {
  error?: CoreErrorContent;
  result?: MigrationStatusDetails;
}

export interface MigrationStatus {
  details?: MigrationStatusDetails;
  error?: CoreErrorContent | CoreSectionError;
  errorProject: boolean;
  errorTemplate: boolean;
}

export interface ProjectIndexingStatusResponse {
  activated: boolean;
  progress?: {
    done: number;
    total: number;
    percentage: number;
  };
  details?: {
    status: ProjectIndexingStatuses;
    message: string;
  };
}

export interface ProjectActivateIndexingResponse {
  message: string;
}

export interface MigrationStartParams {
  branch?: string;
  gitUrl: string;
  scope?: MigrationStartScopes;
}

export interface MigrationStartBody {
  branch?: string;
  force_template_update: boolean;
  git_url: string;
  is_delayed?: boolean;
  skip_docker_update: boolean;
  skip_migrations: boolean;
  skip_template_update: boolean;
}

export interface MigrationStartDetails {
  docker_migrated: boolean;
  errors: string[];
  messages: string[];
  remote_branch: string;
  template_migrated: boolean;
  warnings: string[];
  was_migrated: boolean;
}

export interface MigrationStartResponse {
  error?: CoreErrorContent;
  result?: MigrationStartDetails;
}

export type RenkuMigrationLevel = {
  automated: boolean;
  level:
    | ProjectMigrationLevel.Level1
    | ProjectMigrationLevel.Level3
    | ProjectMigrationLevel.Level4
    | ProjectMigrationLevel.Level5
    | ProjectMigrationLevel.LevelE
    | ProjectMigrationLevel.LevelX;
};

export type TemplateMigrationLevel = {
  automated: boolean;
  level:
    | ProjectMigrationLevel.Level1
    | ProjectMigrationLevel.Level2
    | ProjectMigrationLevel.Level3
    | ProjectMigrationLevel.LevelE
    | ProjectMigrationLevel.LevelX;
};

export interface DeleteProjectParams {
  projectPathWithNamespace: string;
}

export interface DeleteProjectResponse {
  accepted: true;
}

export interface ProjectConfig {
  config: ProjectConfigSection;
  default: ProjectConfigSection;
  rawResponse: {
    [key: string]: unknown;
  };
}

export interface ProjectConfigSection {
  sessions?: {
    defaultUrl?: string;

    /** Disk storage in Gigabytes */
    storage?: number;

    lfsAutoFetch?: boolean;

    dockerImage?: string;

    legacyConfig?: {
      cpuRequest?: number;
      memoryRequest?: number;
      gpuRequest?: number;
    };
    unknownConfig?: {
      [key: string]: string;
    };
  };
}
