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
import { Link, generatePath } from "react-router-dom-v5-compat";

import { TimeCaption } from "../../../../components/TimeCaption";
import {
  EditButtonLink,
  UnderlineArrowLink,
} from "../../../../components/buttons/Button";
import VisibilityIcon from "../../../../components/entities/VisibilityIcon";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import type {
  ProjectMemberListResponse,
  ProjectMemberResponse,
} from "../../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdMembersQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import { useGetUsersByUserIdQuery } from "../../../user/dataServicesUser.api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import MembershipGuard from "../../utils/MembershipGuard";
import { toSortedMembers } from "../../utils/roleUtils";

import projectPreviewImg from "../../../../styles/assets/projectImagePreview.svg";

import styles from "./ProjectInformation.module.scss";
import UserAvatar from "../../../userV2/show/UserAvatar";

export function ProjectImageView() {
  return (
    <div className={cx(styles.projectPageImgPlaceholder)}>
      <img
        src={projectPreviewImg}
        className="rounded-2"
        alt="Project image preview"
      />
    </div>
  );
}

function ProjectInformationMember({
  member,
}: {
  member: ProjectMemberResponse;
}) {
  const { data: memberData } = useGetUsersByUserIdQuery({ userId: member.id });

  const displayName =
    member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.last_name
      ? member.last_name
      : member.email
      ? member.email
      : member.id;

  if (memberData?.username) {
    return (
      <div className={cx("fw-bold", "mb-1")}>
        <div className={cx("d-inline-block", "me-1")}>
          <UserAvatar
            firstName={member.first_name}
            lastName={member.last_name}
          />
        </div>
        <Link
          to={generatePath(ABSOLUTE_ROUTES.v2.users.show, {
            username: memberData.username,
          })}
        >
          {displayName}
        </Link>
      </div>
    );
  }

  return <div className={cx("fw-bold", "mb-1")}>{displayName}</div>;
}

interface ProjectInformationMembersProps {
  members: ProjectMemberListResponse | undefined;
  membersUrl: string;
}

const MAX_MEMBERS_DISPLAYED = 5;

function ProjectInformationMembers({
  members,
  membersUrl,
}: ProjectInformationMembersProps) {
  if (members == null) return null;
  if (members.length == 0) {
    return (
      <MembershipGuard
        disabled={null}
        enabled={
          <UnderlineArrowLink
            tooltip="Add project members"
            text="Add members"
            to={membersUrl}
          />
        }
        members={members}
        minimumRole="editor"
      />
    );
  }
  const sortedMembers = toSortedMembers(members);
  return (
    <>
      {sortedMembers.slice(0, MAX_MEMBERS_DISPLAYED).map((member, index) => (
        <ProjectInformationMember key={index} member={member} />
      ))}
      {members.length > MAX_MEMBERS_DISPLAYED && (
        <UnderlineArrowLink
          tooltip="View all project members"
          text="All members"
          to={membersUrl}
        />
      )}
    </>
  );
}

export default function ProjectInformation() {
  const { project } = useProject();

  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const totalMembers = members?.length ?? 0;
  const totalKeywords = project.keywords?.length || 0;
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace,
    slug: project.slug,
  });
  const membersUrl = `${settingsUrl}#members`;

  return (
    <aside className={cx("px-3", "pb-5", "pb-lg-2")}>
      <div
        className={cx(
          "my-4",
          "d-block",
          "d-lg-none",
          "d-sm-block",
          "text-center"
        )}
      >
        <ProjectImageView />
      </div>
      <div
        className={cx(
          "d-flex",
          "align-items-center",
          "justify-content-between",
          "gap-2"
        )}
      >
        <div className={cx("flex-grow-1", "border-bottom")}></div>
        <MembershipGuard
          disabled={
            <EditButtonLink
              disabled={true}
              to={settingsUrl}
              tooltip="Your role does not allow modifying project information"
            />
          }
          enabled={
            <EditButtonLink
              data-cy="project-settings-edit"
              to={settingsUrl}
              tooltip="Modify project information"
            />
          }
          members={members}
          minimumRole="editor"
        />
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>Namespace</div>
        <div className="fw-bold">{project.namespace}</div>
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>Visibility</div>
        <VisibilityIcon
          className={cx(
            "fw-bold",
            "justify-content-start",
            "justify-content-lg-end"
          )}
          visibility={project.visibility}
        />
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>
          Created{" "}
          <TimeCaption
            datetime={project.creation_date}
            className={cx("fw-bold", "fs-6")}
          />
        </div>
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>Members ({totalMembers})</div>
        <ProjectInformationMembers members={members} membersUrl={membersUrl} />
      </div>
      <div className={cx("border-bottom", "py-3", "text-start", "text-lg-end")}>
        <div>Keywords ({totalKeywords})</div>
        {totalKeywords == 0 ? (
          <MembershipGuard
            disabled={null}
            enabled={
              <UnderlineArrowLink
                tooltip="Add project keywords"
                text="Add keywords"
                to={settingsUrl}
              />
            }
            members={members}
            minimumRole="editor"
          />
        ) : (
          <div
            className={cx(
              "d-flex",
              "flex-wrap",
              "gap-2",
              "justify-content-end",
              "mt-2"
            )}
          >
            {project.keywords?.map((keyword, index) => (
              <span key={`keyword-${index}`} className={cx("fw-bold")}>
                #{keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
