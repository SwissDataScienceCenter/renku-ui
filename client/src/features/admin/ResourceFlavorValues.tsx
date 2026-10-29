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
import { Cpu, GpuCard, Hdd, HddStack, Memory } from "react-bootstrap-icons";

import type { ResourceFlavor } from "../sessionsV2/api/computeResources.api";

type ResourceFlavorShape = Pick<
  ResourceFlavor,
  "cpu" | "default_storage" | "gpu" | "max_storage" | "memory"
>;

interface ResourceFlavorValueProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

function ResourceFlavorValue({
  children,
  icon,
  title,
}: ResourceFlavorValueProps) {
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

interface ResourceFlavorValuesProps {
  className?: string;
  compact?: boolean;
  resourceFlavor: ResourceFlavorShape;
}

/** The five values a resource flavor supplies, one icon each. */
export default function ResourceFlavorValues({
  className,
  compact,
  resourceFlavor,
}: ResourceFlavorValuesProps) {
  const { cpu, default_storage, gpu, max_storage, memory } = resourceFlavor;
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
      <ResourceFlavorValue icon={<Cpu className={iconClasses} />} title="CPUs">
        {cpu}&nbsp;{compact ? "CPU" : "CPUs"}
      </ResourceFlavorValue>
      <ResourceFlavorValue
        icon={<Memory className={iconClasses} />}
        title="Memory"
      >
        {memory}&nbsp;GB{compact ? "" : " RAM"}
      </ResourceFlavorValue>
      <ResourceFlavorValue
        icon={<GpuCard className={iconClasses} />}
        title="GPUs"
      >
        {gpu}&nbsp;{compact ? "GPU" : "GPUs"}
      </ResourceFlavorValue>
      <ResourceFlavorValue
        icon={<Hdd className={iconClasses} />}
        title="Default disk size"
      >
        {default_storage}&nbsp;GB{compact ? "" : " default disk"}
      </ResourceFlavorValue>
      <ResourceFlavorValue
        icon={<HddStack className={iconClasses} />}
        title="Maximum disk size"
      >
        {max_storage}&nbsp;GB{compact ? "" : " max disk"}
      </ResourceFlavorValue>
    </span>
  );
}
