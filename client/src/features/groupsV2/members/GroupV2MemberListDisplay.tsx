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
import { Link, generatePath } from "react-router-dom-v5-compat";
import { ListGroup } from "reactstrap";

import { Loader } from "../../../components/Loader";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { toSortedMembers } from "../../ProjectPageV2/utils/roleUtils";
import type { ProjectMemberResponse } from "../../projectsV2/api/projectV2.api";
import { useGetGroupsByGroupSlugMembersQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import UserAvatar from "../../usersV2/show/UserAvatar";

interface GroupV2MemberListDisplayProps {
  group: string;
}

export default function GroupV2MemberListDisplay({
  group,
}: GroupV2MemberListDisplayProps) {
  const {
    data: members,
    error,
    isLoading,
  } = useGetGroupsByGroupSlugMembersQuery({ groupSlug: group });

  const sortedMembers = useMemo(
    () => (members ? toSortedMembers(members) : null),
    [members]
  );

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader />
          <div>Retrieving group members...</div>
        </div>
      </div>
    );

  if (error || sortedMembers == null) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (!sortedMembers.length) {
    return <p>There are no members in this group.</p>;
  }

  return (
    <ListGroup className="mb-3">
      {sortedMembers?.map((member) => (
        <GroupV2Member key={member.id} member={member} />
      ))}
    </ListGroup>
  );
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
        className={cx("list-group-item-action", "list-group-item")}
        to={generatePath(ABSOLUTE_ROUTES.v2.users.show, { username })}
      >
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "gap-2",
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex", "gap-2")}>
            <UserAvatar
              firstName={firstName}
              lastName={lastName}
              username={username}
            />
            <span className={cx("fw-bold")}>{name ?? "Unknown user"}</span>{" "}
            <span>{`@${username}`}</span>
          </div>
          <p className="m-0">{capitalize(role)}</p>
        </div>
      </Link>
    </>
  );
}
