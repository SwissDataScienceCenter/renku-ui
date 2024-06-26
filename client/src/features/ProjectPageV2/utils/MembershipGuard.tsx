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
import type {
  ProjectMemberListResponse,
  ProjectMemberResponse,
} from "../../projectsV2/api/projectV2.api.ts";
import AccessGuard from "./AccessGuard.tsx";
import { toNumericRole } from "./roleUtils.ts";
import { useGetUserInfoQuery } from "../../user/keycloakUser.api.ts";

interface SelfOverride {
  disabled: React.ReactNode | undefined;
  enabled: React.ReactNode | undefined;
  subject: ProjectMemberResponse;
}

type MembershipGuardProps = Omit<Parameters<typeof AccessGuard>[0], "role"> & {
  members: ProjectMemberListResponse | undefined;
  /** A node to show if the user themselves is in the project, but below the minimum role  */
  selfOverride?: SelfOverride;
};

export default function MembershipGuard({
  disabled,
  enabled,
  members,
  minimumRole = "owner",
  selfOverride,
}: MembershipGuardProps) {
  const logged = useLegacySelector((state) => state.stateModel.user.logged);
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUserInfoQuery(logged ? undefined : skipToken);
  if (isUserLoading) return disabled;
  if (userError) return disabled;
  // If the user is not logged in, return null
  if (!user) return null;
  if (!members) return disabled;
  // Find the user is a member of the project
  const userId = user.isLoggedIn ? user.sub : null;
  const userMember = members.find((member) => member.id === userId);
  if (!userMember) return disabled;
  // If the user themselves is the target of this guard and there is an applicable override, use it
  if (
    userMember === selfOverride?.subject &&
    toNumericRole(userMember.role) < toNumericRole(minimumRole) &&
    selfOverride.disabled
  ) {
    return selfOverride.disabled;
  }
  if (
    userMember === selfOverride?.subject &&
    toNumericRole(userMember.role) >= toNumericRole(minimumRole) &&
    selfOverride.enabled
  ) {
    return selfOverride.enabled;
  }

  return (
    <AccessGuard
      disabled={disabled}
      enabled={enabled}
      minimumRole={minimumRole}
      role={userMember.role}
    />
  );
}
