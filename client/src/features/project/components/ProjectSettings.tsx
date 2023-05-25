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
 * limitations under the License.
 */

import React from "react";
import { Card, CardBody, Col, Row } from "reactstrap";

import { ProjectSettingsGeneral as ProjectSettingsGeneralLegacy } from "../../../project/settings";
import { ACCESS_LEVELS } from "../../../api-client";
import { ProjectMigrationStatus } from "./migrations/ProjectCoreMigrations";
import { ProjectKnowledgeGraph } from "./migrations/ProjectKgStatus";

// ****** SETTINGS COMPONENTS ****** //

interface ProjectSettingsGeneralWrapperProps {
  client: unknown;
  metadata: {
    accessLevel: number;
    defaultBranch: string;
    externalUrl: string;
    id: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
function ProjectSettingsGeneralWrapper(
  props: ProjectSettingsGeneralWrapperProps
) {
  const isMaintainer =
    props.metadata?.accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  return (
    <>
      <ProjectSettingsGeneral
        branch={props.metadata?.defaultBranch}
        gitUrl={props.metadata?.externalUrl}
        isMaintainer={isMaintainer}
        projectId={props.metadata?.id}
      />
      <ProjectSettingsGeneralLegacy {...props} />
    </>
  );
}
export { ProjectSettingsGeneralWrapper as ProjectSettingsGeneral };

interface ProjectSettingsGeneralProps {
  branch?: string;
  gitUrl: string;
  projectId: number;
  isMaintainer: boolean;
}
function ProjectSettingsGeneral({
  branch,
  gitUrl,
  isMaintainer,
  projectId,
}: ProjectSettingsGeneralProps) {
  return (
    <Card className="border-rk-light mb-4">
      <CardBody className="py-2">
        <Row>
          <Col>
            <ProjectMigrationStatus
              branch={branch}
              gitUrl={gitUrl}
              isMaintainer={isMaintainer}
            />
            <ProjectKnowledgeGraph
              projectId={projectId}
              isMaintainer={isMaintainer}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}
