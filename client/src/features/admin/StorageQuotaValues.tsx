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

import cx from "classnames";
import type { ReactNode } from "react";
import { Hdd, HddStack } from "react-bootstrap-icons";

import type { StorageQuota } from "../sessionsV2/api/computeResources.api";

type StorageQuotaShape = Pick<
  StorageQuota,
  "storage_flavor_min_size" | "max_size" | "total_size"
>;

interface StorageQuotaValuesProps {
  className?: string;
  compact?: boolean;
  storageQuota: StorageQuotaShape;
}

export default function StorageQuotaValues({
  className,
  compact,
  storageQuota,
}: StorageQuotaValuesProps) {
  const { storage_flavor_min_size, max_size, total_size } = storageQuota;
  const iconClasses = cx("bi", "flex-shrink-0");

  return (
    <span
      className={cx(
        "d-inline-flex",
        "flex-wrap",
        compact ? "gap-2" : "gap-3",
        className,
      )}
    >
      <StorageQuotaValue
        icon={<Hdd className={iconClasses} />}
        title="disk size"
      >
        {compact ? (
          <>
            {storage_flavor_min_size}&ndash;{max_size}&nbsp;GB
          </>
        ) : (
          <>
            min {storage_flavor_min_size}&nbsp;GB &ndash; max {max_size}&nbsp;GB
          </>
        )}
      </StorageQuotaValue>
      <StorageQuotaValue
        icon={<HddStack className={iconClasses} />}
        title="Total quota size"
      >
        {total_size}&nbsp;GB{compact ? "" : " total quota"}
      </StorageQuotaValue>
    </span>
  );
}

interface StorageQuotaValueProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

function StorageQuotaValue({ children, icon, title }: StorageQuotaValueProps) {
  return (
    <span
      className={cx("align-items-center", "d-inline-flex", "gap-1")}
      title={title}
    >
      {icon}
      {children}
    </span>
  );
}
