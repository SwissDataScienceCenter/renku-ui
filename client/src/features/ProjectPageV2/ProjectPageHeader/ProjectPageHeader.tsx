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
 * limitations under the License.
 */
import cx from "classnames";
import { generatePath } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { UnderlineArrowLink } from "../../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { Project } from "../../projectsV2/api/projectV2.api";
import { ProjectImageView } from "../ProjectPageContent/ProjectInformation/ProjectInformation";

interface ProjectPageHeaderProps {
  project: Project;
}
export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });

  return (
    <header>
      <Row>
        <Col xs={12} lg={2}>
          <div className={cx("d-none", "d-lg-block")}>
            <ProjectImageView />
          </div>
        </Col>
        <Col xs={12} lg={10}>
          <Row>
            <Col>
              <h2 data-cy="project-name">{project.name}</h2>
            </Col>
          </Row>
          <Col>
            <div>
              {project.description?.length ? (
                <p data-cy="project-description">{project.description}</p>
              ) : (
                <p>
                  <UnderlineArrowLink
                    tooltip="Add project description"
                    text="Add description"
                    to={settingsUrl}
                  />
                </p>
              )}
            </div>
          </Col>
        </Col>
      </Row>
    </header>
  );
}
