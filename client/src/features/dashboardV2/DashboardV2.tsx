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
import { PlusLg } from "react-bootstrap-icons";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { WarnAlert } from "../../components/Alert";
import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import VisibilityIcon from "../../components/entities/VisibilityIcon";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import type { Project } from "../projectsV2/api/projectV2.api";
import {
  useGetGroupsQuery,
  useGetProjectsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import BackToV1Button from "../projectsV2/shared/BackToV1Button";

import DashboardV2Sessions from "./DashboardV2Sessions";

import "../dashboard/Dashboard.scss";
import styles from "./Dashboard.module.scss";

type ListElement = Pick<
  Project,
  "name" | "description" | "visibility" | "creation_date"
> & {
  readableId: string;
  url: string;
};

export default function DashboardV2() {
  return (
    <div>
      <DashboardWelcome />
      <SessionsDashboard />
      <ProjectsDashboard />
      <GroupsDashboard />
    </div>
  );
}

interface DashboardListElementProps {
  "data-cy": string;
  element: ListElement;
}

function DashboardListElement({
  "data-cy": dataCy,
  element,
}: DashboardListElementProps) {
  return (
    <div data-cy={dataCy} className={cx(styles.containerEntityListBar, "p-3")}>
      <div
        className={cx(styles.entityTitle, "text-truncate", "cursor-pointer")}
      >
        <Link
          data-cy={`${dataCy}-link`}
          className="text-decoration-none"
          to={element.url}
        >
          <div className={cx("text-truncate")}>
            <span className={cx("card-title", "text-truncate")}>
              {element.name}
            </span>
          </div>
        </Link>
      </div>
      <div
        className={cx(
          styles.entityIdentifier,
          "text-truncate",
          "cursor-pointer",
          "mb-3"
        )}
      >
        <Link
          data-cy={`${dataCy}-link`}
          className="text-decoration-none"
          to={element.url}
        >
          <div className={cx("fst-italic", "text-truncate")}>
            {element.readableId}
          </div>
        </Link>
      </div>
      <div className={cx(styles.entityDescription, "cursor-pointer")}>
        <Link className="text-decoration-none" to={element.url}>
          <div className={cx("card-text", "text-rk-dark", "m-0")}>
            {element.description}
          </div>
        </Link>
      </div>
      <div className={cx(styles.entityTypeVisibility, "align-items-baseline")}>
        <span className={cx("text-rk-green")}>
          <VisibilityIcon visibility={element.visibility} />
        </span>
      </div>
      <div className={cx(styles.entityDate)}>
        <TimeCaption datetime={element.creation_date} prefix="Created" />
      </div>
    </div>
  );
}

function DashboardWelcome() {
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>
            <b>Welcome to the Renku 2.0!</b>
          </h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={7}>
          <p>
            <b>Learn more about Renku 2.0</b> on our{" "}
            <ExternalLink
              className="me-2"
              url="https://blog.renkulab.io/renku-2/"
              iconAfter={true}
              role="text"
              title="blog"
            />
            and see what&rsquo;s ahead on our{" "}
            <ExternalLink
              url="https://github.com/SwissDataScienceCenter/renku-design-docs/blob/main/roadmap.md"
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
          <WarnAlert timeout={0} dismissible={false}>
            <h4>Do not do any important work in the Renku 2.0 beta preview!</h4>
            <p>
              The beta is for testing only. We do not guarantee saving and
              persisting work in the beta.
            </p>
            <div>
              You can go back to Renku 1.0 at any time.{" "}
              <BackToV1Button color="warning" />
            </div>
          </WarnAlert>
        </Col>
      </Row>
    </>
  );
}

function GroupsDashboard() {
  return (
    <div
      className={cx("bg-white", "p-2", "p-md-4", "mb-4")}
      data-cy="groups-container"
    >
      <div
        className={cx(
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "flex-wrap",
          "pb-3"
        )}
      >
        <h2>Groups</h2>
        <Link
          className={cx("btn", "btn-rk-green", "btn-icon-text")}
          to="/v2/groups/new"
        >
          <PlusLg className="bi" id="createPlus" />
          <span className="d-none d-sm-inline">Create new group</span>
        </Link>
      </div>
      <GroupsList />
      <div className={cx("d-flex", "justify-content-center", "mt-2")}>
        <Link
          to="/v2/groups"
          data-cy="view-my-groups-btn"
          className={cx(
            "btn",
            "btn-outline-rk-green",
            "d-flex",
            "align-items-center"
          )}
        >
          View all my groups
        </Link>
      </div>
    </div>
  );
}

function GroupsList() {
  const { data, error, isLoading } = useGetGroupsQuery({
    page: 1,
    perPage: 5,
  });

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader className="me-2" />
          <div>Retrieving groups...</div>
        </div>
      </div>
    );
  if (error) return <div>Cannot show groups.</div>;

  if (data == null) return <div>No 2.0 groups.</div>;

  return (
    <div
      data-cy="dashboard-group-list"
      className={cx("d-flex", "flex-column", "gap-3", "mb-sm-2", "mb-md-4")}
    >
      {data.groups?.map((group) => (
        <DashboardListElement
          data-cy="list-group"
          key={group.id}
          element={{
            ...group,
            readableId: group.slug,
            visibility: "public",
            url: generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
              slug: group.slug,
            }),
          }}
        />
      ))}
    </div>
  );
}

function ProjectsDashboard() {
  return (
    <div
      className={cx("bg-white", "p-2", "p-md-4", "mb-4")}
      data-cy="projects-container"
    >
      <div
        className={cx(
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "flex-wrap",
          "pb-3"
        )}
      >
        <h2>Projects</h2>
        <Link
          className={cx("btn", "btn-rk-green", "btn-icon-text")}
          to="/v2/projects/new"
        >
          <PlusLg className="bi" id="createPlus" />
          <span className="d-none d-sm-inline">Create new project</span>
        </Link>
      </div>
      <ProjectList />
      <div className={cx("d-flex", "justify-content-center", "mt-2")}>
        <Link
          to="/v2/projects"
          data-cy="view-my-projects-btn"
          className={cx(
            "btn",
            "btn-outline-rk-green",
            "d-flex",
            "align-items-center"
          )}
        >
          View all my projects
        </Link>
      </div>
    </div>
  );
}

function ProjectList() {
  const { data, error, isLoading } = useGetProjectsQuery({
    page: 1,
    perPage: 5,
  });

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader className="me-2" />
          <div>Retrieving projects...</div>
        </div>
      </div>
    );
  if (error) return <div>Cannot show projects.</div>;

  if (data == null) return <div>No 2.0 projects.</div>;

  return (
    <div
      data-cy="dashboard-project-list"
      className={cx("d-flex", "flex-column", "gap-3", "mb-sm-2", "mb-md-4")}
    >
      {data.projects?.map((project) => (
        <DashboardListElement
          data-cy="list-project"
          key={project.id}
          element={{
            ...project,
            readableId: `${project.namespace}/${project.slug}`,
            url: generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
              namespace: project.namespace,
              slug: project.slug,
            }),
          }}
        />
      ))}
    </div>
  );
}

function SessionsDashboard() {
  return (
    <div
      className={cx("bg-white", "p-2", "p-md-4", "mb-4")}
      data-cy="sessions-container"
    >
      <div
        className={cx(
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "flex-wrap"
        )}
      >
        <h2>Sessions</h2>
      </div>
      <DashboardV2Sessions />
    </div>
  );
}
