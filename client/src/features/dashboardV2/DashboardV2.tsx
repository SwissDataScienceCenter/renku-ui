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
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  ListGroup,
  Row,
} from "reactstrap";

import { WarnAlert } from "../../components/Alert";
import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import {
  useGetGroupsQuery,
  useGetProjectsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import BackToV1Button from "../projectsV2/shared/BackToV1Button";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import DashboardV2Sessions from "./DashboardV2Sessions";
import GroupSimple from "../projectsV2/show/GroupSimple";
import ProjectSimple from "../projectsV2/show/ProjectSimple";

export default function DashboardV2() {
  return (
    <div className={cx("d-flex", "flex-column", "gap-4")}>
      <DashboardWelcome />
      <SessionsDashboard />
      <ProjectsDashboard />
      <GroupsDashboard />
    </div>
  );
}

function DashboardWelcome() {
  return (
    <div>
      <Row>
        <Col>
          <h2>Welcome to the Renku 2.0 beta preview!</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
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
      <Row>
        <Col>
          <WarnAlert className="mb-0" timeout={0} dismissible={false}>
            <h4>Do not do any important work in the Renku 2.0 beta preview!</h4>
            <p className="mb-2">
              The beta is for testing only. We do not guarantee saving and
              persisting work in the beta.
            </p>
            <div>
              You can go <BackToV1Button color="warning" /> at any time.
            </div>
          </WarnAlert>
        </Col>
      </Row>
    </div>
  );
}

function ProjectsDashboard() {
  return (
    <Card data-cy="projects-container">
      <CardHeader>
        <h4 className={cx("align-items-center", "d-flex", "m-0", "gap-2")}>
          <Folder className={cx("small", "bi")} />
          <span>Projects</span>
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
        </h4>
      </CardHeader>

      <CardBody>
        <ProjectList />
      </CardBody>

      <CardFooter>
        <Link to="/v2/projects" data-cy="view-my-projects-btn">
          View all my projects
        </Link>
      </CardFooter>
    </Card>
  );
}

function ProjectList() {
  const { data, error, isLoading } = useGetProjectsQuery({
    page: 1,
    perPage: 5,
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
  ) : data == null || data?.total === 0 ? (
    <div>No 2.0 projects.</div>
  ) : null;

  if (noProjects) return <div>{noProjects}</div>;

  return (
    <ListGroup flush data-cy="dashboard-project-list">
      {data?.projects?.map((project) => (
        <ProjectSimple element="list-item" key={project.id} project={project} />
      ))}
    </ListGroup>
  );
}

function GroupsDashboard() {
  return (
    <Card data-cy="groups-container">
      <CardHeader>
        <h4 className={cx("align-items-center", "d-flex", "m-0", "gap-2")}>
          <People className={cx("small", "bi")} />
          <span>Groups</span>
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
        </h4>
      </CardHeader>

      <CardBody>
        <GroupsList />
      </CardBody>

      <CardFooter className={cx("bg-white", "py-3")}>
        <Link to="/v2/groups" data-cy="view-my-groups-btn">
          View all my groups
        </Link>
      </CardFooter>
    </Card>
  );
}

function GroupsList() {
  const { data, error, isLoading } = useGetGroupsQuery({
    page: 1,
    perPage: 5,
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
  ) : data == null || data?.total === 0 ? (
    <div>No 2.0 groups.</div>
  ) : null;

  if (noGroups) return <div>{noGroups}</div>;

  return (
    <ListGroup flush data-cy="dashboard-group-list">
      {data?.groups?.map((group) => (
        <GroupSimple element="list-item" key={group.id} group={group} />
      ))}
    </ListGroup>
  );
}

function SessionsDashboard() {
  return (
    <Card data-cy="sessions-container">
      <CardHeader>
        <h4 className={cx("align-items-center", "d-flex", "m-0", "gap-2")}>
          <PlayCircle className={cx("small", "bi")} />
          Sessions
        </h4>
      </CardHeader>

      <CardBody>
        <DashboardV2Sessions />
      </CardBody>
    </Card>
  );
}
