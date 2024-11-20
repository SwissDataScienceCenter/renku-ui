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
import {
  Calendar3Week,
  FileEarmarkText,
  Folder,
  Megaphone,
  People,
  PersonFillExclamation,
  PlayCircle,
  PlusLg,
  Send,
} from "react-bootstrap-icons";
import { generatePath, Link } from "react-router-dom-v5-compat";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  Row,
} from "reactstrap";
import { useLoginUrl } from "../../authentication/useLoginUrl.hook.ts";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants.ts";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook.ts";
import {
  useGetGroupsQuery,
  useGetProjectsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import GroupShortHandDisplay from "../projectsV2/show/GroupShortHandDisplay";
import ProjectShortHandDisplay from "../projectsV2/show/ProjectShortHandDisplay";
import SearchV2Bar from "../searchV2/components/SearchV2Bar.tsx";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../sessionsV2/sessionsV2.api.ts";
import { useGetUserQuery } from "../usersV2/api/users.api.ts";
import UserAvatar, { UserAvatarSize } from "../usersV2/show/UserAvatar.tsx";
import DashboardStyles from "./DashboardV2.module.scss";
import DashboardV2Sessions from "./DashboardV2Sessions";
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
        "w-100"
      )}
    >
      <picture>
        <source
          media="(min-width: 1400px)"
          srcSet="/dashboardHeader3840x280.png"
        />
        <source
          media="(min-width: 1200px)"
          srcSet="/dashboardHeader2560x280.png"
        />
        <source
          media="(min-width: 992px)"
          srcSet="/dashboardHeader1920x280.png"
        />
        <source
          media="(min-width: 768px)"
          srcSet="/dashboardHeader1080x280.png"
        />
        <source
          media="(min-width: 576px)"
          srcSet="/dashboardHeader750x200.png"
        />
        <img
          src="/dashboardHeader640x200.png"
          alt="Dashboard Header"
          className="img-fluid w-100"
        />
      </picture>
    </div>
  );
}

function FooterDashboard() {
  return (
    <Row className="g-3">
      <Col xs={12} lg={6} xl={3}>
        <Card className={cx(DashboardStyles.DashboardCard, "border-0")}>
          <CardBody>
            <a
              target="_blank"
              className={cx(
                "text-primary",
                "d-flex",
                "flex-column",
                "gap-4",
                "align-items-center",
                "py-4",
                "link-primary"
              )}
              rel="noreferrer noopener"
              href="https://blog.renkulab.io/"
            >
              <Megaphone size={27} />
              Renku updates
            </a>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} lg={6} xl={3}>
        <Card className={cx(DashboardStyles.DashboardCard, "border-0")}>
          <CardBody>
            <a
              target="_blank"
              className={cx(
                "text-primary",
                "d-flex",
                "flex-column",
                "gap-4",
                "align-items-center",
                "py-4",
                "link-primary"
              )}
              rel="noreferrer noopener"
              href="https://www.notion.so/renku/Documentation-db396cfc9a664cd2b161e4c6068a5ec9"
            >
              <FileEarmarkText size={27} />
              Documentation
            </a>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} lg={6} xl={3}>
        <Card className={cx(DashboardStyles.DashboardCard, "border-0")}>
          <CardBody>
            <a
              target="_blank"
              className={cx(
                "text-primary",
                "d-flex",
                "flex-column",
                "gap-4",
                "align-items-center",
                "py-4",
                "link-primary"
              )}
              rel="noreferrer noopener"
              href="https://www.notion.so/renku/f9caf41b579f474b8007803b007e3999?v=807326f870984774900fd87095225d7a"
            >
              <Calendar3Week size={27} />
              Community event
            </a>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} lg={6} xl={3}>
        <Card className={cx(DashboardStyles.DashboardCard, "border-0")}>
          <CardBody>
            <a
              target="_blank"
              className={cx(
                "text-primary",
                "d-flex",
                "flex-column",
                "gap-4",
                "align-items-center",
                "py-4",
                "text-center",
                "link-primary"
              )}
              rel="noreferrer noopener"
              href="mailto:hello@renku.io"
            >
              <Send size={27} />
              Contact us
            </a>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

function DashboardSearch() {
  return (
    <Row>
      <Col xs={12}>
        <Card className="bg-white">
          <CardHeader>
            <h3>Explore Renkulab</h3>
            <p>
              Discover and collaborate on innovative data science projects by
              exploring Renkulab.io{" "}
            </p>
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
  return (
    <Card data-cy="projects-container">
      <CardHeader className={cx("d-flex", "gap-2")}>
        <h4 className="m-0">
          <Folder className={cx("bi", "me-1")} />
          <span>Projects</span>
        </h4>
        <Link
          className={cx(
            "btn",
            "btn-outline-primary",
            "btn-sm",
            "ms-auto",
            "my-auto"
          )}
          to="/v2/projects/new"
        >
          <PlusLg className="bi" id="createPlus" />
        </Link>
      </CardHeader>

      <CardBody>
        <ProjectList />
      </CardBody>
    </Card>
  );
}

function ProjectList() {
  const { data, error, isLoading } = useGetProjectsQuery({
    params: {
      page: 1,
      per_page: 5,
      direct_member: true,
    },
  });

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
  ) : !data || data?.projects?.length === 0 ? (
    <div>No 2.0 projects.</div>
  ) : null;

  const viewLink = (
    <ViewAllLink
      noItems={!data || data?.projects?.length === 0}
      type="project"
    />
  );

  if (noProjects)
    return (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        {noProjects}
        {viewLink}
      </div>
    );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <ListGroup flush data-cy="dashboard-project-list">
        {data?.projects?.map((project) => (
          <ProjectShortHandDisplay
            element="list-item"
            key={project.id}
            project={project}
          />
        ))}
      </ListGroup>
      {viewLink}
    </div>
  );
}

function GroupsDashboard() {
  return (
    <Card data-cy="groups-container">
      <CardHeader className={cx("d-flex", "gap-2")}>
        <h4 className="m-0">
          <People className={cx("bi", "me-1")} />
          <span>My Groups</span>
        </h4>
        <Link
          className={cx(
            "btn",
            "btn-outline-primary",
            "btn-sm",
            "ms-auto",
            "my-auto"
          )}
          to="/v2/groups/new"
        >
          <PlusLg className="bi" id="createPlus" />
        </Link>
      </CardHeader>

      <CardBody>
        <GroupsList />
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
    <Card data-cy="user-container">
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
        <Link
          to={userPageUrl}
          className={cx("link-primary", "text-decoration-none")}
        >
          <UserAvatar
            firstName={userInfo.first_name}
            lastName={userInfo.last_name}
            username={userInfo.username}
            size={UserAvatarSize.extraLarge}
          />
        </Link>
        <Link
          to={userPageUrl}
          className={cx("link-primary", "text-decoration-none")}
        >
          <h3 className={cx("text-center", "mb-0")}>
            {userInfo.first_name} {userInfo.last_name}
          </h3>
        </Link>
        <p className="mb-0">
          <Link to={userPageUrl} className="link-primary">
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
              DashboardStyles.AnonymousAvatar
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

function GroupsList() {
  const { data, error, isLoading } = useGetGroupsQuery({
    params: {
      page: 1,
      per_page: 5,
      direct_member: true,
    },
  });

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
  ) : !data || data == null || data?.groups?.length === 0 ? (
    <div>No 2.0 groups.</div>
  ) : null;

  const viewLink = (
    <ViewAllLink noItems={!data || data?.groups?.length === 0} type="group" />
  );

  if (noGroups)
    return (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        {noGroups}
        {viewLink}
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
      {viewLink}
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
            My Sessions
          </h4>
          <Badge>{totalSessions}</Badge>
        </div>
        {totalSessions > 0 && (
          <p className={cx("mb-0", "mt-2")}>
            Session launchers are available to everyone who can see the project.
            Running sessions are only accessible to you.
          </p>
        )}
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
}: {
  type: "project" | "group";
  noItems: boolean;
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
      View all my {type === "project" ? "projects" : "groups"}
    </Link>
  );
}
