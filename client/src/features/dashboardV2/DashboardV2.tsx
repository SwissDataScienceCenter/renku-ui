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
  PersonFillExclamation,
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

import { useLoginUrl } from "../../authentication/useLoginUrl.hook";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import { GROUP_CREATION_HASH } from "../groupsV2/new/createGroup.constants";
import CreateGroupButton from "../groupsV2/new/CreateGroupButton";
import { ProjectMigrationBanner } from "../projectMigrationV2/ProjectMigrationBanner.tsx";
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
import SearchV2Bar from "../searchV2/components/SearchV2Bar";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../sessionsV2/api/sessionsV2.api";
import { useGetUserQuery } from "../usersV2/api/users.api";
import UserAvatar from "../usersV2/show/UserAvatar";
import DashboardV2Sessions from "./DashboardV2Sessions";

import DashboardStyles from "./DashboardV2.module.scss";

export default function DashboardV2() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  if (!userLogged) return <AnonymousDashboard />;

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
              <ProjectMigrationBanner />
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
      <div
        className={cx("container-xxl", DashboardStyles.DashboardHeaderImg)}
      ></div>
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
        <FooterDashboardCard url="https://renku.notion.site/Documentation-db396cfc9a664cd2b161e4c6068a5ec9">
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
  children: ReactNode;
  url: string;
}
function FooterDashboardCard({ children, url }: FooterDashboardCardProps) {
  return (
    <Card className={cx(DashboardStyles.DashboardCard, "border-0")}>
      <CardBody className={DashboardStyles.FooterCard}>
        <a
          target="_blank"
          className={cx(
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
function DashboardSearch() {
  return (
    <Row>
      <Col xs={12}>
        <Card className="bg-white">
          <CardHeader>
            <h3>Explore Renkulab</h3>
            <p>Explore projects on RenkuLab.</p>
          </CardHeader>
          <CardBody>
            <SearchV2Bar />
          </CardBody>
        </Card>
      </Col>
    </Row>
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
          <h4 className={cx("mb-0", "me-2")}>
            <Folder className={cx("bi", "me-1")} />
            My projects
          </h4>
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
          <h4 className={cx("mb-0", "me-2")}>
            <People className={cx("bi", "me-1")} />
            My groups
          </h4>
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
  const { data: userInfo, isLoading } = useGetUserQuery();

  if (!userInfo?.isLoggedIn || isLoading) {
    return null;
  }

  const userPageUrl = generatePath(ABSOLUTE_ROUTES.v2.users.show, {
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
        <h3 className={cx("text-center", "mb-0")}>
          {userInfo.first_name} {userInfo.last_name}
        </h3>
        <p className="mb-0">
          <Link
            to={userPageUrl}
            className={cx("link-primary", "stretched-link")}
          >
            @{userInfo.username ?? "unknown"}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

function AnonymousDashboard() {
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
              <LoginCard />
            </Col>
            <Col
              xs={12}
              lg={8}
              xl={9}
              className={cx(
                "d-flex",
                "flex-column",
                "gap-4",
                "gap-xl-0",
                "justify-content-between"
              )}
            >
              <DashboardSearch />
              <FooterDashboard />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
function LoginCard() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );
  const loginUrl = useLoginUrl();
  if (userLogged) {
    return null;
  }
  return (
    <Card data-cy="user-container" className={cx("bg-primary", "text-white")}>
      <CardBody
        className={cx(
          "d-flex",
          "flex-column",
          "align-items-center",
          "gap-5",
          "my-5"
        )}
      >
        <div
          className={cx("d-flex", "flex-column", "align-items-center", "gap-2")}
        >
          <div
            className={cx(
              "border",
              "rounded-pill",
              "bg-white",
              "text-primary",
              DashboardStyles.AnonymousAvatar,
              "d-flex",
              "justify-content-center",
              "align-items-center"
            )}
          >
            <PersonFillExclamation size={48} />
          </div>
          <p className="mb-0">You are not logged in.</p>
        </div>
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "align-items-center",
            "gap-2",
            "text-center"
          )}
        >
          <a
            className={cx("btn", "bg-white", "text-primary")}
            id="login-button"
            href={loginUrl.href}
          >
            Log in
          </a>
          <p className="mb-0">
            To create projects, groups and launch sessions.
          </p>
        </div>
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
          <h4 className={cx("mb-0", "me-2")}>
            <PlayCircle className={cx("me-1", "bi")} />
            My sessions
          </h4>
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
  return noItems ? (
    <Link
      to={`/v2/search?page=1&perPage=12&q=type:${type}`}
      data-cy={`view-other-${type}s-btn`}
    >
      View other {type === "project" ? "projects" : "groups"}
    </Link>
  ) : (
    <Link
      to={`/v2/search?page=1&perPage=12&q=role:owner,editor,viewer+type:${type}+sort:created-desc`}
      data-cy={`view-my-${type}s-btn`}
    >
      View all my {total > 5 ? total : ""}{" "}
      {type === "project" ? "projects" : "groups"}
    </Link>
  );
}

function EmptyProjectsButtons() {
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
        to={"/v2/search?page=1&perPage=12&q=type:project"}
        className={cx("btn", "btn-outline-primary")}
      >
        <Eye className={cx("bi", "me-1")} />
        View existing projects
      </Link>
    </div>
  );
}
