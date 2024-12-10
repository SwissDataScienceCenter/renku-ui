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

import { useEffect } from "react";

import { DEFAULT_PERMISSIONS } from "../../permissionsV2/permissions.constants";
import type { Permissions } from "../../permissionsV2/permissions.types";
import { projectV2Api } from "../../projectsV2/api/projectV2.enhanced-api";

interface UseProjectPermissionsArgs {
  projectId: string;
}

export default function useProjectPermissions({
  projectId,
}: UseProjectPermissionsArgs): Permissions {
  const { currentData, isLoading, isError, isUninitialized } =
    projectV2Api.endpoints.getProjectsByProjectIdPermissions.useQueryState({
      projectId,
    });
  const [fetchPermissions] =
    projectV2Api.endpoints.getProjectsByProjectIdPermissions.useLazyQuery();

  useEffect(() => {
    if (isUninitialized) {
      fetchPermissions({ projectId });
    }
  }, [fetchPermissions, isUninitialized, projectId]);

  if (isLoading || isError || !currentData) {
    return DEFAULT_PERMISSIONS;
  }

  const permissions: Permissions = {
    ...DEFAULT_PERMISSIONS,
    ...currentData,
  };
  return permissions;
}
