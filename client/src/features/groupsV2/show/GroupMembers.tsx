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

import cx from "classnames";
import { useMemo } from "react";
import { People } from "react-bootstrap-icons";
import { Link } from "react-router";
import { Badge, Card, CardBody, CardHeader } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import { toSortedMembers } from "~/features/ProjectPageV2/utils/roleUtils";
import type { Role } from "~/features/projectsV2/api/projectV2.api";
import { useGetGroupsByGroupSlugMembersQuery } from "~/features/projectsV2/api/projectV2.enhanced-api";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { RELATIVE_ROUTES } from "~/routing/routes.constants";
import GroupV2MemberListDisplay from "../members/GroupV2MemberListDisplay";

const MAX_MEMBERS_TO_DISPLAY = 10;
const MEMBER_ROLES: Role[] = ["owner", "editor", "viewer"];

export default function GroupMembers() {
  const ctx = useNamespaceContext();
  const { namespace, kind } = ctx;
  const {
    data: members,
    error,
    isLoading,
  } = useGetGroupsByGroupSlugMembersQuery(
    { groupSlug: namespace ?? "" },
    {
      skip: !namespace,
    },
  );

  const sortedMembers = useMemo(
    () => (members ? toSortedMembers(members) : null),
    [members],
  );

  let content = null;
  if (error || members == null) {
    content = <RtkOrDataServicesError error={error} dismissible={false} />;
  }

  if (isLoading) {
    content = (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader />
          <div>Retrieving group members...</div>
        </div>
      </div>
    );
  }

  const membersToDisplay = sortedMembers?.slice(0, MAX_MEMBERS_TO_DISPLAY);
  const hasHiddenMembers =
    sortedMembers != null && sortedMembers.length > MAX_MEMBERS_TO_DISPLAY;

  content = kind === "group" &&
    namespace &&
    membersToDisplay &&
    membersToDisplay.length > 0 && (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        {MEMBER_ROLES.map((role) => (
          <GroupV2MemberListDisplay
            key={role}
            members={membersToDisplay}
            role={role}
          />
        ))}
        {hasHiddenMembers && (
          <Link
            to={{
              pathname: RELATIVE_ROUTES.v2.groups.show.settings,
            }}
            data-cy="view-all-members"
          >
            View all group members
          </Link>
        )}
      </div>
    );
  return (
    <Card data-cy="group-members-card" className="h-100">
      <CardHeader>
        <div className={cx("align-items-center", "d-flex")}>
          <h2 className={cx("mb-0", "me-2")}>
            <People className={cx("me-1", "bi")} />
            Members
          </h2>
          <Badge>{(members && members.length) ?? 0}</Badge>
        </div>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  );
}
