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

import type { Project } from "../projectsV2/api/projectV2.api";
import {
  useGetProjectsByProjectIdsQuery,
  useGetSessionSecretSlotsByIdsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import type { SecretWithId } from "../usersV2/api/users.api";

/** Map each secret ID to the projects whose session secret slots use it. */
export default function useGetSecretsUsage(
  secrets: SecretWithId[] | undefined,
) {
  const slotIds = useMemo(
    () =>
      Array.from(
        new Set(
          (secrets ?? []).flatMap(
            ({ session_secret_slot_ids }) => session_secret_slot_ids,
          ),
        ),
      ).sort(),
    [secrets],
  );

  const { data: secretSlots } = useGetSessionSecretSlotsByIdsQuery(
    slotIds.length > 0 ? { sessionSecretSlotIds: slotIds } : skipToken,
  );

  const projectIds = useMemo(
    () =>
      secretSlots
        ? Array.from(
            new Set(secretSlots.map(({ project_id }) => project_id)),
          ).sort()
        : undefined,
    [secretSlots],
  );

  const { data: projectsRecord } = useGetProjectsByProjectIdsQuery(
    projectIds && projectIds.length > 0 ? { projectIds } : skipToken,
  );

  return useMemo(() => {
    if (secretSlots == null || projectsRecord == null) {
      return undefined;
    }
    const projectIdBySlotId = new Map(
      secretSlots.map(({ id, project_id }) => [id, project_id]),
    );
    const usage: Record<string, Project[]> = {};
    for (const secret of secrets ?? []) {
      const ids = new Set(
        secret.session_secret_slot_ids
          .map((slotId) => projectIdBySlotId.get(slotId))
          .filter((id): id is string => id != null),
      );
      usage[secret.id] = Array.from(ids)
        .map((id) => projectsRecord[id])
        .filter((project): project is Project => project != null)
        .sort((a, b) => b.id.localeCompare(a.id));
    }
    return usage;
  }, [projectsRecord, secretSlots, secrets]);
}
