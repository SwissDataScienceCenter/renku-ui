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

export interface RepositoryProviderMatch {
  provider_id: string;
  connection_id?: string;
  repository_metadata?: RepositoryMetadata;
}

export interface RepositoryMetadata {
  git_http_url: string;
  web_url: string;
  permissions: RepositoryPermissions;
}

export interface RepositoryPermissions {
  pull: boolean;
  push: boolean;
}

export interface GetRepositoryMetadataParams {
  repositoryUrl: string;
}

export interface GetRepositoryProbeParams {
  repositoryUrl: string;
}

export type GetRepositoriesProbesResponse = {
  repositoryUrl: string;
  probe: boolean;
}[];

export interface GetRepositoriesProbesParams {
  repositoriesUrls: string[];
}
