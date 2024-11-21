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
import { Folder, People, PlayCircle, PlusLg } from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Card, CardBody, CardHeader, Col, ListGroup, Row } from "reactstrap";

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import {
  useGetGroupsQuery,
  useGetProjectsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import GroupShortHandDisplay from "../projectsV2/show/GroupShortHandDisplay";
import ProjectShortHandDisplay from "../projectsV2/show/ProjectShortHandDisplay";
import DashboardV2Sessions from "./DashboardV2Sessions";
import CreateProjectV2Button from "../projectsV2/new/CreateProjectV2Button";

export default function DashboardV2() {
  return (
    <div className={cx("d-flex", "flex-column", "gap-4")}>
      <DashboardWelcome />
      <Row>
        <Col xs={12} lg={8} className={cx("d-flex", "flex-column", "gap-4")}>
          <SessionsDashboard />
          <ProjectsDashboard />
        </Col>
        <Col
          xs={12}
          lg={4}
          className={cx("d-flex", "flex-column", "mt-4", "mt-lg-0")}
        >
          <GroupsDashboard />
        </Col>
      </Row>
    </div>
  );
}

function DashboardWelcome() {
  return (
    <div className="mt-2">
      <Row>
        <Col>
          <h2 className="text-center">
            Welcome to the Renku 2.0 beta preview!!
          </h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p className={cx("text-center", "mb-0")}>
            <b>Learn more about Renku 2.0</b> on our{" "}
            <ExternalLink
              url="https://blog.renkulab.io/renku-2/"
              iconAfter={true}
              role="text"
              title="blog"
            />{" "}
            and see what&rsquo;s ahead on our{" "}
            <ExternalLink
              url="https://renku.notion.site/Roadmap-b1342b798b0141399dc39cb12afc60c9"
              iconAfter={true}
              role="text"
              title="roadmap"
            />
            . Feedback?{" "}
            <a href="mailto:hello@renku.io">We&rsquo;d love to hear it!</a>
          </p>
        </Col>
      </Row>
    </div>
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
        <CreateProjectV2Button
          className={cx("btn-sm", "ms-auto", "my-auto")}
          data-cy="navbar-project-new"
          color="outline-primary"
        >
          <PlusLg className="bi" id="createPlus" />
        </CreateProjectV2Button>
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
          <span>Groups</span>
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
  return (
    <Card data-cy="sessions-container">
      <CardHeader className={cx("d-flex", "gap-2")}>
        <h4 className="m-0">
          <PlayCircle className={cx("bi", "me-1")} />
          Sessions
        </h4>
      </CardHeader>

      <CardBody>
        <DashboardV2Sessions />
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
