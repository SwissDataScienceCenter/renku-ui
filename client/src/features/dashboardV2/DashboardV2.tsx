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
  FolderFill,
  PeopleFill,
  PlayCircleFill,
  PlusLg,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Card, CardFooter, CardHeader, Col, Row } from "reactstrap";

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
          <h2>Welcome to the Renku 2.0 alpha preview!</h2>
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
          <WarnAlert className="mb-0" timeout={0} dismissible={false}>
            <h4>
              Do not do any important work in the Renku 2.0 alpha preview!
            </h4>
            <p className="mb-2">
              The alpha is for testing only. We do not guarantee saving and
              persisting work in the alpha.
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

// function GroupsDashboard() {
//   return (
//     <div
//       className={cx("bg-white", "p-2", "p-md-4", "mb-4")}
//       data-cy="groups-container"
//     >
//       <div
//         className={cx(
//           "d-flex",
//           "justify-content-between",
//           "align-items-center",
//           "flex-wrap",
//           "pb-3"
//         )}
//       >
//         <h2>Groups</h2>
//         <Link
//           className={cx("btn", "btn-rk-green", "btn-icon-text")}
//           to="/v2/groups/new"
//         >
//           <PlusLg className="bi" id="createPlus" />
//           <span className="d-none d-sm-inline">Create new group</span>
//         </Link>
//       </div>
//       <GroupsList />
//       <div className={cx("d-flex", "justify-content-center", "mt-2")}>
//         <Link
//           to="/v2/groups"
//           data-cy="view-my-groups-btn"
//           className={cx(
//             "btn",
//             "btn-outline-rk-green",
//             "d-flex",
//             "align-items-center"
//           )}
//         >
//           View all my groups
//         </Link>
//       </div>
//     </div>
//   );
// }

// function GroupsList() {
//   const { data, error, isLoading } = useGetGroupsQuery({
//     page: 1,
//     perPage: 5,
//   });

//   if (isLoading)
//     return (
//       <div className={cx("d-flex", "justify-content-center", "w-100")}>
//         <div className={cx("d-flex", "flex-column")}>
//           <Loader className="me-2" />
//           <div>Retrieving groups...</div>
//         </div>
//       </div>
//     );
//   if (error) return <div>Cannot show groups.</div>;

//   if (data == null) return <div>No 2.0 groups.</div>;

//   return (
//     <div
//       data-cy="dashboard-group-list"
//       className={cx("d-flex", "flex-column", "gap-3", "mb-sm-2", "mb-md-4")}
//     >
//       {data.groups?.map((group) => (
//         <DashboardListElement
//           data-cy="list-group"
//           key={group.id}
//           element={{
//             ...group,
//             readableId: group.slug,
//             visibility: "public",
//             url: generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
//               slug: group.slug,
//             }),
//           }}
//         />
//       ))}
//     </div>
//   );
// }

function ProjectsDashboard() {
  return (
    <Card className="border-primary-subtle" data-cy="projects-container">
      <CardHeader
        className={cx("bg-primary", "bg-opacity-10", "border-primary-subtle")}
      >
        <h4 className={cx("align-items-center", "d-flex", "m-0", "gap-2")}>
          <FolderFill className={cx("small", "text-icon")} />
          <span>Projects</span>
          <Link
            className={cx("btn", "btn-primary", "btn-sm", "ms-auto", "my-auto")}
            to="/v2/projects/new"
          >
            <PlusLg className="text-icon" id="createPlus" />
          </Link>
        </h4>
      </CardHeader>

      <ProjectList />

      <CardFooter className={cx("bg-white", "py-3")}>
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

  if (noProjects) return <div className="card-body">{noProjects}</div>;

  return (
    <ul
      className={cx("list-group", "list-group-flush")}
      data-cy="dashboard-project-list"
    >
      {data?.projects?.map((project) => (
        <ProjectSimple element="list-item" key={project.id} project={project} />
      ))}
    </ul>
  );
}

function GroupsDashboard() {
  return (
    <Card className="border-primary-subtle" data-cy="groups-container">
      <CardHeader
        className={cx("bg-primary", "bg-opacity-10", "border-primary-subtle")}
      >
        <h4 className={cx("align-items-center", "d-flex", "m-0", "gap-2")}>
          <PeopleFill className={cx("small", "text-icon")} />
          <span>Groups</span>
          <Link
            className={cx("btn", "btn-primary", "btn-sm", "ms-auto", "my-auto")}
            to="/v2/groups/new"
          >
            <PlusLg className="text-icon" id="createPlus" />
          </Link>
        </h4>
      </CardHeader>

      <GroupsList />

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

  if (noGroups) return <div className="card-body">{noGroups}</div>;

  return (
    <ul
      className={cx("list-group", "list-group-flush")}
      data-cy="dashboard-group-list"
    >
      {data?.groups?.map((group) => (
        <GroupSimple element="list-item" key={group.id} group={group} />
      ))}
    </ul>
  );
}

function SessionsDashboard() {
  return (
    <Card className="border-primary-subtle" data-cy="sessions-container">
      <CardHeader
        className={cx("bg-primary", "bg-opacity-10", "border-primary-subtle")}
      >
        <h4 className={cx("align-items-center", "d-flex", "m-0", "gap-2")}>
          <PlayCircleFill className={cx("small", "text-icon")} />
          Sessions
        </h4>
      </CardHeader>
      <DashboardV2Sessions />
    </Card>
  );
}
