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

import { Card, CardBody, Col, Row } from "reactstrap";
import { ACCESS_LEVELS } from "../../../api-client";
import { ProjectMigrationStatus } from "./migrations/ProjectCoreMigrations";
import { ProjectKnowledgeGraph } from "./migrations/ProjectKgStatus";
import { ProjectSettingsGeneralDeleteProject } from "./ProjectSettingsGeneralDeleteProject";
import { NotificationsManager } from "../../../notifications/notifications.types";
import { ProjectSettingsDescription } from "./ProjectSettingsDescription";
import { EditVisibility } from "../../../project/new/components/Visibility";
import { Visibilities } from "../../../components/visibility/Visibility";
import ProjectKeywordsInput from "../../../project/shared/ProjectKeywords";
import { ProjectSettingsAvatar } from "./ProjectSettingAvatar";
import { InfoAlert } from "../../../components/Alert";
import LoginAlert from "../../../components/loginAlert/LoginAlert";

// ****** SETTINGS COMPONENTS ****** //

interface ProjectSettingsGeneralProps {
  apiVersion?: string;
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
  metadataVersion?: number;
  notifications: NotificationsManager;
  projectPathWithNamespace: string;
  user: {
    logged: boolean;
  };
  [key: string]: unknown;
  settingsReadOnly: boolean;
}
export function ProjectSettingsGeneral(props: ProjectSettingsGeneralProps) {
  const isMaintainer = props.metadata?.accessLevel >= ACCESS_LEVELS.MAINTAINER;
  let loginElement = null;
  if (!props.user.logged) {
    const textPre = "You can";
    const textPost = "here.";
    loginElement = (
      <p className="mt-3 mb-0">
        <LoginAlert
          logged={false}
          noWrapper={true}
          textPre={textPre}
          textPost={textPost}
        />
      </p>
    );
  }
  return (
    <>
      <ProjectSettingsGeneralWrapped
        branch={props.metadata?.defaultBranch}
        gitUrl={props.metadata?.externalUrl}
        isMaintainer={isMaintainer}
        projectId={props.metadata?.id}
      />
      {props.settingsReadOnly ? (
        <InfoAlert dismissible={false} timeout={0}>
          <p className="mb-0">
            Project settings can be changed only by maintainers.
          </p>
          {loginElement}
        </InfoAlert>
      ) : (
        <>
          <EditVisibility
            namespace={props.metadata.namespace}
            namespaceKind={props.metadata.namespaceKind}
            forkedProjectId={props.forkedFromProject?.id}
            isMaintainer={isMaintainer}
            pathWithNamespace={props.projectPathWithNamespace}
            projectId={props.metadata?.id}
          />
          <ProjectSettingsDescription
            branch={props.metadata?.defaultBranch}
            gitUrl={props.metadata?.externalUrl}
            isMaintainer={isMaintainer}
            projectId={props.metadata?.id}
            projectFullPath={props.projectPathWithNamespace}
          />
          <ProjectKeywordsInput
            branch={props.metadata?.defaultBranch}
            gitUrl={props.metadata?.externalUrl}
            isMaintainer={isMaintainer}
            projectId={props.metadata?.id}
            projectFullPath={props.projectPathWithNamespace}
          />
          <ProjectSettingsAvatar
            branch={props.metadata?.defaultBranch}
            gitUrl={props.metadata?.externalUrl}
            isMaintainer={isMaintainer}
            projectId={props.metadata?.id}
            projectFullPath={props.projectPathWithNamespace}
          />
          <ProjectSettingsGeneralDeleteProject
            isMaintainer={isMaintainer}
            notifications={props.notifications}
            projectPathWithNamespace={props.projectPathWithNamespace}
            userLogged={props.user.logged}
          />
        </>
      )}
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
