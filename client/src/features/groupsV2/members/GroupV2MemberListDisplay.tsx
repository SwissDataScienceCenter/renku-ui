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
import { useMemo } from "react";
import { generatePath, Link } from "react-router";

import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { toSortedMembers } from "../../ProjectPageV2/utils/roleUtils";
import type { ProjectMemberResponse } from "../../projectsV2/api/projectV2.api";

interface GroupV2MemberListDisplayProps {
  members: ProjectMemberResponse[];
}

export default function GroupV2MemberListDisplay({
  members,
}: GroupV2MemberListDisplayProps) {
  const sortedMembers = useMemo(
    () => (members ? toSortedMembers(members) : null),
    [members],
  );

  return sortedMembers?.map((member) => (
    <GroupV2Member key={member.id} member={member} />
  ));
}

interface GroupV2MemberProps {
  member: ProjectMemberResponse;
}
function GroupV2Member({ member }: GroupV2MemberProps) {
  const {
    role,
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
              "flex-column",
              "justify-content-center",
              "text-truncate",
            )}
          >
            <UserAvatar namespace={username} size="sm" />
            <span className={cx("fs-6")}>{name}</span>
            <span className={cx("text-truncate")}>
              {name ?? "Unknown user"} ({capitalize(role)})
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}
