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

import { useMemo } from "react";

import {
  useGetResourcePoolsQuery,
  useGetStorageQuotasQuery,
  type ResourcePoolWithIdFiltered,
  type StorageQuota,
} from "~/features/sessionsV2/api/computeResources.api";

export type ResourcePoolWithStorageQuotas = ResourcePoolWithIdFiltered & {
  storageQuotas: StorageQuota[];
};

export default function useGetStorageQuotasWithResourcePools() {
  const {
    data: resourcePools,
    isLoading: isLoadingResourcePools,
    error: resourcePoolsError,
  } = useGetResourcePoolsQuery({});
  const {
    data: storageQuotas,
    isLoading: isLoadingStorageQuotas,
    error: storageQuotasError,
  } = useGetStorageQuotasQuery();

  const isLoading = isLoadingResourcePools || isLoadingStorageQuotas;
  const error = resourcePoolsError ?? storageQuotasError;

  const mappedStorageQuotas = useMemo(
    () =>
      storageQuotas?.reduce((map, current) => {
        const ls = map.get(current.resource_pool_id) ?? [];
        ls.push(current);
        map.set(current.resource_pool_id, ls);
        return map;
      }, new Map<number, StorageQuota[]>()),
    [storageQuotas],
  );

  const resourcePoolsWithStorageQuotas = useMemo(
    () =>
      resourcePools?.flatMap<ResourcePoolWithStorageQuotas>((rp) => {
        const storageQuotas = mappedStorageQuotas?.get(rp.id) ?? [];
        return storageQuotas.length > 0
          ? [
              {
                ...rp,
                storageQuotas,
              },
            ]
          : [];
      }),
    [mappedStorageQuotas, resourcePools],
  );

  return {
    data: {
      resourcePoolsWithStorageQuotas,
      resourcePools,
      storageQuotas,
    },
    isLoading,
    error,
  };
}
