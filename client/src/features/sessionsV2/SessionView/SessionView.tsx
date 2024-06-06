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
  Globe2,
  Link45deg,
  PencilSquare,
} from "react-bootstrap-icons";
import {
  Button,
  Card,
  CardBody,
  Col,
  Offcanvas,
  OffcanvasBody,
  Row,
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
import UpdateSessionLauncherModal from "../UpdateSessionLauncherModal";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  SessionBadge,
  SessionStatusV2Description,
  SessionStatusV2Label,
  SessionStatusV2Title,
} from "../components/SessionStatus/SessionStatus";
import sessionsV2Api from "../sessionsV2.api";
import { SessionEnvironment, SessionLauncher } from "../sessionsV2.types";

import buttonStyles from "../../../components/buttons/Buttons.module.scss";
import sessionViewStyles from "./SessionView.module.scss";

function SessionCard({
  session,
  project,
}: {
  session: Session;
  project: Project;
}) {
  return (
    <Card
      className={
        sessionViewStyles[
          `SessionCard-${getSessionColor(session.status.state)}`
        ]
      }
    >
      <CardBody className={cx("d-flex", "flex-column")}>
        <Row>
          <Col
            xs={12}
            sm={6}
            className={cx(
              "d-flex",
              "align-items-center",
              "justify-content-start",
              "py-2"
            )}
          >
            <SessionStatusV2Label session={session} />
          </Col>
          <Col
            xs={12}
            sm={6}
            className={cx(
              "d-flex",
              "align-items-center",
              "justify-content-start",
              "justify-content-sm-end",
              "py-2"
            )}
          >
            <ActiveSessionButton
              session={session}
              showSessionUrl={getShowSessionUrlByProject(project, session.name)}
            />
          </Col>
          <Col xs={12} className={cx("d-flex", "align-items-center", "py-2")}>
            <SessionStatusV2Description session={session} />
          </Col>
          <Col xs={12} className={cx("d-flex", "align-items-center", "py-2")}>
            <SessionRowResourceRequests
              resourceRequests={session.resources.requests}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
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
    <Card className={sessionViewStyles["SessionCard-gray"]}>
      <CardBody className={cx("d-flex", "flex-column")}>
        <Row>
          <Col
            xs={6}
            className={cx(
              "d-flex",
              "align-items-center",
              "justify-content-start",
              "py-2"
            )}
          >
            <SessionBadge className={cx("border-dark-subtle", "bg-light")}>
              <DashCircleFill
                className={cx("bi", "me-1", "text-light-emphasis")}
                size={16}
              />
              <span className="text-dark">Not Running</span>
            </SessionBadge>
          </Col>
          <Col
            xs={6}
            className={cx(
              "d-flex",
              "align-items-center",
              "justify-content-end",
              "py-2"
            )}
          >
            <StartSessionButton
              launcherId={launcher.id}
              namespace={project.namespace}
              slug={project.slug}
            />
          </Col>
          <Col
            xs={12}
            className={cx("d-flex", "align-items-center", "gap-2", "py-2")}
          >
            <Clock size="16" className="flex-shrink-0" />
            <TimeCaption
              datetime={launcher.creation_date}
              enableTooltip
              prefix="Created"
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
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
    ? "gray"
    : state === "failed"
    ? "danger"
    : "gray";
}

function EnvironmentCard({
  launcher,
  environment,
}: {
  launcher: SessionLauncher;
  environment?: SessionEnvironment;
}) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  return (
    <>
      <Card className={cx("border", sessionViewStyles.EnvironmentCard)}>
        <CardBody className={cx("d-flex", "flex-column")}>
          <Row>
            <Col
              xs={12}
              className={cx(
                "d-flex",
                "align-items-center",
                "justify-content-between",
                "py-2"
              )}
            >
              <h5 className="fw-bold mb-0">
                <small>
                  {launcher.environment_kind === "global_environment"
                    ? environment?.name || ""
                    : launcher.name}
                </small>
              </h5>
              <div>
                <Button
                  className={cx(
                    "bg-transparent",
                    "shadow-none",
                    "border-0",
                    buttonStyles.EditButton
                  )}
                  onClick={toggle}
                >
                  <PencilSquare size={22} />
                </Button>
              </div>
            </Col>
            <Col
              xs={12}
              className={cx(
                "d-flex",
                "align-items-center",
                "justify-content-start",
                "py-2"
              )}
            >
              {launcher.environment_kind === "container_image" ? (
                <div className="d-flex align-items-center gap-2">
                  <Link45deg size={24} />
                  Custom image
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Globe2 size={24} />
                  Global environment
                </div>
              )}
            </Col>
            {launcher.environment_kind === "global_environment" ? (
              <>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "align-items-center",
                    "justify-content-start",
                    "py-2"
                  )}
                >
                  {environment?.description ? (
                    <p>{environment.description}</p>
                  ) : (
                    <p className="fst-italic mb-0">No description</p>
                  )}
                </Col>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "align-items-center",
                    "justify-content-start",
                    "gap-2",
                    "py-0"
                  )}
                >
                  <label>Container image:</label>
                  <CommandCopy command={environment?.container_image || ""} />
                </Col>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "flex-wrap",
                    "align-items-center",
                    "gap-2",
                    "py-2"
                  )}
                >
                  <Clock size="16" className="flex-shrink-0" />
                  Created by <strong>Renku</strong> on{" "}
                  {toHumanDateTime({
                    datetime: launcher.creation_date,
                    format: "date",
                  })}
                </Col>
              </>
            ) : (
              <Col
                xs={12}
                className={cx(
                  "d-flex",
                  "align-items-center",
                  "justify-content-start",
                  "gap-2",
                  "py-2"
                )}
              >
                <label>Container image:</label>
                <CommandCopy command={launcher.container_image} />
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>
      <UpdateSessionLauncherModal
        isOpen={isUpdateOpen}
        launcher={launcher}
        toggle={toggle}
      />
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

  return (
    <Offcanvas
      key={`launcher-details-${key}`}
      className="bg-white"
      toggle={() => setToggleSessionView()}
      isOpen={toggleSessionView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div
          className="d-flex justify-content-start gap-2 align-items-center mb-4"
          role="button"
          onClick={() => setToggleSessionView()}
        >
          <ArrowLeft size={24} />
          Back
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <label className="fst-italic fs-small">
              {launcher ? "Session launcher" : "Session without launcher"}
            </label>
            <h2 className="fw-bold">{title}</h2>
          </div>
          {launcherMenu}
        </div>
        <p>{description}</p>
        <h5 className={cx("mt-5", "fw-bold")}>Launched Session</h5>
        {totalSession > 0 ? (
          sessions &&
          Object.entries(sessions).map(([key, session]) => (
            <div key={key} className="py-2">
              <SessionStatusV2Title session={session} launcher={launcher} />
              <SessionCard session={session} project={project} />
            </div>
          ))
        ) : (
          <div className="py-2">
            <small>
              <i>Currently you are NOT running a session from this launcher.</i>
            </small>
            {launcher && (
              <SessionCardNotRunning project={project} launcher={launcher} />
            )}
          </div>
        )}
        {launcher && !isLoading && (
          <>
            <h5 className={cx("mt-5", "fw-bold")}>Session Environment</h5>
            <EnvironmentCard launcher={launcher} environment={environment} />
          </>
        )}
        <h5 className={cx("mt-5", "fw-bold")}>Session Launcher Details</h5>
        <div className="mt-3">
          <label className="fw-bold">Default URL</label>
          <p>
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
        <div className="mt-5">
          <label className={cx("fw-bold", "mb-3")}>
            <Database size={20} className={cx("me-2")} /> Included Data Sources
            ({dataSources?.length || 0})
          </label>
          <ul className="list-unstyled">
            {dataSources?.map((storage, index) => (
              <Row
                key={`storage-${index}`}
                className={cx("text-truncate", "ms-4")}
              >
                <Col xs={6}>{storage.storage.name}</Col>
                <Col xs={6}>{storage.storage.storage_type}</Col>
              </Row>
            ))}
          </ul>
        </div>
        <div className="mt-5">
          <label className={cx("fw-bold", "mb-3")}>
            <CodeSquare size={20} className={cx("me-2")} /> Included Code
            Repositories ({project.repositories?.length || 0})
          </label>
          <ul className="list-unstyled">
            {project.repositories?.map((repositoryUrl, index) => (
              <li key={index} className="ms-4">
                <RepositoryItem
                  project={project}
                  url={repositoryUrl}
                  showMenu={false}
                />
              </li>
            ))}
          </ul>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
