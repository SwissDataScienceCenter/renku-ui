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

import { Resources } from "../dataServices/dataServices";

export interface AdminComputeResources {
  keycloakToken: string;
  keycloakTokenIsValid: boolean;
}

export interface ResourcePoolUser {
  id: string;
}

export interface GetResourcePoolUsersParams {
  resourcePoolId: number;
}

export interface AddResourcePoolParams {
  name: string;
  public: boolean;
  classes: AddResourcePoolClassPartial[];
  quota: Resources;
}

interface AddResourcePoolClassPartial {
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
}

export interface UpdateResourcePoolParams {
  resourcePoolId: number;

  name?: string;
  public?: boolean;
  quota?: Resources;
  default?: boolean;
}

export interface DeleteResourcePoolParams {
  resourcePoolId: number;
}

export interface AddResourceClassParams {
  resourcePoolId: number;

  name: string;
  cpu: number;
  memory: number;
  gpu: number;
  default_storage: number;
  max_storage: number;
  default: boolean;
}

export interface UpdateResourceClassParams {
  resourcePoolId: number;
  resourceClassId: number;

  name?: string;
  cpu?: number;
  memory?: number;
  gpu?: number;
  default_storage?: number;
  max_storage?: number;
  default?: boolean;
}

export interface DeleteResourceClassParams {
  resourcePoolId: number;
  resourceClassId: number;
}

export interface AddUsersToResourcePoolParams {
  resourcePoolId: number;
  userIds: string[];
}

export interface RemoveUserFromResourcePoolParams {
  resourcePoolId: number;
  userId: string;
}
