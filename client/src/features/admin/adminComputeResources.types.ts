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

import { ResourceClass, Resources } from "../dataServices/dataServices.types";

export interface ResourcePoolUser {
  id: string;
}

export interface GetResourcePoolUsersParams {
  resourcePoolId: number;
}

export interface AddResourcePoolParams {
  name: string;
  public: boolean;
  classes: ResourceClassDefinition[];
  quota: Resources;
  idle_threshold?: number;
  hibernation_threshold?: number;
}

type ResourceClassDefinition = Omit<ResourceClass, "id" | "matching">;

export interface UpdateResourcePoolParams {
  resourcePoolId: number;

  name?: string;
  public?: boolean;
  quota?: Resources;
  default?: boolean;
  idle_threshold?: number;
  hibernation_threshold?: number;
}

export interface DeleteResourcePoolParams {
  resourcePoolId: number;
}

export interface AddResourceClassParams extends ResourceClassDefinition {
  resourcePoolId: number;
}

export interface UpdateResourceClassParams
  extends Partial<ResourceClassDefinition> {
  resourcePoolId: number;
  resourceClassId: number;
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

export interface AddResourcePoolForm {
  name: string;
  public: boolean;
  quotaCpu: number;
  quotaMemory: number;
  quotaGpu: number;
  idleThresholdMinutes?: number;
  hibernationThresholdMinutes?: number;
}

export interface UpdateResourcePoolThresholdsForm {
  idleThresholdMinutes?: number;
  hibernationThresholdMinutes?: number;
}
