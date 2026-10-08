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
 * limitations under the License
 */

import cx from "classnames";
import { capitalize } from "lodash-es";
import { generatePath, Link } from "react-router";

import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type {
  ProjectMemberResponse,
  Role,
} from "../../projectsV2/api/projectV2.api";

interface GroupV2MemberListDisplayProps {
  members: ProjectMemberResponse[];
  role: Role;
}

export default function GroupV2MemberListDisplay({
  members,
  role,
}: GroupV2MemberListDisplayProps) {
  const byRole = members.filter((member) => member.role === role);
  const membersByRole = byRole.map((member) => (
    <GroupV2Member key={member.id} member={member} />
  ));

  if (!byRole.length) return null;

  return (
    <div>
      <div className={cx("d-flex", "align-items-center", "gap-3")}>
        <div className="border-top" style={{ width: "20px" }}></div>
        <span className={cx("fs-5", "text-muted")}>{capitalize(role)}</span>
        <div className={cx("flex-grow-1", "border-top")}></div>
      </div>
      <div className={cx("d-flex", "flex-column", "gap-2", "my-2")}>
        {membersByRole}
      </div>
    </div>
  );
}

interface GroupV2MemberProps {
  member: ProjectMemberResponse;
}
function GroupV2Member({ member }: GroupV2MemberProps) {
  const {
    first_name: firstName,
    last_name: lastName,
    namespace: username,
  } = member;

  if (!username) {
    return null;
  }
  const name =
    firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;

  return (
    <>
      <Link
        className={cx("mb-0", "text-decoration-none", "text-reset", "w-100")}
        to={generatePath(ABSOLUTE_ROUTES.v2.users.show.root, { username })}
      >
        <div className={cx("d-flex", "gap-2")}>
          <div
            className={cx(
              "d-flex",
              "flex-row",
              "align-items-center",
              "gap-1",
              "text-truncate",
            )}
          >
            <UserAvatar namespace={username} size="sm" />
            <span className={cx("text-truncate")}>
              {name ?? "Unknown user"}
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}
