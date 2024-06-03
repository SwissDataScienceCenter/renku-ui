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
import ProjectInformation from "./ProjectInformation/ProjectInformation";
import ProjectPageOverview from "./ProjectOverview/ProjectOverview";

export default function ProjectOverviewPage() {
  return (
    <Row className="pt-4">
      <Col sm={12} lg={10}>
        <ProjectPageOverview />
      </Col>
      <Col sm={12} lg={2} className={cx("d-none", "d-lg-block", " d-sm-none")}>
        <ProjectInformation />
      </Col>
    </Row>
  );
}
