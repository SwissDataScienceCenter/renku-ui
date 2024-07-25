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

import { skipToken } from "@reduxjs/toolkit/query";

import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import type { Role } from "../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdMembersQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { useGetUserQuery } from "../../user/dataServicesUser.api/dataServicesUser.api";

interface UseProjectAccessArgs {
  projectId: string;
}

export default function useProjectAccess({ projectId }: UseProjectAccessArgs): {
  userRole: Role;
} {
  const logged = useLegacySelector((state) => state.stateModel.user.logged);
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUserQuery(logged ? undefined : skipToken);
  const { data: members } = useGetProjectsByProjectIdMembersQuery(
    logged
      ? {
          projectId,
        }
      : skipToken
  );
  const viewer = { userRole: "viewer" as Role };
  if (isUserLoading) return viewer;
  if (userError) return viewer;
  if (!user) return viewer;
  if (!members) return viewer;
  // Find the user as a member of the project
  const member = members.find((member) => member.id === user.id);
  if (!member) return viewer;

  return { userRole: member.role };
}
