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

import cx from "classnames";
import { useRef } from "react";
import { generatePath, Link } from "react-router";
import { UncontrolledTooltip } from "reactstrap";

import {
  getMemberNameToDisplay,
  toSortedMembers,
} from "~/features/ProjectPageV2/utils/roleUtils";
import {
  ProjectMemberListResponse,
  ProjectMemberResponse,
} from "~/features/projectsV2/api/projectV2.api";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

import styles from "~/features/usersV2/show/UserAvatar.module.scss";

const MAX_MEMBERS_DISPLAYED = 2;

function ProjectInformationMember({
  member,
}: {
  member: ProjectMemberResponse;
}) {
  const displayName = getMemberNameToDisplay(member);

  if (member?.namespace) {
    return (
      <Link
        to={generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: member.namespace,
        })}
        className={cx(
          "align-items-center",
          "d-flex",
          "flex-row",
          "gap-1",
          "min-w-0",
          "text-decoration-none",
        )}
      >
        <UserAvatar namespace={member.namespace} />
        <span className="text-truncate">{displayName}</span>
      </Link>
    );
  }

  return (
    <div className={cx("fw-bold", "mb-1", "min-w-0", "text-truncate")}>
      {displayName}
    </div>
  );
}

interface ProjectInformationMembersProps {
  members: ProjectMemberListResponse | undefined;
  membersUrl: string;
}
export function ProjectPageHeaderMembers({
  members,
  membersUrl,
}: ProjectInformationMembersProps) {
  const ref = useRef(null);
  if (members == null) return null;
  const sortedMembers = toSortedMembers(members);
  const hiddenCount = members.length - MAX_MEMBERS_DISPLAYED;
  return (
    <>
      {sortedMembers.slice(0, MAX_MEMBERS_DISPLAYED).map((member, index) => (
        <ProjectInformationMember key={index} member={member} />
      ))}
      {members.length > MAX_MEMBERS_DISPLAYED && (
        <>
          <span ref={ref}>
            <Link to={membersUrl} className="text-decoration-none">
              <div
                className={cx(
                  "align-items-center",
                  "border",
                  "d-flex",
                  "flex-shrink-0",
                  "justify-content-center",
                  "rounded-circle",
                  "text-black",
                  "small",
                  styles.avatar,
                )}
                data-cy="member-list-overflow"
              >
                +{hiddenCount}
              </div>
            </Link>
          </span>
          <UncontrolledTooltip target={ref}>
            View all project members
          </UncontrolledTooltip>
        </>
      )}
    </>
  );
}
