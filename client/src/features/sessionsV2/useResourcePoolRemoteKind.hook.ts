/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import type { ResourcePoolWithIdFiltered } from "./api/computeResources.api";

export type RemoteKind = "firecrest" | "runai" | "cluster";

export const REMOTE_KIND_TEXT: Record<
  RemoteKind,
  { title: string; description: string }
> = {
  firecrest: {
    title: "HPC resource pool",
    description: "on a remote HPC system through FirecREST", // eslint-disable-line spellcheck/spell-checker
  },
  runai: {
    title: "Run:ai resource pool",
    description: "on a Run:ai cluster",
  },
  cluster: {
    title: "Remote resource pool",
    description: "on a remote cluster",
  },
};

// Returns how a resource pool runs sessions remotely. Null when it's local.
export default function useResourcePoolRemoteKind(
  resourcePool: ResourcePoolWithIdFiltered | undefined,
): RemoteKind | null {
  if (resourcePool == null) return null;
  if (resourcePool.remote != null) return resourcePool.remote.kind;
  if (resourcePool.cluster_id != null) return "cluster";
  return null;
}
