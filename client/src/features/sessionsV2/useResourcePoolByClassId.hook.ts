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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

import {
  useGetResourcePoolsQuery,
  type ResourcePoolWithIdFiltered,
} from "./api/computeResources.api";

interface UseResourcePoolByClassIdResult {
  resourcePool: ResourcePoolWithIdFiltered | undefined;
  isLoading: boolean;
}

/**
 * Returns the resource pool containing the given resource class, e.g. from
 * `session.resource_class_id` or `launcher.resource_class_id`.
 *
 * Only pools accessible to the current user are considered, so the result is
 * `undefined` when the class belongs to a pool the user cannot see.
 */
export default function useResourcePoolByClassId(
  resourceClassId: number | null | undefined,
): UseResourcePoolByClassIdResult {
  const { data: resourcePools, isLoading } = useGetResourcePoolsQuery(
    resourceClassId != null ? {} : skipToken,
  );

  const resourcePool = useMemo(
    () =>
      resourceClassId == null
        ? undefined
        : resourcePools?.find(({ classes }) =>
            classes.some(({ id }) => id === resourceClassId),
          ),
    [resourceClassId, resourcePools],
  );

  return { resourcePool, isLoading };
}
