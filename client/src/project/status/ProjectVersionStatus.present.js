/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

import React, { Fragment } from "react";
import { Row, Col, Card, CardBody, CardHeader } from "reactstrap";

import RenkuLabUiCompatibilityStatus from "./RenkuLabCompatibilityStatus.present";
import RenkuVersionStatus from "./RenkuVersionStatus.present";
import TemplateStatus from "./TemplateVersionStatus.present";

import { ACCESS_LEVELS } from "../../api-client";

function ProjectVersionStatusBody(props) {
  const logged = props.user.logged;
  const maintainer = props.metadata.accessLevel >= ACCESS_LEVELS.MAINTAINER;
  const onMigrateProject = async (options) => {
    return await props.onMigrateProject(props.metadata?.httpUrl, props.metadata?.defaultBranch, options);
  };

  return <Fragment>
    <Card key="renkuLabUICompatibility" className="border-rk-light mb-4">
      <CardHeader className="bg-white p-3 ps-4">RenkuLab UI Compatibility</CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg">
        <Row><Col>
          <RenkuLabUiCompatibilityStatus
            loading={props.loading}
            maintainer={maintainer}
            migration={props.migration} />
        </Col></Row>
      </CardBody>
    </Card>
    <Card key="renkuVersion" className="border-rk-light mb-4">
      <CardHeader className="bg-white p-3 ps-4">Renku Version</CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg">
        <Row><Col>
          <RenkuVersionStatus
            launchNotebookUrl={props.launchNotebookUrl}
            loading={props.loading}
            logged={logged}
            maintainer={maintainer}
            migration={props.migration}
            onMigrateProject={onMigrateProject}
            statistics={props.statistics} />
        </Col></Row>
      </CardBody>
    </Card>
    <Card key="templateVersion" className="border-rk-light mb-4">
      <CardHeader className="bg-white p-3 ps-4">Template Version</CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
        <Row><Col>
          <TemplateStatus
            externalUrl={props.externalUrl}
            launchNotebookUrl={props.launchNotebookUrl}
            loading={props.loading}
            logged={logged}
            maintainer={maintainer}
            migration={props.migration}
            onMigrateProject={onMigrateProject} />
        </Col></Row>
      </CardBody>
    </Card>
  </Fragment>;
}
export default ProjectVersionStatusBody;
