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
import { useGetUserQuery } from "../../../features/user/dataServicesUser.api";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import type {
  ProjectMemberListResponse,
  Role,
} from "../../projectsV2/api/projectV2.api.ts";
import AccessGuard from "./AccessGuard.tsx";

type MembershipGuardProps = {
  disabled: React.ReactNode;
  enabled: React.ReactNode;
  members: ProjectMemberListResponse | undefined;
  minimumRole?: Role;
};

export default function MembershipGuard({
  disabled,
  enabled,
  members,
  minimumRole = "owner",
}: MembershipGuardProps) {
  const logged = useLegacySelector((state) => state.stateModel.user.logged);
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUserQuery(logged ? undefined : skipToken);
  if (isUserLoading) return disabled;
  if (userError) return disabled;
  // If the user is not logged in, return null
  if (!user) return null;
  if (!members) return disabled;
  // Find the user is a member of the project
  const member = members.find((member) => member.id === user.id);
  if (!member) return disabled;
  return (
    <AccessGuard
      disabled={disabled}
      enabled={enabled}
      minimumRole={minimumRole}
      role={member.role}
    />
  );
}
