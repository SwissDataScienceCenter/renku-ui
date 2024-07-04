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
import { generatePath } from "react-router-dom-v5-compat";
import { Card, CardBody, CardHeader } from "reactstrap";
import { InfoCircleFill } from "react-bootstrap-icons";

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
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import MembershipGuard from "../../utils/MembershipGuard";
import { toSortedMembers } from "../../utils/roleUtils";

import projectPreviewImg from "../../../../styles/assets/projectImagePreview.svg";
import styles from "./ProjectInformation.module.scss";

const MAX_MEMBERS_DISPLAYED = 5;

interface ProjectInformationProps {
  output?: "plain" | "card";
}
export default function ProjectInformation({
  output = "plain",
}: ProjectInformationProps) {
  const { project } = useProject();

  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const totalMembers = members?.length ?? 0;
  const totalKeywords = project.keywords?.length || 0;
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });
  const membersUrl = `${settingsUrl}#members`;

  const information = (
    <div>
      <p>
        Namespace: <span className="fw-bold">{project.namespace}</span>
      </p>
      <div className={cx("d-flex", "flex-wrap", "mb-3")}>
        <p className={cx("me-1", "mb-0")}>Visibility: </p>
        <span className="fw-bold">
          <VisibilityIcon visibility={project.visibility} />
        </span>
      </div>
      <p>
        Created:{" "}
        <TimeCaption
          datetime={project.creation_date}
          className={cx("fw-bold", "fs-6")}
        />
      </p>
      <div className="mb-3">
        <p className="mb-1">Members ({totalMembers})</p>
        <ProjectInformationMembers members={members} membersUrl={membersUrl} />
      </div>
      <div>
        <p className={cx(totalKeywords ? "mb-1" : "mb-0")}>
          Keywords ({totalKeywords})
        </p>
        {project.keywords?.map((keyword, index) => (
          <p key={`keyword-${index}`} className={cx("fw-bold", "mb-1")}>
            #{keyword}
          </p>
        ))}
      </div>
    </div>
  );
  return output === "plain" ? (
    information
  ) : (
    <Card>
      <CardHeader>
        <div className={cx("d-flex", "justify-content-between")}>
          <h3 className="m-0">
            <InfoCircleFill className={cx("me-2", "text-icon")} />
            Info
          </h3>

          <div>
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
        </div>
      </CardHeader>
      <CardBody>{information}</CardBody>
    </Card>
  );
}

export function ProjectInformationCard() {
  return (
    <Card>
      <CardHeader tag="h3">
        <InfoCircleFill className={cx("me-2", "text-icon")} />
        Info
      </CardHeader>
      <CardBody>
        <ProjectInformation />
      </CardBody>
    </Card>
  );
}

export function ProjectImageView() {
  return (
    <div className={cx(styles.projectPageImgPlaceholder)}>
      <img
        src={projectPreviewImg}
        className={cx("mb-3", "rounded-2")}
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
  const displayName =
    member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.last_name
      ? member.last_name
      : member.email
      ? member.email
      : member.id;

  return <p className={cx("fw-bold", "mb-1")}>{displayName}</p>;
}

interface ProjectInformationMembersProps {
  members: ProjectMemberListResponse | undefined;
  membersUrl: string;
}
function ProjectInformationMembers({
  members,
  membersUrl,
}: ProjectInformationMembersProps) {
  if (members == null) return null;
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
