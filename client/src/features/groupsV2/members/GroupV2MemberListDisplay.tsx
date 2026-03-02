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
import { People } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import { Badge } from "reactstrap";

import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { toSortedMembers } from "../../ProjectPageV2/utils/roleUtils";
import type { ProjectMemberResponse } from "../../projectsV2/api/projectV2.api";
import { useGetGroupsByGroupSlugMembersQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { GroupInformationBox } from "../show/GroupV2Information";

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

  if (error || sortedMembers == null) {
    return <RtkOrDataServicesError error={error} dismissible={false} />;
  }

  return (
    <GroupInformationBox
      icon={<People className="bi" />}
      title={
        <>
          <span>Members</span>
          <Badge>{sortedMembers.length ?? 0}</Badge>
        </>
      }
    >
      {!sortedMembers.length && <p>There are no members in this group.</p>}
      {isLoading && (
        <div className={cx("d-flex", "justify-content-center", "w-100")}>
          <div className={cx("d-flex", "flex-column")}>
            <Loader />
            <div>Retrieving group members...</div>
          </div>
        </div>
      )}
      {sortedMembers?.map((member) => (
        <GroupV2Member key={member.id} member={member} />
      ))}
    </GroupInformationBox>
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
        className={cx("mb-0")}
        to={generatePath(ABSOLUTE_ROUTES.v2.users.show.root, { username })}
      >
        <div className={cx("d-flex", "gap-2")}>
          <div
            className={cx(
              "d-flex",
              "flex-column",
              "justify-content-center",
              "text-truncate"
            )}
          >
            <p className={cx("m-0", "text-truncate")}>
              {name ?? "Unknown user"} ({capitalize(role)})
            </p>
          </div>
        </div>
      </Link>
    </>
  );
}
