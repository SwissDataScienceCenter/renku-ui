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
import { useState } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import FormSchema from "../../../components/formschema/FormSchema";
import { Loader } from "../../../components/Loader";
import { Pagination } from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { Url } from "../../../utils/helpers/url";

import { useGetProjectsQuery } from "../api";
import type { Project } from "../api";

import styles from "./projectV2List.module.scss";

interface ProjectV2ListProjectProps {
  project: Project;
}
function ProjectV2ListProject({ project }: ProjectV2ListProjectProps) {
  const projectUrl = Url.get(Url.pages.projectsV2.show, { id: project.id });
  return (
    <div
      data-cy="list-card"
      className={cx("m-2", "rk-search-result-card", styles.listProjectWidth)}
    >
      <div className="card card-entity p-3">
        <h3>
          <Link to={projectUrl}>{project.name}</Link>
        </h3>
        <div className="mb-2">{project.description}</div>
        <div className="d-flex align-items-baseline">
          <span className="me-3 fst-italic">{project.visibility}</span>
          <TimeCaption datetime={project.creation_date} prefix="Created" />
        </div>
      </div>
    </div>
  );
}

function ProjectList() {
  const perPage = 10;
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useGetProjectsQuery({
    page,
    perPage,
  });

  if (isLoading)
    return (
      <div className="d-flex justify-content-center w-100">
        <div className="d-flex flex-column">
          <Loader className="me-2" />
          <div>Retrieving projects...</div>
        </div>
      </div>
    );
  if (error) return <div>Cannot show projects.</div>;

  if (data == null) return <div>No V2 projects.</div>;

  return (
    <>
      <div className="d-flex flex-wrap w-100">
        {data.projects?.map((project) => (
          <ProjectV2ListProject key={project.id} project={project} />
        ))}
      </div>
      <Pagination
        currentPage={data.page}
        perPage={perPage}
        totalItems={data.total}
        onPageChange={(page: number) => {
          setPage(page);
        }}
        className="d-flex justify-content-center rk-search-pagination"
      />
    </>
  );
}

export default function ProjectV2List() {
  return (
    <FormSchema
      showHeader={true}
      title="List Projects (V2)"
      description={<div>All visible projects</div>}
    >
      <ProjectList />
    </FormSchema>
  );
}
