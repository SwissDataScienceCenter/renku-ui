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
import { MigrationStartScopes, ProjectIndexingStatuses } from "./ProjectEnums";

export interface CoreServiceParams {
  versionUrl?: string;
}

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

export interface IDataset extends DatasetAbstract {
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

// ! TODO: remove this since we have another interface
export type IMigration = {
  check: {
    core_renku_version?: string;
    project_supported?: boolean;
    project_renku_version?: string;
    core_compatibility_status: {
      project_metadata_version?: string;
      migration_required?: boolean;
      current_metadata_version?: string;
    };
    dockerfile_renku_status: {
      latest_renku_version?: string;
      dockerfile_renku_version?: string;
      automated_dockerfile_update?: boolean;
      newer_renku_available?: boolean;
    };
    template_status: {
      newer_template_available?: boolean;
      template_id?: string;
      automated_template_update?: boolean;
      template_ref?: string;
      project_template_version?: string;
      template_source?: string;
      latest_template_version?: string;
    };
  };
  core: {
    versionUrl: string | null;
    backendAvailable: boolean | null;
    error: boolean | null;
    fetched: boolean | null;
    fetching: boolean | null;
  };
  migrating: boolean;
  migration_status: unknown | null;
  migration_error: unknown | null;
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
  webhook: {
    progress: unknown;
  };
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

export interface MigrationStatusDetails {
  core_renku_version: string;
  project_renku_version: string;
  project_supported: boolean;
  core_compatibility_status:
    | CoreSectionError
    | {
        current_metadata_version: string;
        migration_required: boolean;
        project_metadata_version: string;
        type: "detail";
      };
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
  is_delayed: boolean;
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
