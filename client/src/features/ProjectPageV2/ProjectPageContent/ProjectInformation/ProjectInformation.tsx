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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useMemo } from "react";
import {
  Bookmarks,
  Clock,
  Diagram3Fill,
  Eye,
  InfoCircle,
  JournalAlbum,
  People,
} from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import { Badge, Card, CardBody, CardHeader } from "reactstrap";

import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import { UnderlineArrowLink } from "../../../../components/buttons/Button";
import { Loader } from "../../../../components/Loader";
import { TimeCaption } from "../../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import projectPreviewImg from "../../../../styles/assets/projectImagePreview.svg";
import type {
  Project,
  ProjectMemberListResponse,
  ProjectMemberResponse,
} from "../../../projectsV2/api/projectV2.api";
import {
  useGetNamespacesByNamespaceSlugQuery,
  useGetProjectsByProjectIdMembersQuery,
  useGetProjectsByProjectIdQuery,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import { getMemberNameToDisplay, toSortedMembers } from "../../utils/roleUtils";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import ProjectInformationButton from "./ProjectInformationButton";

import styles from "./ProjectInformation.module.scss";

const MAX_MEMBERS_DISPLAYED = 5;

function ProjectCopyTemplateInformationBox({ project }: { project: Project }) {
  const { data: templateProject, isLoading: isLoadingTemplateInformation } =
    useGetProjectsByProjectIdQuery(
      project.template_id
        ? {
            projectId: project.template_id,
          }
        : skipToken
    );
  const { data: templateProjectNamespace } =
    useGetNamespacesByNamespaceSlugQuery(
      templateProject
        ? {
            namespaceSlug: templateProject.namespace,
          }
        : skipToken
    );

  if (!project.template_id) return null;
  if (isLoadingTemplateInformation) return <Loader />;
  if (!templateProject || !templateProjectNamespace) {
    // The user does not have access to this project
    return null;
  }
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: templateProject.namespace,
    slug: templateProject.slug,
  });
  return (
    <ProjectInformationBox
      icon={<Diagram3Fill className="bi" />}
      title="Copied from:"
    >
      <div className="mb-0">
        <div>
          <Link
            color="outline-secondary"
            className={cx("d-flex", "align-items-center")}
            data-cy="copy-project-template-link"
            to={projectUrl}
          >
            {templateProjectNamespace.name ?? templateProjectNamespace.slug} /{" "}
            {templateProject.name}
          </Link>
        </div>
      </div>
    </ProjectInformationBox>
  );
}

interface ProjectInformationProps {
  output?: "plain" | "card";
}
export default function ProjectInformation({
  output = "plain",
}: ProjectInformationProps) {
  const { project } = useProject();

  const permissions = useProjectPermissions({ projectId: project.id });

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

  const { data: namespace } = useGetNamespacesByNamespaceSlugQuery({
    namespaceSlug: project.namespace,
  });
  const namespaceName = useMemo(
    () => namespace?.name ?? project.namespace,
    [namespace?.name, project.namespace]
  );
  const namespaceUrl = useMemo(
    () =>
      namespace?.namespace_kind === "group"
        ? generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
            slug: project.namespace,
          })
        : generatePath(ABSOLUTE_ROUTES.v2.users.show, {
            username: project.namespace,
          }),
    [namespace?.namespace_kind, project.namespace]
  );
  const keywordsSorted = useMemo(() => {
    if (!project.keywords) return [];
    return project.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [project.keywords]);

  const information = (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <ProjectInformationBox
        icon={<JournalAlbum className="bi" />}
        title="Namespace:"
      >
        <p className="mb-0">
          <Link data-cy="project-namespace-link" to={namespaceUrl}>
            {namespaceName}
          </Link>
        </p>
      </ProjectInformationBox>
      <ProjectInformationBox icon={<Eye className="bi" />} title="Visibility:">
        <p className="mb-0">
          <span className="text-capitalize">{project.visibility}</span>
        </p>
      </ProjectInformationBox>
      <ProjectInformationBox icon={<Clock className="bi" />} title="Created:">
        <p className="mb-0">
          <TimeCaption
            datetime={project.creation_date}
            className={cx("fs-6")}
          />
        </p>
      </ProjectInformationBox>
      <ProjectInformationBox
        icon={<People className="bi" />}
        title={
          <>
            <span>Members</span>
            <Badge>{totalMembers}</Badge>
          </>
        }
      >
        <ProjectInformationMembers members={members} membersUrl={membersUrl} />
      </ProjectInformationBox>
      <ProjectInformationBox
        icon={<Bookmarks className="bi" />}
        title={
          <>
            <span>Keywords</span>
            <Badge>{totalKeywords}</Badge>
          </>
        }
      >
        {keywordsSorted.length > 0 && (
          <KeywordContainer className="mt-1">
            {keywordsSorted.map((keyword, index) => (
              <KeywordBadge key={`keyword-${index}`}>{keyword}</KeywordBadge>
            ))}
          </KeywordContainer>
        )}
      </ProjectInformationBox>
      <ProjectCopyTemplateInformationBox project={project} />
    </div>
  );
  return output === "plain" ? (
    information
  ) : (
    <Card data-cy="project-info-card">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <h2 className="m-0">
            <InfoCircle className={cx("me-1", "bi")} />
            Info
          </h2>

          <div>
            <ProjectInformationButton
              userPermissions={permissions}
              project={project}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody>{information}</CardBody>
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
  const displayName = getMemberNameToDisplay(member);

  if (member?.namespace) {
    return (
      <p className="mb-0">
        <Link
          to={generatePath(ABSOLUTE_ROUTES.v2.users.show, {
            username: member.namespace,
          })}
        >
          {displayName}
        </Link>
      </p>
    );
  }

  return <div className={cx("fw-bold", "mb-1")}>{displayName}</div>;
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

interface ProjectInformationBoxProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: React.ReactNode;
}
function ProjectInformationBox({
  children,
  icon,
  title,
}: ProjectInformationBoxProps) {
  return (
    <div>
      <p className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
        {icon}
        {title}
      </p>
      <div className="ms-4">{children}</div>
    </div>
  );
}
