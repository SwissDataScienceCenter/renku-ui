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
  Box2,
  Braces,
  CircleFill,
  Clock,
  Cpu,
  Database,
  ExclamationTriangleFill,
  FileCode,
  Link45deg,
  Pencil,
  PlayCircle,
} from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  ListGroupItem,
  Offcanvas,
  OffcanvasBody,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import OffcanvasHeaderWithType from "~/components/offcanvas/OffcanvasHeaderWithType";
import OffcanvasTopButtons from "~/components/offcanvas/OffcanvasTopButtons";
import { useGetProjectsByProjectIdDataConnectorLinksQuery } from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import { TimeCaption } from "../../../components/TimeCaption";
import { useGetDataConnectorsListByDataConnectorIdsQuery } from "../../dataConnectorsV2/api/data-connectors.enhanced-api";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { RepositoryItem } from "../../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import SessionViewSessionSecrets from "../../ProjectPageV2/ProjectPageContent/SessionSecrets/SessionViewSessionSecrets";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import {
  useGetClassesByClassIdQuery,
  useGetResourcePoolsQuery,
} from "../api/computeResources.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { LauncherActions } from "../components/launcherActions/LauncherActions";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import { ModifyResourcesLauncherModal } from "../components/SessionModals/ModifyResourcesLauncher";
import UpdateSessionLauncherEnvironmentModal from "../components/SessionModals/UpdateSessionLauncherModal";
import { SessionRowResourceRequests } from "../components/SessionsList";
import {
  SessionBadge,
  SessionStatusV2Badge,
  SessionStatusV2Description,
  SessionStatusV2Title,
} from "../components/SessionStatus/SessionStatus";
import { DEFAULT_URL } from "../session.constants";
import {
  getLauncherCategory,
  getLauncherCategoryDefinition,
} from "../session.utils";
import { getShowSessionUrlByProject, SessionV2Actions } from "../SessionsV2";
import { LauncherCategory, SessionV2 } from "../sessionsV2.types";
import EnvironmentItem from "./EnvironmentItem";
import EnvVariablesCard from "./EnvVariablesCard";
import EnvVariablesModal from "./EnvVariablesModal";

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
  launcherCategory,
}: {
  session: SessionV2;
  project: Project;
  launcherCategory: LauncherCategory;
}) {
  return (
    <SessionCardContent
      color={getSessionColor(session.status.state, launcherCategory)}
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
  hasSession,
  launcher,
  project,
}: {
  hasSession?: boolean;
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
          <LauncherActions
            placement="launcher-side-panel"
            hasSession={hasSession}
            launcher={launcher}
            namespace={project.namespace}
            slug={project.slug}
          />
        </div>
      }
    />
  );
}

function getSessionColor(state: string, launcherCategory: LauncherCategory) {
  return state === "running" && launcherCategory === "session"
    ? "success"
    : state === "running" && launcherCategory === "job"
      ? "warning"
      : state === "starting"
        ? "warning"
        : state === "succeeded"
          ? "success"
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

  // for orphan session/jobs in case can't find the type we assume is  a session
  const orphanType =
    !launcher && sessions && sessions?.length >= 1
      ? sessions[0].session_type
      : null;
  const orphanCategory = orphanType === "non-interactive" ? "job" : "session";

  const launcherCategory = launcher && getLauncherCategory(launcher);
  const launcherDefinition = getLauncherCategoryDefinition(
    launcherCategory || orphanCategory,
  );

  const { data: dataConnectorLinks } =
    useGetProjectsByProjectIdDataConnectorLinksQuery({
      projectId: project.id,
    });
  const dataConnectorIds = dataConnectorLinks?.map(
    (link) => link.data_connector_id,
  );
  const { data: dataConnectorsMap } =
    useGetDataConnectorsListByDataConnectorIdsQuery(
      dataConnectorIds ? { dataConnectorIds } : skipToken,
    );
  const dataConnectors = Object.values(dataConnectorsMap ?? {});

  const { data: resourcePools } = useGetResourcePoolsQuery({});
  const {
    data: launcherResourceClass,
    isLoading: isLoadingLauncherResourceClass,
  } = useGetClassesByClassIdQuery(
    launcher?.resource_class_id
      ? { classId: `${launcher.resource_class_id}` }
      : skipToken,
  );

  const totalSession = sessions ? Object.keys(sessions).length : 0;
  const title = launcher
    ? launcher.name
    : `Orphan ${launcherDefinition?.text.inline} without launcher`;
  const launcherMenu = launcher && (
    <SessionV2Actions
      launcher={launcher}
      toggleDelete={toggleDelete ?? undefined}
      toggleUpdate={toggleUpdate ?? undefined}
      toggleUpdateEnvironment={toggleUpdateEnvironment ?? undefined}
    />
  );
  const description = launcher?.description;

  const key = launcher
    ? launcher.id
    : sessions && Object.keys(sessions).length > 0
      ? Object.keys(sessions)[0]
      : "nn";

  const userLauncherResourcePool = useMemo(
    () =>
      resourcePools?.find((pool) =>
        pool.classes.find((c) => c.id == launcher?.resource_class_id),
      ),
    [launcher, resourcePools],
  );
  const userLauncherResourceClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == launcher?.resource_class_id),
    [launcher, resourcePools],
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
        <OffcanvasTopButtons
          entityType="session-launcher"
          toggleView={setToggleSessionView}
        />

        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <OffcanvasHeaderWithType
            entityName={
              launcher
                ? `${launcherDefinition?.text.display} launcher`
                : `${launcherDefinition?.text.display} without launcher`
            }
            entityType={`${launcherCategory || orphanCategory}-launcher`}
            title={title}
          >
            {launcherMenu}
          </OffcanvasHeaderWithType>

          {description && <p className="m-0">{description}</p>}

          <Card>
            <CardHeader tag="h3">
              <PlayCircle className="me-1" />
              Launched {launcherDefinition?.text.display}
            </CardHeader>
            <CardBody>
              {totalSession > 0 ? (
                sessions &&
                Object.entries(sessions).map(([key, session]) => (
                  <div key={key}>
                    <SessionStatusV2Title
                      session={session}
                      launcher={launcher}
                    />
                    <SessionCard
                      session={session}
                      project={project}
                      launcherCategory={launcherCategory || orphanCategory}
                    />
                  </div>
                ))
              ) : (
                <div>
                  <p className="mb-2">
                    No {launcherDefinition?.text.inline} is running from this
                    launcher.
                  </p>
                  {launcher && (
                    <SessionCardNotRunning
                      hasSession={totalSession > 0}
                      project={project}
                      launcher={launcher}
                    />
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {launcher && (
            <>
              <Card>
                <CardHeader
                  className={cx(
                    "align-items-center",
                    "d-flex",
                    "justify-content-between",
                  )}
                >
                  <h3 className="mb-0">
                    <Box2 className="me-1" />
                    {launcherDefinition?.text.display} Environment
                  </h3>
                  <PermissionsGuard
                    disabled={null}
                    enabled={
                      <>
                        <Button
                          color="outline-primary"
                          data-cy="session-view-modify-session-environment-button"
                          id="modify-session-environment-button"
                          onClick={toggle}
                          size="sm"
                          tabIndex={0}
                        >
                          <Pencil />
                        </Button>
                        <UncontrolledTooltip target="modify-session-environment-button">
                          Modify {launcherDefinition?.text.inline} environment
                        </UncontrolledTooltip>
                      </>
                    }
                    requestedPermission="write"
                    userPermissions={permissions}
                  />
                </CardHeader>
                <CardBody>
                  <ListGroup flush>
                    <EnvironmentItem launcher={launcher} />
                  </ListGroup>
                </CardBody>
              </Card>
              <UpdateSessionLauncherEnvironmentModal
                isOpen={isUpdateOpen}
                launcher={launcher}
                toggle={toggle}
              />
            </>
          )}

          <Card>
            <CardHeader
              className={cx(
                "align-items-center",
                "d-flex",
                "justify-content-between",
              )}
            >
              <h3
                className="mb-0"
                data-cy="session-view-resource-class-heading"
              >
                <Cpu className="me-1" />
                Default Resource Class
              </h3>
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
                        data-cy="session-view-resource-class-edit-button"
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
            </CardHeader>
            <CardBody>
              {resourceDetails}
              {launcherResourceClass && !userLauncherResourceClass && (
                <p>
                  <ExclamationTriangleFill
                    className={cx("bi", "text-warning")}
                  />{" "}
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
                    The selected disk storage exceeds the maximum value allowed
                    ({launcherResourceClass.max_storage} GB).
                  </p>
                )}
              {launcher && launcherCategory && (
                <ModifyResourcesLauncherModal
                  isOpen={isModifyResourcesOpen}
                  toggleModal={toggleModifyResources}
                  resourceClassId={userLauncherResourceClass?.id}
                  diskStorage={launcher.disk_storage}
                  sessionLauncherId={launcher.id}
                  launcherCategory={launcherCategory}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader tag="h3">
              <Link45deg className="me-1" />
              Default URL
            </CardHeader>
            <CardBody>
              <p className="mb-2">
                The default URL specifies the URL pathname on the{" "}
                {launcherDefinition?.text.inline} to go to upon launch
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
            </CardBody>
          </Card>

          <Card>
            <CardHeader className={cx("align-items-center", "d-flex")}>
              <h3 className={cx("mb-0", "me-2")}>
                <Database className={cx("me-1", "bi")} />
                Data Connectors
              </h3>
              <Badge>{dataConnectors?.length || 0}</Badge>
            </CardHeader>
            <CardBody>
              {dataConnectors && dataConnectors.length > 0 ? (
                <ListGroup flush>
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
            </CardBody>
          </Card>

          <Card>
            <CardHeader className={cx("align-items-center", "d-flex")}>
              <h3
                className={cx("align-items-center", "d-flex", "mb-0", "me-2")}
              >
                <FileCode className="me-1" />
                Code Repositories
              </h3>
              {project?.repositories?.length != null && (
                <Badge>{project?.repositories?.length}</Badge>
              )}
            </CardHeader>
            <CardBody>
              {project.repositories && project.repositories.length > 0 ? (
                <ListGroup flush>
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
            </CardBody>
          </Card>

          <SessionViewSessionSecrets />

          {launcher && (
            <Card>
              <CardHeader
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "justify-content-between",
                )}
              >
                <h3 className={cx("mb-0", "me-2")}>
                  <Braces className={cx("me-1", "bi")} />
                  Environment Variables
                </h3>
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
              </CardHeader>
              <CardBody>
                <p className="mb-2">
                  Environment variables pass information into the session.
                </p>
                <EnvVariablesCard launcher={launcher} />
                <EnvVariablesModal
                  isOpen={isEnvVariablesModalOpen}
                  launcher={launcher}
                  toggle={toggleEnvVariables}
                />
              </CardBody>
            </Card>
          )}
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
