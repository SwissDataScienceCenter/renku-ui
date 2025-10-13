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

export interface ResourcePoolForm {
  name: string;
  public: boolean;
  quota: ResourcePoolFormQuota;
  hibernationThresholdMinutes?: number;
  idleThresholdMinutes?: number;
  clusterId?: string;
  /* eslint-disable-next-line spellcheck/spell-checker */
  remote?: RemoteConfigurationFirecrest;
}

export interface ResourcePoolFormQuota {
  cpu: number;
  memory: number;
  gpu: number;
}

export interface RemoteConfigurationFirecrest {
  /** Kind of remote resource pool */
  kind: "firecrest";
  providerId?: string;
  apiUrl: string;
  systemName: string;
  partition?: string;
}

export interface ResourceClassForm {
  name: string;
  cpu: number;
  memory: number;
  gpu: number;
  default_storage: number;
  max_storage: number;
  default: boolean;
  tolerations: ResourceClassFormToleration[];
  node_affinities: ResourceClassFormNodeAffinity[];
}

export interface ResourceClassFormToleration {
  label: string;
}

export interface ResourceClassFormNodeAffinity {
  key: string;
  required_during_scheduling?: boolean;
}

export interface UpdateResourcePoolThresholdsForm {
  idleThresholdMinutes?: number;
  hibernationThresholdMinutes?: number;
}
