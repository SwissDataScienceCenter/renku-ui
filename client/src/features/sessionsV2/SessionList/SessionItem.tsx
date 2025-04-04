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
import { Boxes, CircleFill, Globe2, Link45deg } from "react-bootstrap-icons";
import { CardBody, CardHeader, Col, Row } from "reactstrap";

import AppContext from "../../../utils/context/appContext.ts";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants.ts";
import { Project } from "../../projectsV2/api/projectV2.api";
import {
  sessionLaunchersV2Api,
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
} from "../api/sessionLaunchersV2.api";
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
import { Loader } from "../../../components/Loader.tsx";
import {
  BuildActionsCard,
  BuildStatusBadge,
  BuildStatusDescription,
} from "../SessionView/EnvironmentCard.tsx";

import styles from "./SessionItemDisplay.module.scss";

interface SessionItemProps {
  launcher?: SessionLauncher;
  name?: string;
  project: Project;
  session?: SessionV2;
  toggleSessionDetails: () => void;
  children?: ReactNode;
  hasSession?: boolean;
}
export default function SessionItem({
  launcher,
  name,
  project,
  children,
  hasSession,
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

  return (
    <>
      <CardHeader className={cx(children && "border-bottom", "pb-3")}>
        <Row className="g-2">
          <Col className={cx("align-items-center")} xs={12} md={6} lg={8}>
            <Row className="g-2 mb-0">
              <Col
                xs={12}
                xl={3}
                className={cx("d-inline-block", "link-primary", "text-body")}
              >
                <span className="small text-muted me-3">Session Launcher</span>
              </Col>
              <Col xs={12} xl="auto">
                {environment?.environment_kind === "GLOBAL" ? (
                  <span className="small text-muted me-3">
                    <Globe2 size={16} className="me-2" />
                    Global environment
                  </span>
                ) : environment?.environment_image_source === "build" ? (
                  <span className="small text-muted me-3">
                    <Boxes size={16} className="me-2" />
                    Code based environment
                  </span>
                ) : (
                  <span className="small text-muted me-3">
                    <Link45deg size={16} className="me-2" />
                    Custom image environment
                  </span>
                )}
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
                    <span className="fst-italic">
                      Not found Session Launcher (Orphan session)
                    </span>
                  )}
                </span>
              </Col>
            </Row>
            {isBuildEnvironment && (
              <>
                <Row className="g-2">
                  <Col xs={12} xl={3}>
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
                    ) : isBuildEnvironment &&
                      lastBuild?.status !== "succeeded" &&
                      lastBuild?.status !== "in_progress" &&
                      lastSuccessfulBuild ? (
                      <SessionBadge
                        className={cx("border-warning", "bg-warning-subtle")}
                      >
                        <span className="text-warning-emphasis">
                          <CircleFill className={cx("me-1", "bi")} />
                          Build failed
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
                  launcherId={launcher.id}
                  namespace={project.namespace}
                  slug={project.slug}
                  disabled={hasSession}
                  useOldImage={
                    isBuildEnvironment &&
                    lastBuild?.status !== "succeeded" &&
                    !!lastSuccessfulBuild
                  }
                />
                {isBuildEnvironment &&
                  lastBuild?.status !== "succeeded" &&
                  lastSuccessfulBuild && (
                    <BuildStatusDescription
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
      {children && <CardBody className="p-0">{children}</CardBody>}
    </>
  );
}

export function SessionDisplay({
  project,
  session,
  toggleSessionDetails,
}: SessionItemProps) {
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
      <div className={cx("ms-4", "px-3", "pt-3")}>
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
                toggleSessionDetails={toggleSessionDetails}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
