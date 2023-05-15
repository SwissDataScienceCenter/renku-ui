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

interface Creator {
  affiliation: string | null;
  email: string;
}

type DatasetAbstract = {
  annotations: string[];
  description: string;
  identifier: string;
  keywords: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mediaContent: any;
  name: string;
  title: string;
};

interface DatasetCore extends DatasetAbstract {
  creators: Creator[];
  created_at: string;
}

interface DatasetKg extends DatasetAbstract {
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

type IDatasetFiles = {
  fetched: boolean;
  fetching: boolean;
  files: IDatasetFile[];
};

type IDatasetFile = {
  path: string;
  added: string;
  name: string;
};

type IMigration = {
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

interface Part {
  atLocation: string;
}

interface Published {
  creator: Creator[];
  datePublished?: string;
}

type StateModelProject = {
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

type UsedIn = {
  _links: [
    {
      rel: string;
      href: string;
    }
  ];
  path: string;
  name: string;
};

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

    /** Session class from the resource pool API */
    sessionClass?: number;

    /** Disk storage in Gigabytes */
    storage?: number;

    legacyConfig?: {
      cpuRequest?: number;
      memoryRequest?: string;
      storageRequest?: string;
      gpuRequest?: number;
    };
    unknownConfig?: {
      [key: string]: unknown;
    };
  };
}

export type {
  DatasetCore,
  DatasetKg,
  IDataset,
  IDatasetFile,
  IDatasetFiles,
  IMigration,
  StateModelProject,
};
