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
import { Hdd } from "react-bootstrap-icons";

import type { StorageFlavor } from "../sessionsV2/api/computeResources.api";

type StorageFlavorShape = Pick<StorageFlavor, "min_size">;

interface StorageFlavorValuesProps {
  className?: string;
  compact?: boolean;
  storageFlavor: StorageFlavorShape;
}

export default function StorageFlavorValues({
  className,
  compact,
  storageFlavor,
}: StorageFlavorValuesProps) {
  const { min_size } = storageFlavor;
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
      <StorageFlavorValue
        icon={<Hdd className={iconClasses} />}
        title="Minimum disk size"
      >
        {min_size}&nbsp;GB{compact ? "" : " min disk"}
      </StorageFlavorValue>
    </span>
  );
}

interface StorageFlavorValueProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

function StorageFlavorValue({
  children,
  icon,
  title,
}: StorageFlavorValueProps) {
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
