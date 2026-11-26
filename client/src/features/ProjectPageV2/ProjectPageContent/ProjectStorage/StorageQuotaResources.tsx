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

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useGetStorageQuotasByStorageQuotaIdResourcesQuery,
  type StorageQuota,
} from "~/features/sessionsV2/api/computeResources.api";

interface StorageQuotaResourcesProps {
  storageQuota: StorageQuota;
}

export default function StorageQuotaResources({
  storageQuota,
}: StorageQuotaResourcesProps) {
  const {
    data: resources,
    isLoading,
    error,
  } = useGetStorageQuotasByStorageQuotaIdResourcesQuery({
    storageQuotaId: storageQuota.id,
  });

  if (isLoading) {
    return (
      <div className="ps-1">
        <Loader className="me-1" inline size={16} />
        Loading storage quota...
      </div>
    );
  }

  if (error || resources == null) {
    return (
      <>
        <p className="mb-0">Error: could not load quota usage</p>
        <RtkOrDataServicesError dismissible={false} error={error} />
      </>
    );
  }

  const used = resources.allocated_size + resources.requested_size;
  const percent = Math.ceil((used / storageQuota.total_size) * 100);

  return (
    <div className="ps-1">
      <div>
        Free space: {resources.free_size}&nbsp;GB, used space: {used}&nbsp;GB
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Storage quota usage"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
