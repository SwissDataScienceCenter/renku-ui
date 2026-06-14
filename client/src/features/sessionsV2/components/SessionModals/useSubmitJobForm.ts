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

import type {
  ResourceClassWithId,
  ResourcePoolWithIdFiltered,
} from "../../api/computeResources.api";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import { getLauncherEnvironmentFlags } from "../../launcherEnvironment.utils";
import { getJSONStringArray } from "../../session.utils";
import type { EnvironmentSelectOption } from "../../sessionsV2.types";

export interface SubmitJobForm {
  submissionId: string;
  command: string;
  args: string;
  resourceClass: ResourceClassWithId | undefined;
  diskStorage: number | undefined;
}

export function getSubmitJobDefaultValues(
  launcher: SessionLauncher,
): SubmitJobForm {
  return {
    submissionId: "",
    command: getJSONStringArray(launcher.environment?.command) ?? "",
    args: getJSONStringArray(launcher.environment?.args) ?? "",
    resourceClass: undefined,
    diskStorage: launcher.disk_storage ?? undefined,
  };
}

export function resolveDefaultResourceClass({
  launcher,
  resourcePools,
}: {
  launcher: SessionLauncher;
  resourcePools: ResourcePoolWithIdFiltered[] | undefined;
}): ResourceClassWithId | undefined {
  if (resourcePools == null || launcher.resource_class_id == null) {
    return undefined;
  }
  return resourcePools
    .flatMap((pool) => pool.classes)
    .find((c) => c.id === launcher.resource_class_id && c.matching);
}

export function useSubmitJobEnvironmentFlags(launcher: SessionLauncher) {
  return useMemo(() => getLauncherEnvironmentFlags(launcher), [launcher]);
}

export type { EnvironmentSelectOption };
