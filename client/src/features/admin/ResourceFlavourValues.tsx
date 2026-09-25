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

import type { ResourceFlavourWithId } from "../sessionsV2/api/computeResources.api";

type ResourceFlavourShape = Pick<
  ResourceFlavourWithId,
  "cpu" | "default_storage" | "gpu" | "max_storage" | "memory"
>;

interface ResourceFlavourValueProps {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}

function ResourceFlavourValue({
  children,
  icon,
  title,
}: ResourceFlavourValueProps) {
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

interface ResourceFlavourValuesProps {
  className?: string;
  compact?: boolean;
  resourceFlavour: ResourceFlavourShape;
}

/** The five values a resource flavour supplies, one icon each. */
export default function ResourceFlavourValues({
  className,
  compact,
  resourceFlavour,
}: ResourceFlavourValuesProps) {
  const { cpu, default_storage, gpu, max_storage, memory } = resourceFlavour;
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
      <ResourceFlavourValue icon={<Cpu className={iconClasses} />} title="CPUs">
        {cpu}&nbsp;{compact ? "CPU" : "CPUs"}
      </ResourceFlavourValue>
      <ResourceFlavourValue
        icon={<Memory className={iconClasses} />}
        title="Memory"
      >
        {memory}&nbsp;GB{compact ? "" : " RAM"}
      </ResourceFlavourValue>
      <ResourceFlavourValue
        icon={<GpuCard className={iconClasses} />}
        title="GPUs"
      >
        {gpu}&nbsp;{compact ? "GPU" : "GPUs"}
      </ResourceFlavourValue>
      <ResourceFlavourValue
        icon={<Hdd className={iconClasses} />}
        title="Default disk size"
      >
        {default_storage}&nbsp;GB{compact ? "" : " default disk"}
      </ResourceFlavourValue>
      <ResourceFlavourValue
        icon={<HddStack className={iconClasses} />}
        title="Maximum disk size"
      >
        {max_storage}&nbsp;GB{compact ? "" : " max disk"}
      </ResourceFlavourValue>
    </span>
  );
}
