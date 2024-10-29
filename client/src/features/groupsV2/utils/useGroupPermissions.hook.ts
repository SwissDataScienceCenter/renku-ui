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

import { DEFAULT_PERMISSIONS } from "../../permissionsV2/permissions.constants";
import type { Permissions } from "../../permissionsV2/permissions.types";
import { useGetGroupsByGroupSlugPermissionsQuery } from "../../projectsV2/api/projectV2.enhanced-api";

interface UseGroupPermissionsArgs {
  groupSlug: string;
}

export default function useGroupPermissions({
  groupSlug,
}: UseGroupPermissionsArgs): { permissions: Permissions; isLoading: boolean } {
  const { data, isLoading, isError } = useGetGroupsByGroupSlugPermissionsQuery({
    groupSlug,
  });

  if (isLoading || isError || !data) {
    return { permissions: DEFAULT_PERMISSIONS, isLoading };
  }

  const permissions: Permissions = {
    ...DEFAULT_PERMISSIONS,
    ...data,
  };
  return { permissions, isLoading };
}
