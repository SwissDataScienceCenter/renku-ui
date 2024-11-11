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
  Boxes,
  CircleFill,
  Clock,
  Database,
  ExclamationTriangleFill,
  FileCode,
  Globe2,
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
import { TimeCaption } from "../../../components/TimeCaption";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import { RepositoryItem } from "../../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../../dataConnectorsV2/api/data-connectors.enhanced-api";
import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../../dataServices/computeResources.api";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { Project } from "../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { SessionRowResourceRequests } from "../../session/components/SessionsList";
import { Session, Sessions } from "../../session/sessions.types";
import { SessionV2Actions, getShowSessionUrlByProject } from "../SessionsV2";
import StartSessionButton from "../StartSessionButton";
import UpdateSessionLauncherModal from "../UpdateSessionLauncherModal";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import { ModifyResourcesLauncherModal } from "../components/SessionModals/ModifyResourcesLauncher";
import {
  SessionBadge,
  SessionStatusV2Description,
  SessionStatusV2Label,
  SessionStatusV2Title,
} from "../components/SessionStatus/SessionStatus";
import { DEFAULT_URL } from "../session.constants";
import { SessionLauncher } from "../sessionsV2.types";
import { EnvironmentCard } from "./EnvironmentCard";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../../dataConnectorsV2/api/data-connectors.enhanced-api";
import {
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  useGetProjectsByProjectIdMembersQuery,
} from "../../projectsV2/api/projectV2.enhanced-api";

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
          <Col xs="auto" className={cx("d-flex", "ms-sm-auto")}>
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
  session: Session;
  project: Project;
}) {
  return (
    <SessionCardContent
      color={getSessionColor(session.status.state)}
      contentDescription={<SessionStatusV2Description session={session} />}
      contentLabel={<SessionStatusV2Label session={session} />}
      contentSession={
        <ActiveSessionButton
          session={session}
          showSessionUrl={getShowSessionUrlByProject(project, session.name)}
        />
      }
      contentResources={
        <SessionRowResourceRequests
          resourceRequests={session.resources.requests}
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
            launcherId={launcher.id}
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
  sessions?: Sessions;
  toggle: () => void;
}
export function SessionView({
  id,
  launcher,
  sessions,
  toggle: setToggleSessionView,
  isOpen: toggleSessionView,
  project,
}: SessionViewProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isModifyResourcesOpen, setModifyResourcesOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  const toggleModifyResources = useCallback(() => {
    setModifyResourcesOpen((open) => !open);
  }, []);
  const permissions = useProjectPermissions({ projectId: project.id });
  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
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
    <SessionV2Actions launcher={launcher} sessionsLength={totalSession} />
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
          name: launcherResourceClass.name,
          cpu: launcherResourceClass.cpu,
          memory: `${launcherResourceClass.memory}G`,
          storage: `${launcherResourceClass.default_storage}G`,
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
            <div className={cx("d-flex", "justify-content-between")}>
              <h2 className="m-0" data-cy="session-view-title">
                {title}
              </h2>
              <div className="my-auto">{launcherMenu}</div>
            </div>
            <p className={cx("fst-italic", "m-0")}>
              {launcher ? "Session launcher" : "Session without launcher"}
            </p>
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
              <UpdateSessionLauncherModal
                isOpen={isUpdateOpen}
                launcher={launcher}
                toggle={toggle}
              />
            </div>
          )}
          <div>
            <div className={cx("d-flex", "justify-content-between", "mb-2")}>
              <h4 className="my-auto">Default Resource Class</h4>
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
            </div>
            {resourceDetails}
            {launcherResourceClass && !userLauncherResourceClass && (
              <p>
                <ExclamationTriangleFill className={cx("bi", "text-warning")} />{" "}
                You do not have access to this resource class.
              </p>
            )}
            <ModifyResourcesLauncherModal
              isOpen={isModifyResourcesOpen}
              toggleModal={toggleModifyResources}
              resourceClassId={userLauncherResourceClass?.id}
              sessionLauncherId={launcher?.id}
            />
          </div>

          <div>
            <h4>Default URL</h4>
            <p className="mb-2">
              The default URL specifies the URL fragment on the session to go to
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
            {dataConnectors && dataConnectors?.length > 0 ? (
              <ListGroup>
                {dataConnectors?.map((storage, index) => (
                  <ListGroupItem key={`storage-${index}`}>
                    <div>Name: {storage.name}</div>
                    <div>Type: {storage.storage.storage_type}</div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <p className="fst-italic">No data connectors included</p>
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
            {dataConnectors && dataConnectors?.length > 0 ? (
              <ListGroup>
                {project.repositories?.map((repositoryUrl, index) => (
                  <RepositoryItem
                    key={`storage-${index}`}
                    project={project}
                    readonly={true}
                    url={repositoryUrl}
                  />
                ))}
              </ListGroup>
            ) : (
              <p className="fst-italic">No repositories included</p>
            )}
          </div>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
