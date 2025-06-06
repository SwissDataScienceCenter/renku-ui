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

import {
  CoreRepositoryParams,
  CoreResponse,
  CoreVersionUrl,
} from "../../utils/types/coreService.types";
import { PostDataset as DatasetAsApiBody } from "../project/dataset/datasetCore.api";

export interface DeleteDatasetParams
  extends CoreVersionUrl,
    CoreRepositoryParams {
  slug: string;
}

interface DatasetOperationResponse {
  slug: string;
  remote_branch: string;
}

export type DeleteDatasetResponse = CoreResponse<DatasetOperationResponse>;

export interface DeleteDataset {
  slug: string;
  remoteBranch: string;
}

export interface PostDatasetParams
  extends CoreVersionUrl,
    CoreRepositoryParams {
  dataset: DatasetAsApiBody;
  edit: boolean;
}

export interface PostDataset {
  slug: string;
  remoteBranch: string;
}

export type PostDatasetResponse = CoreResponse<DatasetOperationResponse>;

export interface AddFilesParams extends CoreVersionUrl, CoreRepositoryParams {
  files: DatasetFile[];
  slug: string;
}

export interface DatasetFile {
  file_id?: string;
  file_path?: string;
  file_url?: string;
  job_id?: string;
}
export interface AddFilesOperationResponse extends DatasetOperationResponse {
  files: DatasetFile[];
}

export type AddFilesResponse = CoreResponse<AddFilesOperationResponse>;

export interface AddFiles {
  files: DatasetFile[];
  slug: string;
  remoteBranch: string;
}
