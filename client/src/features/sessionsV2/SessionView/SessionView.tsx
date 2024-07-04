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
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock,
  CodeSquare,
  DashCircleFill,
  Database,
  ExclamationTriangleFill,
  Globe2,
  Link45deg,
  PencilSquare,
} from "react-bootstrap-icons";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  ListGroupItem,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { TimeCaption } from "../../../components/TimeCaption";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import { RepositoryItem } from "../../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import { Project } from "../../projectsV2/api/projectV2.api";
import { useGetStoragesV2Query } from "../../projectsV2/api/storagesV2.api";
import { SessionRowResourceRequests } from "../../session/components/SessionsList";
import { Session, Sessions } from "../../session/sessions.types";
import { SessionV2Actions, getShowSessionUrlByProject } from "../SessionsV2";
import StartSessionButton from "../StartSessionButton";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  SessionBadge,
  SessionStatusV2Description,
  SessionStatusV2Label,
  SessionStatusV2Title,
} from "../components/SessionStatus/SessionStatus";
import sessionsV2Api from "../sessionsV2.api";
import { SessionEnvironment, SessionLauncher } from "../sessionsV2.types";

import MembershipGuard from "../../ProjectPageV2/utils/MembershipGuard";
import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../../dataServices/computeResources.api";
import { useGetProjectsByProjectIdMembersQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import UpdateSessionLauncherModal from "../UpdateSessionLauncherModal";
import { ModifyResourcesLauncherModal } from "../components/SessionModals/ModifyResourcesLauncher";

interface SessionCardContentProps {
  color: string;
  contentDescription: React.ReactNode;
  contentLabel: React.ReactNode;
  contentResources?: React.ReactNode;
  contentSession: React.ReactNode;
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
          <Clock className={cx("me-2", "text-icon")} />
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
            <DashCircleFill
              className={cx("me-2", "text-icon", "text-light-emphasis")}
            />
            <span className="text-dark" data-cy="session-status">
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

function EnvironmentCard({
  launcher,
  environment,
}: {
  launcher: SessionLauncher;
  environment?: SessionEnvironment;
}) {
  return (
    <>
      <Card className="bg-light">
        <CardHeader tag="h5">
          {launcher.environment_kind === "global_environment"
            ? environment?.name || <span className="fst-italic">No name</span>
            : launcher.name}
        </CardHeader>
        <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
          <p className="m-0">
            {launcher.environment_kind === "container_image" ? (
              <>
                <Link45deg className={cx("me-2", "text-icon")} />
                Custom image
              </>
            ) : (
              <>
                <Globe2 className={cx("me-2", "text-icon")} />
                Global environment
              </>
            )}
          </p>
          {launcher.environment_kind === "global_environment" ? (
            <>
              <p className="m-0">
                {environment?.description ? (
                  environment.description
                ) : (
                  <span className="fst-italic">No description</span>
                )}
              </p>
              <div>
                <span>Container image:</span>
                <CommandCopy command={environment?.container_image || ""} />
              </div>
              <div>
                <Clock className={cx("me-2", "text-icon")} />
                Created by <strong>Renku</strong> on{" "}
                {toHumanDateTime({
                  datetime: launcher.creation_date,
                  format: "date",
                })}
              </div>
            </>
          ) : (
            <div>
              <label>Container image:</label>
              <CommandCopy command={launcher.container_image || ""} />
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
interface SessionViewProps {
  launcher?: SessionLauncher;
  sessions?: Sessions;
  toggleSessionView: boolean;
  setToggleSessionView: () => void;
  project: Project;
}
export function SessionView({
  launcher,
  sessions,
  setToggleSessionView,
  toggleSessionView,
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
  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const { data: environments, isLoading } =
    sessionsV2Api.endpoints.getSessionEnvironments.useQueryState(
      launcher && launcher.environment_kind === "global_environment"
        ? undefined
        : skipToken
    );
  const environment = useMemo(() => {
    if (!launcher || launcher.environment_kind === "container_image")
      return undefined;
    if (launcher.environment_kind === "global_environment" && environments)
      return environments?.find((env) => env.id === launcher.environment_id);
    return undefined;
  }, [environments, launcher]);

  const { data: dataSources } = useGetStoragesV2Query({
    projectId: project.id,
  });

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
          storage: `${launcherResourceClass.max_storage}G`,
          gpu: launcherResourceClass.gpu,
        }}
      />
    ) : (
      <p>This session launcher does not have a default resource class.</p>
    );

  return (
    <Offcanvas
      key={`launcher-details-${key}`}
      className="min-vw-50"
      toggle={() => setToggleSessionView()}
      isOpen={toggleSessionView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            onClick={() => setToggleSessionView()}
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
          {launcher && !isLoading && (
            <div>
              <div className={cx("d-flex", "justify-content-between", "mb-2")}>
                <h4 className="my-auto">Session Environment</h4>
                <MembershipGuard
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
                        <PencilSquare className="text-icon" />
                      </Button>
                      <UncontrolledTooltip target="modify-session-environment-button">
                        Modify session environment
                      </UncontrolledTooltip>
                    </>
                  }
                  members={members}
                  minimumRole="editor"
                />
              </div>
              <EnvironmentCard launcher={launcher} environment={environment} />
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
              <MembershipGuard
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
                      <PencilSquare className="text-icon" />
                    </Button>
                    <UncontrolledTooltip target="modify-resource-class-button">
                      Set resource class
                    </UncontrolledTooltip>
                  </>
                }
                members={members}
                minimumRole="editor"
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
              {launcher && launcher.default_url ? (
                <CommandCopy command={launcher.default_url} noMargin />
              ) : environment && environment.default_url ? (
                <CommandCopy command={environment.default_url} noMargin />
              ) : (
                <CommandCopy command="/lab" noMargin />
              )}
            </div>
          </div>

          <div>
            <h4>
              <Database className={cx("me-2", "text-icon")} />
              Data Sources ({dataSources?.length || 0})
            </h4>
            {dataSources && dataSources?.length > 0 ? (
              <ListGroup>
                {dataSources?.map((storage, index) => (
                  <ListGroupItem key={`storage-${index}`}>
                    <div>Name: {storage.storage.name}</div>
                    <div>Type: {storage.storage.storage_type}</div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            ) : (
              <p className="fst-italic">No data sources included</p>
            )}
          </div>

          <div>
            <h4>
              <CodeSquare className={cx("me-2", "text-icon")} />
              Code Repositories ({project.repositories?.length || 0})
            </h4>
            {dataSources && dataSources?.length > 0 ? (
              <ListGroup>
                {project.repositories?.map((repositoryUrl, index) => (
                  <ListGroupItem key={`storage-${index}`}>
                    <RepositoryItem
                      project={project}
                      url={repositoryUrl}
                      showMenu={false}
                    />
                  </ListGroupItem>
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
