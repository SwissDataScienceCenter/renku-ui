/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
  useGetSessionSecretSlotsByIdsQuery,
  useGetProjectsByProjectIdsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import type { SecretWithId } from "../usersV2/api/users.api";
import { skipToken } from "@reduxjs/toolkit/query";

interface UseGetRelatedProjectsArgs {
  secret: SecretWithId;
}

export default function useGetRelatedProjects({
  secret,
}: UseGetRelatedProjectsArgs) {
  const { session_secret_ids } = secret;

  const {
    data: secretSlots,
    isLoading: isLoadingSecretSlots,
    error: secretSlotsError,
  } = useGetSessionSecretSlotsByIdsQuery({
    sessionSecretSlotIds: session_secret_ids,
  });

  const projectIds = useMemo(() => {
    const rawProjectIds = secretSlots?.map(({ project_id }) => project_id);
    if (rawProjectIds == null) {
      return undefined;
    }
    return Array.from(new Set(rawProjectIds)).sort();
  }, [secretSlots]);

  const {
    data: projectsRecord,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useGetProjectsByProjectIdsQuery(projectIds ? { projectIds } : skipToken);

  const isLoading = isLoadingSecretSlots || isLoadingProjects;
  const error = secretSlotsError ?? projectsError;

  const projects = useMemo(
    () =>
      projectsRecord
        ? Object.values(projectsRecord).sort((a, b) => b.id.localeCompare(a.id))
        : undefined,
    [projectsRecord]
  );

  return {
    projects,
    secretSlots,
    isLoading,
    error,
  };
}
