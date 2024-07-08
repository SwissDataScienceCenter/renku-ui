/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom-v5-compat";

import FormSchema from "../../../components/formschema/FormSchema";
import { Loader } from "../../../components/Loader";
import { Pagination } from "../../../components/Pagination";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { useGetProjectsQuery } from "../api/projectV2.enhanced-api";
import WipBadge from "../shared/WipBadge";
import ProjectSimple from "../show/ProjectSimple";

function ProjectList() {
  const perPage = 10;
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useGetProjectsQuery({
    page,
    perPage,
  });

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader />
          <div>Retrieving projects...</div>
        </div>
      </div>
    );
  if (error)
    return (
      <>
        <p>Cannot show projects.</p>
        <RtkOrNotebooksError error={error} />
      </>
    );

  if (data == null || data.projects.length < 1) return <p>No V2 projects.</p>;

  return (
    <>
      <Row className="g-3">
        {data.projects?.map((project) => (
          <Col xs={12} sm={6} xl={4} key={project.id}>
            <ProjectSimple element="card" project={project} />
          </Col>
        ))}
      </Row>
      <Pagination
        currentPage={data.page}
        perPage={perPage}
        totalItems={data.total}
        onPageChange={setPage}
      />
    </>
  );
}

export default function ProjectV2List() {
  const newProjectUrl = ABSOLUTE_ROUTES.v2.projects.new;
  return (
    <FormSchema
      showHeader={true}
      title="List Projects (V2)"
      description={
        <>
          <p>
            All visible projects
            <WipBadge className="ms-2" />
          </p>
          <div className="mb-3">
            <Link className={cx("btn", "btn-primary")} to={newProjectUrl}>
              Create New Project
            </Link>
          </div>
        </>
      }
    >
      <ProjectList />
    </FormSchema>
  );
}
