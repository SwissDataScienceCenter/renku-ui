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

export interface ResourcePool {
  id: number;
  name: string;
  classes: ResourceClass[];
  quota?: Resources;
  default: boolean;
  public: boolean;
}

export interface ResourceClass {
  id: number;
  name: string;
  cpu: number;

  /** Memory (RAM) in Gigabytes */
  memory: number;

  gpu: number;

  /** Max disk storage in Gigabytes */
  max_storage: number;

  /** Default disk storage in Gigabytes */
  default_storage: number;

  default: boolean;

  matching: boolean;
}

export interface Resources {
  cpu: number;
  memory: number;
  gpu: number;
}

export interface ResourcePoolsQueryParams {
  cpuRequest?: number;
  gpuRequest?: number;
  memoryRequest?: number;
  storageRequest?: number;
}

export interface DataServicesError {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
}
