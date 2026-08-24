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

import type { PoolMember } from "../sessionsV2/api/computeResources.api";
import type { MemberType } from "./addMemberToResourcePool.types";

export const MEMBER_TYPE_LABELS: Record<
  MemberType,
  { singular: string; plural: string }
> = {
  user: { singular: "User", plural: "Users" },
  group: { singular: "Group", plural: "Groups" },
  project: { singular: "Project", plural: "Projects" },
};

export const BATCH_INPUT_HELP: Record<MemberType, string> = {
  user: "Paste a list of user emails, one per line.",
  group: "Paste a list of group slugs, one per line.",
  project: "Paste a list of project paths (namespace/project), one per line.",
};

export const BATCH_INPUT_PLACEHOLDER: Record<MemberType, string> = {
  user: "user_1@example.com\nuser_2@example.com",
  group: "my-group\nanother-group",
  project: "user/project-1\ngroup/project-2",
};

export function buildPoolMember(
  memberType: MemberType,
  id: string,
): PoolMember {
  switch (memberType) {
    case "user":
      return { member_type: "user", id, role: "viewer" };
    case "group":
      return { member_type: "group", id, role: "group_viewer" };
    case "project":
      return { member_type: "project", id, role: "project_viewer" };
  }
}

export function parseBatchInput(
  input: string,
  memberType: MemberType,
): string[] {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (memberType === "project") {
    return lines.filter((line) => line.includes("/"));
  }
  return lines;
}
