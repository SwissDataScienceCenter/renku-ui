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
import { ACCESS_LEVELS } from "../../../api-client";
import { Visibilities } from "../../../components/visibility/Visibility";
import { NotificationsInterface } from "../../../notifications/notifications.types";
import { EditVisibility } from "../../../project/new/components/Visibility";
import { ProjectSettingsGeneral as ProjectSettingsGeneralLegacy } from "../../../project/settings";
import { ProjectSettingsDescription } from "./ProjectSettingsDescription";
import { ProjectSettingsGeneralDeleteProject } from "./ProjectSettingsGeneralDeleteProject";
import { ProjectMigrationStatus } from "./migrations/ProjectCoreMigrations";
import { ProjectKnowledgeGraph } from "./migrations/ProjectKgStatus";

// ****** SETTINGS COMPONENTS ****** //

interface ProjectSettingsGeneralProps {
  client: unknown;
  forkedFromProject?: {
    id: number;
    [key: string]: unknown;
  };
  metadata: {
    accessLevel: number;
    defaultBranch: string;
    externalUrl: string;
    id: number;
    namespace: string;
    namespaceKind: string;
    visibility: Visibilities;
    [key: string]: unknown;
  };
  notifications: NotificationsInterface;
  projectPathWithNamespace: string;
  user: {
    logged: boolean;
  };
  [key: string]: unknown;
}
export function ProjectSettingsGeneral(props: ProjectSettingsGeneralProps) {
  const isMaintainer = props.metadata?.accessLevel >= ACCESS_LEVELS.MAINTAINER;
  return (
    <>
      <ProjectSettingsGeneralWrapped
        branch={props.metadata?.defaultBranch}
        gitUrl={props.metadata?.externalUrl}
        isMaintainer={isMaintainer}
        projectId={props.metadata?.id}
      />
      <EditVisibility
        namespace={props.metadata.namespace}
        namespaceKind={props.metadata.namespaceKind}
        forkedProjectId={props.forkedFromProject?.id}
        isMaintainer={isMaintainer}
        pathWithNamespace={props.projectPathWithNamespace}
        projectId={props.metadata?.id}
      />
      <ProjectSettingsDescription
        gitUrl={props.metadata?.externalUrl}
        isMaintainer={isMaintainer}
        projectId={props.metadata?.id}
        projectFullPath={props.projectPathWithNamespace}
      />
      <ProjectSettingsGeneralLegacy {...props} />
      <ProjectSettingsGeneralDeleteProject
        isMaintainer={isMaintainer}
        notifications={props.notifications}
        projectPathWithNamespace={props.projectPathWithNamespace}
        userLogged={props.user.logged}
      />
    </>
  );
}

interface ProjectSettingsGeneralWrappedProps {
  branch?: string;
  gitUrl: string;
  projectId: number;
  isMaintainer: boolean;
}
function ProjectSettingsGeneralWrapped({
  branch,
  gitUrl,
  isMaintainer,
  projectId,
}: ProjectSettingsGeneralWrappedProps) {
  return (
    <Card className="mb-4" data-cy="project-settings-general">
      <CardBody className="py-2">
        <Row>
          <Col>
            <div data-cy="project-settings-migration-status">
              <ProjectMigrationStatus
                branch={branch}
                gitUrl={gitUrl}
                isMaintainer={isMaintainer}
              />
            </div>
            <div data-cy="project-settings-knowledge-graph">
              <ProjectKnowledgeGraph
                projectId={projectId}
                isMaintainer={isMaintainer}
              />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}
