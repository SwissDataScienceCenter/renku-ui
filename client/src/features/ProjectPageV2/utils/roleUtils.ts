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

import type {
  ProjectMemberListResponse,
  ProjectMemberResponse,
  Role,
} from "../../projectsV2/api/projectsV2.api";

export type RoleOrNone = Role | "none";
const ROLE_MAP: Record<RoleOrNone, number> = {
  owner: 30,
  editor: 20,
  viewer: 10,
  none: 0,
};

function isRoleOrNone(role: string): role is RoleOrNone {
  return role in ROLE_MAP;
}

function stringToRoleOrNone(role: string): RoleOrNone {
  return isRoleOrNone(role) ? role : "none";
}

export function toNumericRole(role: string): number {
  const r = stringToRoleOrNone(role);
  return ROLE_MAP[r];
}

/** Return a sorted copy of the members
 *
 * Lexicographic sort by role (descending), email (ascending), user_id (ascending).
 */
export function toSortedMembers(members: ProjectMemberListResponse) {
  return [...members].sort((a, b) => {
    if (a.role !== b.role) {
      return toNumericRole(b.role) - toNumericRole(a.role);
    }
    if (a.first_name && b.first_name) {
      return a.first_name.localeCompare(b.first_name);
    }
    return a.id < b.id ? -1 : 1;
  });
}

export function getMemberNameToDisplay(member: ProjectMemberResponse): string {
  return member.first_name || member.last_name
    ? `${member.first_name ?? ""} ${member.last_name ?? ""}`
    : member.namespace
    ? `@${member.namespace}`
    : "(unknown)";
}
