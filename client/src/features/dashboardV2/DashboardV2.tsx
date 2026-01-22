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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ReactNode } from "react";
import {
  Calendar3Week,
  Eye,
  FileEarmarkText,
  Folder,
  Megaphone,
  People,
  PlayCircle,
  PlusLg,
  PlusSquare,
  Send,
} from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  Row,
} from "reactstrap";

import { NEW_DOCS_DOCUMENTATION } from "~/utils/constants/NewDocs";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { GROUP_CREATION_HASH } from "../groupsV2/new/createGroup.constants";
import CreateGroupButton from "../groupsV2/new/CreateGroupButton";
import {
  GetGroupsApiResponse,
  GetProjectsApiResponse,
  useGetGroupsQuery,
  useGetProjectsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import { PROJECT_CREATION_HASH } from "../projectsV2/new/createProjectV2.constants";
import CreateProjectV2Button from "../projectsV2/new/CreateProjectV2Button";
import GroupShortHandDisplay from "../projectsV2/show/GroupShortHandDisplay";
import ProjectShortHandDisplay from "../projectsV2/show/ProjectShortHandDisplay";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../sessionsV2/api/sessionsV2.api";
import { useGetUserQueryState } from "../usersV2/api/users.api";
import UserAvatar from "../usersV2/show/UserAvatar";
import DashboardV2Sessions from "./DashboardV2Sessions";

import DashboardStyles from "./DashboardV2.module.scss";

export default function DashboardV2() {
  return (
    <div className={cx("position-relative", "d-flex")}>
      <HeaderDashboard />
      <div
        className={cx("container-xxl", "px-2", "px-sm-3", "px-xxl-0", "my-5")}
      >
        <div className={cx("d-flex", "flex-column", "gap-4", "mb-4")}>
          <Row className="g-4">
            <Col
              xs={12}
              lg={4}
              xl={3}
              className={cx("d-flex", "flex-column", "gap-4")}
            >
              <UserDashboard />
              <GroupsDashboard />
            </Col>
            <Col
              xs={12}
              lg={8}
              xl={9}
              className={cx("d-flex", "flex-column", "gap-4")}
            >
              <SessionsDashboard />
              <ProjectsDashboard />
              <FooterDashboard />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

function HeaderDashboard() {
  return (
    <div
      className={cx(
        DashboardStyles.DashboardHeader,
        "position-absolute",
        "w-100",
        "bg-navy"
      )}
    >
      <div className={cx("container-xxl", DashboardStyles.DashboardHeaderImg)}>
        <h1 className="visually-hidden">Renku Dashboard</h1>
      </div>
    </div>
  );
}

function FooterDashboard() {
  return (
    <Row className="g-3">
      <Col xs={12} lg={6} xl={3}>
        <FooterDashboardCard url="https://blog.renkulab.io/">
          <Megaphone size={27} />
          Renku updates
        </FooterDashboardCard>
      </Col>
      <Col xs={12} lg={6} xl={3}>
        <FooterDashboardCard url={NEW_DOCS_DOCUMENTATION}>
          <FileEarmarkText size={27} />
          Documentation
        </FooterDashboardCard>
      </Col>
      <Col xs={12} lg={6} xl={3}>
        <FooterDashboardCard url="https://renku.notion.site/f9caf41b579f474b8007803b007e3999?v=807326f870984774900fd87095225d7a">
          <Calendar3Week size={27} />
          Community events
        </FooterDashboardCard>
      </Col>
      <Col xs={12} lg={6} xl={3}>
        <FooterDashboardCard url="mailto:hello@renku.io">
          <Send size={27} />
          Contact us
        </FooterDashboardCard>
      </Col>
    </Row>
  );
}

interface FooterDashboardCardProps {
  className?: string;
  children: ReactNode;
  url: string;
}
export function FooterDashboardCard({
  className,
  children,
  url,
}: FooterDashboardCardProps) {
  return (
    <Card className={cx(DashboardStyles.DashboardCard, "border-0", "h-100")}>
      <CardBody className={DashboardStyles.FooterCard}>
        <a
          target="_blank"
          className={cx(
            className,
            "text-primary",
            "d-flex",
            "flex-column",
            "gap-4",
            "align-items-center",
            "py-4",
            "link-primary",
            "stretched-link"
          )}
          rel="noreferrer noopener"
          href={url}
        >
          {children}
        </a>
      </CardBody>
    </Card>
  );
}

function ProjectsDashboard() {
  const { data, error, isLoading } = useGetProjectsQuery({
    params: {
      page: 1,
      per_page: 5,
      direct_member: true,
    },
  });
  const hasProjects = data && data?.projects?.length > 0;
  return (
    <Card data-cy="projects-container">
      <CardHeader className={cx("d-flex", "gap-2")}>
        <div className={cx("align-items-center", "d-flex")}>
          <h2 className={cx("mb-0", "me-2")}>
            <Folder className={cx("bi", "me-1")} />
            My projects
          </h2>
          <Badge>{data?.total ?? 0}</Badge>
        </div>
        {hasProjects && (
          <CreateProjectV2Button
            className={cx("btn-sm", "ms-auto", "my-auto")}
            data-cy="dashboard-project-new"
            color="outline-primary"
          >
            <PlusLg className="bi" id="createPlus" />
          </CreateProjectV2Button>
        )}
      </CardHeader>

      <CardBody>
        <ProjectList data={data} isLoading={isLoading} error={error} />
      </CardBody>
    </Card>
  );
}

interface ProjectListProps {
  data: GetProjectsApiResponse | undefined;
  error: FetchBaseQueryError | SerializedError | undefined;
  isLoading: boolean;
}
function ProjectList({ data, error, isLoading }: ProjectListProps) {
  const hasProjects = data && data?.projects?.length > 0;
  const noProjects = isLoading ? (
    <div className={cx("d-flex", "flex-column", "mx-auto")}>
      <Loader />
      <p className={cx("mx-auto", "my-3")}>Retrieving projects...</p>
    </div>
  ) : error ? (
    <div>
      <p>Cannot show projects.</p>
      <RtkOrNotebooksError error={error} />
    </div>
  ) : !hasProjects ? (
    <div className="text-body-secondary">
      Collaborate on projects with anyone, with data, code, and compute together
      in one place.
    </div>
  ) : null;

  const projectFooter = hasProjects ? (
    <ViewAllLink
      noItems={!hasProjects}
      type="project"
      total={data?.total ?? 0}
    />
  ) : (
    <EmptyProjectsButtons />
  );

  if (noProjects)
    return (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        {noProjects}
        {projectFooter}
      </div>
    );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <ListGroup flush data-cy="dashboard-project-list">
        {data?.projects?.map((project) => (
          <ProjectShortHandDisplay key={project.id} project={project} />
        ))}
      </ListGroup>
      {projectFooter}
    </div>
  );
}

function GroupsDashboard() {
  const { data, error, isLoading } = useGetGroupsQuery({
    page: 1,
    perPage: 5,
    directMember: true,
  });
  const hasGroups = data && data?.groups?.length > 0;
  return (
    <Card data-cy="groups-container">
      <CardHeader className={cx("d-flex", "gap-2")}>
        <div className={cx("align-items-center", "d-flex")}>
          <h2 className={cx("mb-0", "me-2")}>
            <People className={cx("bi", "me-1")} />
            My groups
          </h2>
          <Badge>{data?.total ?? 0}</Badge>
        </div>
        {hasGroups && (
          <CreateGroupButton
            className={cx("btn-sm", "ms-auto", "my-auto")}
            data-cy="dashboard-group-new"
            color="outline-primary"
          >
            <PlusLg className="bi" id="createPlus" />
          </CreateGroupButton>
        )}
      </CardHeader>

      <CardBody>
        <GroupsList data={data} isLoading={isLoading} error={error} />
      </CardBody>
    </Card>
  );
}

function UserDashboard() {
  const { data: userInfo, isLoading } = useGetUserQueryState();

  if (!userInfo?.isLoggedIn || isLoading) {
    return null;
  }

  const userPageUrl = generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
    username: userInfo?.username ?? "",
  });

  return (
    <Card data-cy="user-container" className="position-relative">
      <CardBody
        className={cx(
          "d-flex",
          "flex-column",
          "align-items-center",
          "gap-2",
          "my-2",
          "my-md-4"
        )}
      >
        <UserAvatar namespace={userInfo.username} size="lg" />
        <h2 className={cx("fs-1", "mb-0", "text-center")}>
          {userInfo.first_name} {userInfo.last_name}
        </h2>
        <p className="mb-0">
          <Link
            to={userPageUrl}
            className={cx("link-primary", "stretched-link")}
            data-cy="user-namespace-link"
          >
            @{userInfo.username ?? "unknown"}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

interface GroupListProps {
  data: GetGroupsApiResponse | undefined;
  error: FetchBaseQueryError | SerializedError | undefined;
  isLoading: boolean;
}
function GroupsList({ data, error, isLoading }: GroupListProps) {
  const hasGroups = data && data?.groups?.length > 0;
  const noGroups = isLoading ? (
    <div className={cx("d-flex", "flex-column", "mx-auto")}>
      <Loader />
      <p className={cx("mx-auto", "my-3")}>Retrieving groups...</p>
    </div>
  ) : error ? (
    <div>
      <p>Cannot show groups.</p>
      <RtkOrNotebooksError error={error} />
    </div>
  ) : !hasGroups ? (
    <div className="text-body-secondary">
      Share and organize projects & data with your team.
    </div>
  ) : null;

  const groupFooter = hasGroups ? (
    <ViewAllLink noItems={!hasGroups} type="group" total={data?.total ?? 0} />
  ) : (
    <div className="d-flex">
      <Link
        to={{ hash: GROUP_CREATION_HASH }}
        className={cx("btn", "btn-outline-primary")}
      >
        <PlusSquare className={cx("bi", "me-1")} />
        Create my first group
      </Link>
    </div>
  );

  if (noGroups)
    return (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        {noGroups}
        {groupFooter}
      </div>
    );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <ListGroup flush data-cy="dashboard-group-list">
        {data?.groups?.map((group) => (
          <GroupShortHandDisplay
            element="list-item"
            key={group.id}
            group={group}
          />
        ))}
      </ListGroup>
      {groupFooter}
    </div>
  );
}

function SessionsDashboard() {
  const { data: sessions, error, isLoading } = useGetSessionsQueryV2();
  const totalSessions = sessions ? sessions?.length : 0;
  return (
    <Card data-cy="sessions-container">
      <CardHeader>
        <div className={cx("align-items-center", "d-flex")}>
          <h2 className={cx("mb-0", "me-2")}>
            <PlayCircle className={cx("me-1", "bi")} />
            My sessions
          </h2>
          <Badge>{totalSessions}</Badge>
        </div>
      </CardHeader>

      <CardBody>
        <DashboardV2Sessions
          sessions={sessions}
          isLoading={isLoading}
          error={error}
        />
      </CardBody>
    </Card>
  );
}

function ViewAllLink({
  type,
  noItems,
  total,
}: {
  type: "project" | "group";
  noItems: boolean;
  total: number;
}) {
  const searchUrl = ABSOLUTE_ROUTES.v2.search;
  return noItems ? (
    <Link
      to={{ pathname: searchUrl, search: "q=type:${type}" }}
      data-cy={`view-other-${type}s-btn`}
    >
      View other {type === "project" ? "projects" : "groups"}
    </Link>
  ) : (
    <Link
      to={{
        pathname: searchUrl,
        search: `q=role:owner,editor,viewer+type:${type}+sort:created-desc`,
      }}
      data-cy={`view-my-${type}s-btn`}
    >
      View all my {total > 5 ? total : ""}{" "}
      {type === "project" ? "projects" : "groups"}
    </Link>
  );
}

function EmptyProjectsButtons() {
  const searchUrl = ABSOLUTE_ROUTES.v2.search;
  return (
    <div className={cx("d-flex", "gap-3")}>
      <Link
        to={{ hash: PROJECT_CREATION_HASH }}
        className={cx("btn", "btn-primary")}
      >
        <PlusSquare className={cx("bi", "me-1")} />
        Create my first project
      </Link>
      <Link
        to={{ pathname: searchUrl, search: "q=type:project" }}
        className={cx("btn", "btn-outline-primary")}
      >
        <Eye className={cx("bi", "me-1")} />
        View existing projects
      </Link>
    </div>
  );
}
