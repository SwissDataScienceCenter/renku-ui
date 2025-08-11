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
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Braces,
  CircleFill,
  Clock,
  Database,
  ExclamationTriangleFill,
  FileCode,
  Pencil,
} from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  ListGroup,
  ListGroupItem,
  Offcanvas,
  OffcanvasBody,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { TimeCaption } from "../../../components/TimeCaption";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import { RepositoryItem } from "../../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import SessionViewSessionSecrets from "../../ProjectPageV2/ProjectPageContent/SessionSecrets/SessionViewSessionSecrets";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../../dataConnectorsV2/api/data-connectors.enhanced-api";
import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../../dataServices/computeResources.api";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { Project } from "../../projectsV2/api/projectV2.api";
import { SessionRowResourceRequests } from "../../session/components/SessionsList";
import { SessionV2Actions, getShowSessionUrlByProject } from "../SessionsV2";
import StartSessionButton from "../StartSessionButton";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import { ModifyResourcesLauncherModal } from "../components/SessionModals/ModifyResourcesLauncher";
import UpdateSessionLauncherEnvironmentModal from "../components/SessionModals/UpdateSessionLauncherModal";
import {
  SessionBadge,
  SessionStatusV2Badge,
  SessionStatusV2Description,
  SessionStatusV2Title,
} from "../components/SessionStatus/SessionStatus";
import { DEFAULT_URL } from "../session.constants";
import { SessionV2 } from "../sessionsV2.types";
import EnvVariablesCard from "./EnvVariablesCard";
import EnvVariablesModal from "./EnvVariablesModal";
import EnvironmentCard from "./EnvironmentCard";

interface SessionCardContentProps {
  color: string;
  contentDescription: ReactNode;
  contentLabel: ReactNode;
  contentResources?: ReactNode;
  contentSession: ReactNode;
}
function SessionCardContent({
  color,
  contentDescription,
  contentLabel,
  contentResources,
  contentSession,
}: SessionCardContentProps) {
  return (
    <Card
      className={cx("bg-opacity-10", `bg-${color}`, `border-${color}-subtle`)}
    >
      <CardBody className={cx("d-flex", "flex-column")}>
        <Row className="g-2">
          <Col xs="auto" className="d-flex">
            {contentLabel}
          </Col>
          <Col xs="auto" className={cx("d-flex", "ms-auto")}>
            {contentSession}
          </Col>
          <Col xs={12} className={cx("d-flex", "align-items-center")}>
            {contentDescription}
          </Col>
          {contentResources && <Col xs={12}>{contentResources}</Col>}
        </Row>
      </CardBody>
    </Card>
  );
}

function SessionCard({
  session,
  project,
}: {
  session: SessionV2;
  project: Project;
}) {
  return (
    <SessionCardContent
      color={getSessionColor(session.status.state)}
      contentDescription={<SessionStatusV2Description session={session} />}
      contentLabel={<SessionStatusV2Badge session={session} />}
      contentSession={
        <ActiveSessionButton
          session={session}
          showSessionUrl={getShowSessionUrlByProject(project, session.name)}
        />
      }
      contentResources={
        <SessionRowResourceRequests
          resourceRequests={session.resources?.requests}
        />
      }
    />
  );
}

function SessionCardNotRunning({
  launcher,
  project,
}: {
  launcher: SessionLauncher;
  project: Project;
}) {
  return (
    <SessionCardContent
      color="dark"
      contentDescription={
        <div>
          <Clock className={cx("bi", "me-1")} />
          <TimeCaption
            datetime={launcher.creation_date}
            enableTooltip
            prefix="Created"
          />
        </div>
      }
      contentLabel={
        <div className="my-auto">
          <SessionBadge className={cx("border-dark-subtle", "bg-light")}>
            <CircleFill className={cx("me-1", "bi", "text-light-emphasis")} />
            <span className="text-dark-emphasis" data-cy="session-status">
              Not Running
            </span>
          </SessionBadge>
        </div>
      }
      contentSession={
        <div className="my-auto">
          <StartSessionButton
            launcher={launcher}
            namespace={project.namespace}
            slug={project.slug}
          />
        </div>
      }
    />
  );
}

function getSessionColor(state: string) {
  return state === "running"
    ? "success"
    : state === "starting"
    ? "warning"
    : state === "stopping"
    ? "warning"
    : state === "hibernated"
    ? "dark"
    : state === "failed"
    ? "danger"
    : "dark";
}

interface SessionViewProps {
  id?: string;
  isOpen: boolean;
  launcher?: SessionLauncher;
  project: Project;
  sessions?: SessionV2[];
  toggle: () => void;
  toggleUpdate?: () => void;
  toggleDelete?: () => void;
  toggleUpdateEnvironment?: () => void;
}
export function SessionView({
  id,
  launcher,
  sessions,
  toggle: setToggleSessionView,
  isOpen: toggleSessionView,
  project,
  toggleDelete,
  toggleUpdate,
  toggleUpdateEnvironment,
}: SessionViewProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isModifyResourcesOpen, setModifyResourcesOpen] = useState(false);
  const [isEnvVariablesModalOpen, setEnvVariablesModalOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  const toggleModifyResources = useCallback(() => {
    setModifyResourcesOpen((open) => !open);
  }, []);
  const toggleEnvVariables = useCallback(() => {
    setEnvVariablesModalOpen((open) => !open);
  }, []);
  const permissions = useProjectPermissions({ projectId: project.id });
  const environment = launcher?.environment;

  const { data: dataConnectorLinks } =
    useGetProjectsByProjectIdDataConnectorLinksQuery({
      projectId: project.id,
    });
  const dataConnectorIds = dataConnectorLinks?.map(
    (link) => link.data_connector_id
  );
  const { data: dataConnectorsMap } =
    useGetDataConnectorsListByDataConnectorIdsQuery(
      dataConnectorIds ? { dataConnectorIds } : skipToken
    );
  const dataConnectors = Object.values(dataConnectorsMap ?? {});

  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const {
    data: launcherResourceClass,
    isLoading: isLoadingLauncherResourceClass,
  } = useGetResourceClassByIdQuery(launcher?.resource_class_id ?? skipToken);

  const totalSession = sessions ? Object.keys(sessions).length : 0;
  const title = launcher ? launcher.name : "Orphan Session";
  const launcherMenu = launcher && (
    <SessionV2Actions
      launcher={launcher}
      toggleDelete={toggleDelete ?? undefined}
      toggleUpdate={toggleUpdate ?? undefined}
      toggleUpdateEnvironment={toggleUpdateEnvironment ?? undefined}
    />
  );
  const description =
    launcher && launcher.description ? (
      launcher.description
    ) : (
      <i>No description</i>
    );
  const key = launcher
    ? launcher.id
    : sessions && Object.keys(sessions).length > 0
    ? Object.keys(sessions)[0]
    : "nn";

  const userLauncherResourcePool = useMemo(
    () =>
      resourcePools?.find((pool) =>
        pool.classes.find((c) => c.id == launcher?.resource_class_id)
      ),
    [launcher, resourcePools]
  );
  const userLauncherResourceClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == launcher?.resource_class_id),
    [launcher, resourcePools]
  );

  const resourceDetails =
    !isLoadingLauncherResourceClass && launcherResourceClass ? (
      <SessionRowResourceRequests
        resourceRequests={{
          poolName: userLauncherResourcePool?.name,
          name: launcherResourceClass.name,
          cpu: launcherResourceClass.cpu,
          memory: launcherResourceClass.memory,
          storage:
            launcher?.disk_storage ?? launcherResourceClass.default_storage,
          gpu: launcherResourceClass.gpu,
        }}
      />
    ) : (
      <p>This session launcher does not have a default resource class.</p>
    );

  return (
    <Offcanvas
      id={id}
      key={`launcher-details-${key}`}
      toggle={setToggleSessionView}
      isOpen={toggleSessionView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="get-back-session-view"
            data-bs-dismiss="offcanvas"
            onClick={setToggleSessionView}
          ></button>
        </div>

        <div className={cx("d-flex", "flex-column", "gap-4")}>
          <div>
            <div>
              <div className={cx("float-end", "mt-1", "ms-1")}>
                {launcherMenu}
              </div>
              <div className={cx("d-flex", "flex-column")}>
                <span className={cx("small", "text-muted", "me-3")}>
                  {launcher ? "Session launcher" : "Session without launcher"}
                </span>
                <h2
                  className={cx("m-0", "text-break")}
                  data-cy="session-view-title"
                >
                  {title}
                </h2>
              </div>
            </div>
          </div>
          {description && <p className="m-0">{description}</p>}

          <div className={cx("d-flex", "flex-column", "gap-2")}>
            <h4 className="mb-0">Launched Session</h4>
            {totalSession > 0 ? (
              sessions &&
              Object.entries(sessions).map(([key, session]) => (
                <div key={key}>
                  <SessionStatusV2Title session={session} launcher={launcher} />
                  <SessionCard session={session} project={project} />
                </div>
              ))
            ) : (
              <div>
                <p className="mb-2">
                  No session is running from this launcher.
                </p>
                {launcher && (
                  <SessionCardNotRunning
                    project={project}
                    launcher={launcher}
                  />
                )}
              </div>
            )}
          </div>
          {launcher && (
            <div>
              <div className={cx("d-flex", "justify-content-between", "mb-2")}>
                <h4 className="my-auto">Session Environment</h4>
                <PermissionsGuard
                  disabled={null}
                  enabled={
                    <>
                      <Button
                        color="outline-primary"
                        id="modify-session-environment-button"
                        onClick={toggle}
                        size="sm"
                        tabIndex={0}
                      >
                        <Pencil className="bi" />
                      </Button>
                      <UncontrolledTooltip target="modify-session-environment-button">
                        Modify session environment
                      </UncontrolledTooltip>
                    </>
                  }
                  requestedPermission="write"
                  userPermissions={permissions}
                />
              </div>
              <EnvironmentCard launcher={launcher} />
              <UpdateSessionLauncherEnvironmentModal
                isOpen={isUpdateOpen}
                launcher={launcher}
                toggle={toggle}
              />
            </div>
          )}
          <div>
            <div className={cx("d-flex", "justify-content-between", "mb-2")}>
              <h4 className="my-auto">Default Resource Class</h4>
              {launcher && (
                <PermissionsGuard
                  disabled={null}
                  enabled={
                    <>
                      <Button
                        color="outline-primary"
                        id="modify-resource-class-button"
                        onClick={toggleModifyResources}
                        size="sm"
                        tabIndex={0}
                      >
                        <Pencil className="bi" />
                      </Button>
                      <UncontrolledTooltip target="modify-resource-class-button">
                        Set resource class
                      </UncontrolledTooltip>
                    </>
                  }
                  requestedPermission="write"
                  userPermissions={permissions}
                />
              )}
            </div>
            {resourceDetails}
            {launcherResourceClass && !userLauncherResourceClass && (
              <p>
                <ExclamationTriangleFill className={cx("bi", "text-warning")} />{" "}
                You do not have access to this resource class.
              </p>
            )}
            {launcher &&
              launcherResourceClass &&
              launcher.disk_storage &&
              launcher.disk_storage > launcherResourceClass.max_storage && (
                <p>
                  <ExclamationTriangleFill
                    className={cx("bi", "text-warning", "me-1")}
                  />
                  The selected disk storage exceeds the maximum value allowed (
                  {launcherResourceClass.max_storage} GB).
                </p>
              )}
            {launcher && (
              <ModifyResourcesLauncherModal
                isOpen={isModifyResourcesOpen}
                toggleModal={toggleModifyResources}
                resourceClassId={userLauncherResourceClass?.id}
                diskStorage={launcher.disk_storage}
                sessionLauncherId={launcher.id}
              />
            )}
          </div>

          <div>
            <h4>Default URL</h4>
            <p className="mb-2">
              The default URL specifies the URL pathname on the session to go to
              upon launch
            </p>
            <div>
              {launcher && launcher.environment?.default_url ? (
                <CommandCopy
                  command={launcher.environment?.default_url}
                  noMargin
                />
              ) : environment && environment?.default_url ? (
                <CommandCopy command={environment?.default_url} noMargin />
              ) : (
                <CommandCopy command={DEFAULT_URL} noMargin />
              )}
            </div>
          </div>

          <div>
            <div className={cx("align-items-center", "d-flex", "mb-2")}>
              <h4 className={cx("mb-0", "me-2")}>
                <Database className={cx("me-1", "bi")} />
                Data Connectors
              </h4>
              <Badge>{dataConnectors?.length || 0}</Badge>
            </div>
            {dataConnectors && dataConnectors.length > 0 ? (
              <ListGroup>
                {dataConnectors.map((storage, index) => (
                  <ListGroupItem key={`storage-${index}`}>
                    <div>Name: {storage.name}</div>
                    <div>Type: {storage.storage.storage_type}</div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <p className={cx("mb-0", "fst-italic")}>
                No data connectors included
              </p>
            )}
          </div>

          <div>
            <div className={cx("align-items-center", "d-flex", "mb-2")}>
              <h4
                className={cx("align-items-center", "d-flex", "mb-0", "me-2")}
              >
                <FileCode className={cx("me-1", "bi")} />
                Code Repositories
              </h4>
              {project?.repositories?.length != null && (
                <Badge>{project?.repositories?.length}</Badge>
              )}
            </div>
            {project.repositories && project.repositories.length > 0 ? (
              <ListGroup>
                {project.repositories.map((repositoryUrl, index) => (
                  <RepositoryItem
                    key={`storage-${index}`}
                    project={project}
                    readonly={true}
                    url={repositoryUrl}
                  />
                ))}
              </ListGroup>
            ) : (
              <p className={cx("mb-0", "fst-italic")}>
                No repositories included
              </p>
            )}
          </div>

          <SessionViewSessionSecrets />
          {launcher && (
            <div>
              <div
                className={cx(
                  "d-flex",
                  "align-items-center",
                  "justify-content-between",
                  "mb-2"
                )}
              >
                <h4 className={cx("mb-0", "me-2")}>
                  <Braces className={cx("me-1", "bi")} />
                  Environment Variables
                </h4>
                <PermissionsGuard
                  disabled={null}
                  enabled={
                    <>
                      <Button
                        color="outline-primary"
                        id="modify-env-variables-button"
                        onClick={toggleEnvVariables}
                        size="sm"
                        tabIndex={0}
                      >
                        <Pencil className="bi" />
                      </Button>
                      <UncontrolledTooltip target="modify-env-variables-button">
                        Modify environment variables
                      </UncontrolledTooltip>
                    </>
                  }
                  requestedPermission="write"
                  userPermissions={permissions}
                />
              </div>
              <p className="mb-2">
                Environment variables pass information into the session.
              </p>
              <EnvVariablesCard launcher={launcher} />
              <EnvVariablesModal
                isOpen={isEnvVariablesModalOpen}
                launcher={launcher}
                toggle={toggleEnvVariables}
              />
            </div>
          )}
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
