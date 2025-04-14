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
import { ReactNode, useContext } from "react";
import { CircleFill, Pencil, Trash } from "react-bootstrap-icons";
import { CardBody, CardHeader, Col, DropdownItem, Row } from "reactstrap";

import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import {
  sessionLaunchersV2Api,
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
} from "../api/sessionLaunchersV2.api";
import {
  EnvironmentIcon,
  LauncherEnvironmentIcon,
} from "../components/SessionForm/LauncherEnvironmentIcon";
import { getShowSessionUrlByProject } from "../SessionsV2";
import StartSessionButton from "../StartSessionButton";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { ActiveSessionButtonAlt } from "../components/SessionButton/ActiveSessionButton";
import {
  getSessionStatusStyles,
  SessionBadge,
  SessionStatusV2Description,
  SessionStatusV2LabelAlt,
} from "../components/SessionStatus/SessionStatus";
import { SessionV2 } from "../sessionsV2.types";
import { Loader } from "../../../components/Loader";
import {
  BuildActionsCard,
  BuildStatusBadge,
  BuildStatusDescription,
} from "../SessionView/EnvironmentCard";

import styles from "./SessionItemDisplay.module.scss";

interface SessionItemProps {
  launcher?: SessionLauncher;
  name?: string;
  project: Project;
  sessions?: SessionV2[];
  children?: ReactNode;
  toggleUpdate?: () => void;
  toggleDelete?: () => void;
  toggleUpdateEnvironment?: () => void;
}
export default function SessionLauncherItem({
  launcher,
  name,
  project,
  children,
  sessions,
  toggleDelete,
  toggleUpdate,
  toggleUpdateEnvironment,
}: SessionItemProps) {
  const environment = launcher?.environment;
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const isBuildEnvironment =
    environment && environment.environment_image_source === "build";

  const { data: builds, isLoading } = useGetBuildsQuery(
    imageBuildersEnabled && isBuildEnvironment
      ? { environmentId: environment.id }
      : skipToken
  );

  const lastBuild = builds?.at(0);
  const lastSuccessfulBuild = builds?.find(
    (build) => build.status === "succeeded" && build.id !== lastBuild?.id
  );
  const hasSession = !!sessions?.length;

  sessionLaunchersV2Api.endpoints.getEnvironmentsByEnvironmentIdBuilds.useQuerySubscription(
    isBuildEnvironment && lastBuild?.status === "in_progress"
      ? { environmentId: environment.id }
      : skipToken,
    {
      pollingInterval: 1_000,
    }
  );

  const buildActions = imageBuildersEnabled && isBuildEnvironment && (
    <BuildActionsCard launcher={launcher} />
  );

  const otherActionsLauncher = launcher &&
    toggleUpdate &&
    toggleDelete &&
    toggleUpdateEnvironment && (
      <SessionLauncherDropdownActions
        launcher={launcher}
        toggleDelete={toggleDelete}
        toggleUpdate={toggleUpdate}
        toggleUpdateEnvironment={toggleUpdateEnvironment}
      />
    );

  return (
    <>
      <CardHeader className={cx(children && "border-bottom", "pb-3")}>
        <Row className="g-2">
          <Col className={cx("align-items-center")} xs={12} lg={7} xl={8}>
            <Row className="g-2 mb-0">
              <Col
                xs={12}
                xl={4}
                className={cx("d-inline-block", "link-primary", "text-body")}
              >
                <span className="small text-muted me-3">Session Launcher</span>
              </Col>
              <Col xs={12} xl="auto">
                {environment?.environment_kind === "GLOBAL" ? (
                  <span className="small text-muted me-3">
                    <EnvironmentIcon type="global" className="me-2" />
                    Global environment
                  </span>
                ) : environment?.environment_image_source === "build" ? (
                  <span className="small text-muted me-3">
                    <EnvironmentIcon
                      type="codeBased"
                      size={16}
                      className="me-2"
                    />
                    Code based environment
                  </span>
                ) : environment?.environment_kind === "CUSTOM" ? (
                  <span className="small text-muted me-3">
                    <EnvironmentIcon type="custom" size={16} className="me-2" />
                    Custom image environment
                  </span>
                ) : null}
              </Col>
            </Row>
            <Row className={cx("g-2", isBuildEnvironment && "mb-2")}>
              <Col
                xs={12}
                className={cx("d-inline-block", "link-primary", "text-body")}
              >
                <span className="fw-bold fs-5" data-cy="session-name">
                  {name ? (
                    name
                  ) : (
                    <span className="fst-italic">Orphan session</span>
                  )}
                </span>
              </Col>
            </Row>
            {isBuildEnvironment && (
              <>
                <Row className="g-2">
                  <Col xs={12} xl={4}>
                    {isBuildEnvironment && isLoading ? (
                      <SessionBadge
                        className={cx("border-warning", "bg-warning-subtle")}
                      >
                        <Loader
                          size={12}
                          className={cx("me-1", "text-warning-emphasis")}
                          inline
                        />
                        <span className="text-warning-emphasis">
                          Loading build status
                        </span>
                      </SessionBadge>
                    ) : isBuildEnvironment && lastBuild ? (
                      <BuildStatusBadge status={lastBuild?.status} />
                    ) : !hasSession ? (
                      <SessionBadge
                        className={cx("border-dark-subtle", "bg-light")}
                      >
                        <CircleFill
                          className={cx("me-1", "bi", "text-light-emphasis")}
                        />
                        <span
                          className="text-dark-emphasis"
                          data-cy="session-status"
                        >
                          Not Running
                        </span>
                      </SessionBadge>
                    ) : null}
                  </Col>
                  <Col xs={12} xl="auto" className="d-flex">
                    <BuildStatusDescription
                      status={lastBuild?.status ?? lastSuccessfulBuild?.status}
                      createdAt={
                        lastBuild?.created_at ?? lastSuccessfulBuild?.created_at
                      }
                      completedAt={
                        lastBuild?.status === "succeeded"
                          ? lastBuild?.result?.completed_at
                          : lastSuccessfulBuild?.status === "succeeded"
                          ? lastSuccessfulBuild?.result?.completed_at
                          : undefined
                      }
                    />
                  </Col>
                </Row>
              </>
            )}
          </Col>
          <Col className={cx("ms-md-auto")} xs={12} md="auto">
            {isBuildEnvironment &&
            lastBuild?.status !== "succeeded" &&
            !lastSuccessfulBuild ? (
              <div className={cx("d-flex", "flex-column", "align-items-end")}>
                {buildActions}
              </div>
            ) : launcher != null ? (
              <div
                className={cx(
                  "d-flex",
                  "flex-column",
                  "align-items-end",
                  "gap-2"
                )}
              >
                <StartSessionButton
                  launcher={launcher}
                  namespace={project.namespace}
                  slug={project.slug}
                  disabled={hasSession}
                  useOldImage={
                    isBuildEnvironment &&
                    lastBuild?.status !== "succeeded" &&
                    !!lastSuccessfulBuild
                  }
                  otherActions={otherActionsLauncher}
                  isDisabledDropdownToggle={!otherActionsLauncher}
                />
                {isBuildEnvironment &&
                  lastBuild?.status !== "succeeded" &&
                  lastSuccessfulBuild && (
                    <BuildStatusDescription
                      isOldImage={true}
                      status={lastSuccessfulBuild?.status}
                      createdAt={lastSuccessfulBuild?.created_at}
                      completedAt={
                        lastSuccessfulBuild?.status === "succeeded"
                          ? lastSuccessfulBuild?.result?.completed_at
                          : undefined
                      }
                    />
                  )}
              </div>
            ) : null}
          </Col>
        </Row>
      </CardHeader>
      {hasSession && (
        <CardBody className="p-0">
          {sessions &&
            sessions?.length > 0 &&
            sessions.map((session) => (
              <SessionInnerCard
                key={`session-item-${session.name}`}
                project={project}
                session={session}
              />
            ))}
        </CardBody>
      )}
    </>
  );
}

interface SessionInnerCardProps {
  project: Project;
  session?: SessionV2;
}
export function SessionInnerCard({ project, session }: SessionInnerCardProps) {
  if (!session) return null;

  const stylesPerSession = getSessionStatusStyles(session);

  const bgClass =
    stylesPerSession.bgColor === "warning"
      ? styles.SessionWarningBg
      : stylesPerSession.bgColor === "success"
      ? styles.SessionSuccessBg
      : stylesPerSession.bgColor === "danger"
      ? styles.SessionDangerBg
      : styles.SessionLightBg;

  return (
    <div data-cy="session-item" className={cx(bgClass, "p-0", "pb-3")}>
      <img
        src={stylesPerSession.sessionLine}
        className={cx("position-absolute", styles.SessionLine)}
        alt="Session line indicator"
      />
      <div className={cx("ms-5", "px-3", "pt-3")}>
        <Row className="g-2">
          <Col xs={12} xl="auto">
            <Row className="g-2">
              <Col
                xs={12}
                xl={12}
                className={cx(
                  "d-inline-block",
                  "link-primary",
                  "text-body",
                  "mt-1"
                )}
              >
                <span className="small text-muted me-3">Session</span>
              </Col>
              <Col
                className={cx("align-items-center", "mt-0", "gap-2")}
                xs="auto"
                xl="auto"
              >
                <SessionStatusV2LabelAlt session={session} />
              </Col>
              <Col xs="auto" className="mt-0 ms-3 d-flex">
                <SessionStatusV2Description
                  session={session}
                  showInfoDetails={false}
                />
              </Col>
            </Row>
          </Col>
          <Col xs={12} xl="auto" className={cx("d-flex", "ms-md-auto")}>
            <div className="my-sm-auto">
              <ActiveSessionButtonAlt
                session={session}
                showSessionUrl={getShowSessionUrlByProject(
                  project,
                  session.name
                )}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

interface SessionLauncherDropdownActionsProps {
  launcher: SessionLauncher;
  toggleUpdate: () => void;
  toggleDelete: () => void;
  toggleUpdateEnvironment: () => void;
}
export function SessionLauncherDropdownActions({
  launcher,
  toggleDelete,
  toggleUpdate,
  toggleUpdateEnvironment,
}: SessionLauncherDropdownActionsProps) {
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });

  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <>
            <DropdownItem
              data-cy="session-launcher-menu-edit-env"
              onClick={toggleUpdateEnvironment}
            >
              <LauncherEnvironmentIcon launcher={launcher} />
              Edit environment
            </DropdownItem>
            <DropdownItem
              data-cy="session-launcher-menu-edit"
              onClick={toggleUpdate}
            >
              <Pencil className={cx("bi", "me-1")} />
              Edit launcher
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              data-cy="session-launcher-menu-delete"
              onClick={toggleDelete}
            >
              <Trash className={cx("bi", "me-1")} />
              Delete launcher
            </DropdownItem>
          </>
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
    </>
  );
}
