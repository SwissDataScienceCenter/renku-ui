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

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

import {
  useGetClassesByClassIdQuery,
  useGetResourcePoolsQuery,
  type ResourceClassWithId,
  type ResourceClassWithIdFiltered,
  type ResourcePoolWithIdFiltered,
} from "./api/computeResources.api";

export interface ResourceClassRequests {
  poolName?: string;
  name?: string;
  cpu?: number;
  memory?: number;
  gpu?: number;
  storage?: number;
}

interface UseResourceClassDetailsProps {
  resourceClassId?: number | null;
  storage?: number;
}

interface UseResourceClassDetailsResult {
  resourceClass: ResourceClassWithId | undefined;
  resourcePool: ResourcePoolWithIdFiltered | undefined;
  userResourceClass: ResourceClassWithIdFiltered | undefined;
  resourceRequests: ResourceClassRequests | undefined;
  isLoading: boolean;
}

export default function useResourceClassDetails({
  resourceClassId,
  storage,
}: UseResourceClassDetailsProps): UseResourceClassDetailsResult {
  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const { data: resourceClass, isLoading: isLoadingResourceClass } =
    useGetClassesByClassIdQuery(
      resourceClassId ? { classId: `${resourceClassId}` } : skipToken
    );

  const resourcePool = useMemo(
    () =>
      resourcePools?.find((pool) =>
        pool.classes.find((c) => c.id === resourceClassId)
      ),
    [resourceClassId, resourcePools]
  );

  const userResourceClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == resourceClassId),
    [resourceClassId, resourcePools]
  );

  const resourceRequests = useMemo(() => {
    if (!resourceClass) {
      return undefined;
    }

    return {
      poolName: resourcePool?.name,
      name: resourceClass.name,
      cpu: resourceClass.cpu,
      memory: resourceClass.memory,
      storage: storage ?? resourceClass.default_storage,
      gpu: resourceClass.gpu,
    };
  }, [resourceClass, resourcePool, storage]);

  return {
    resourceClass,
    resourcePool,
    userResourceClass,
    resourceRequests,
    isLoading: isLoadingResourceClass,
  };
}
