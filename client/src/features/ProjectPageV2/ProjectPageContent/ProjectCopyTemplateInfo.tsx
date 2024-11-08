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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Card, CardBody, CardHeader } from "reactstrap";

import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

import { useGetProjectsByProjectIdQuery } from "../../projectsV2/api/projectV2.enhanced-api";

import { useProject } from "../ProjectPageContainer/ProjectPageContainer";
import { Loader } from "../../../components/Loader";

export default function ProjectCopyTemplateInfo() {
  const { project } = useProject();
  const { data: templateProject } = useGetProjectsByProjectIdQuery(
    project.template_id
      ? {
          projectId: project.template_id,
        }
      : skipToken
  );

  if (!project.template_id) return null;
  if (!templateProject) return <Loader />;
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: templateProject?.namespace,
    slug: templateProject?.slug,
  });
  return (
    <Card data-cy="project-copy-template-info-card">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          This project was copied from:
        </div>
      </CardHeader>
      <CardBody>
        {" "}
        <div>
          <Link
            color="outline-secondary"
            className={cx("d-flex", "align-items-center")}
            data-cy="copy-project-template-link"
            to={projectUrl}
          >
            {templateProject.name}
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
