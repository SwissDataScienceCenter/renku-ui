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
import { Col, Row } from "reactstrap";

import SessionsV2 from "../../sessionsV2/SessionsV2";
import { useProject } from "../ProjectPageContainer/ProjectPageContainer";
import { CodeRepositoriesDisplay } from "./CodeRepositories/RepositoriesBox";
import { DataSourcesDisplay } from "./DataSources/DataSourcesBox";
import { ProjectInformationCard } from "./ProjectInformation/ProjectInformation";

export default function ProjectOverviewPage() {
  const { project } = useProject();

  return (
    <Row className="row-gap-3">
      <Col className={cx("order-1", "order-lg-2")} xs={12} lg={2}>
        <ProjectInformationCard />
      </Col>
      <Col className={cx("order-2", "order-lg-1")} xs={12} lg={10}>
        <SessionsV2 project={project} />
      </Col>
      <Col className="order-3" xs={12} xl={6}>
        <DataSourcesDisplay project={project} />
      </Col>
      <Col className="order-4" xs={12} xl={6}>
        <CodeRepositoriesDisplay project={project} />
      </Col>
    </Row>
  );
}
