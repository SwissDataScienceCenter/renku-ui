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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Col, ListGroup, Row } from "reactstrap";

import { Loader } from "../../components/Loader";
import EnvironmentLogsV2 from "../../components/LogsV2";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useGetProjectsByProjectIdQuery } from "../projectsV2/api/projectV2.enhanced-api";
import { useGetSessionLaunchersByLauncherIdQuery as useGetProjectSessionLauncherQuery } from "../sessionsV2/api/sessionLaunchersV2.api";
import ActiveSessionButton from "../sessionsV2/components/SessionButton/ActiveSessionButton";
import {
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "../sessionsV2/components/SessionStatus/SessionStatus";
import { SessionList, SessionV2 } from "../sessionsV2/sessionsV2.types";

import styles from "./DashboardV2Sessions.module.scss";

// Required for logs formatting
import "../../notebooks/Notebooks.css";

interface DashboardV2SessionsProps {
  sessions?: SessionList;
  error: FetchBaseQueryError | SerializedError | undefined;
  isLoading: boolean;
}
export default function DashboardV2Sessions({
  sessions,
  error,
  isLoading,
}: DashboardV2SessionsProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!sessions || sessions.length === 0) {
    return <NoSessionsState />;
  }

  return <SessionDashboardList sessions={sessions} />;
}

function LoadingState() {
  return (
    <div className={cx("d-flex", "flex-column", "mx-auto")}>
      <Loader />
      <p className={cx("mx-auto", "my-3")}>Retrieving sessions...</p>
    </div>
  );
}

function ErrorState({
  error,
}: {
  error: FetchBaseQueryError | SerializedError | undefined;
}) {
  return (
    <div>
      <p className="mb-0">Cannot show sessions.</p>
      <RtkErrorAlert error={error} />
    </div>
  );
}

function NoSessionsState() {
  return (
    <p className="mb-0">
      No running sessions. Create or explore projects to launch a session.
    </p>
  );
}

function SessionDashboardList({
  sessions,
}: {
  sessions: SessionList | undefined;
}) {
  return (
    <ListGroup flush data-cy="dashboard-session-list">
      {sessions?.map((session) => (
        <DashboardSession key={session.name} session={session} />
      ))}
    </ListGroup>
  );
}

interface DashboardSessionProps {
  session: SessionV2;
}
function DashboardSession({ session }: DashboardSessionProps) {
  const displayModal = useAppSelector(
    ({ display }) => display.modals.sessionLogs
  );
  const { project_id: projectId, launcher_id: launcherId } = session;
  const { data: project } = useGetProjectsByProjectIdQuery(
    projectId ? { projectId } : skipToken
  );
  const { data: launcher } = useGetProjectSessionLauncherQuery(
    launcherId ? { launcherId } : skipToken
  );

  const projectUrl = project
    ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.namespace,
        slug: project.slug,
      })
    : projectId
    ? generatePath(ABSOLUTE_ROUTES.v2.projects.showById, {
        id: projectId,
      })
    : ABSOLUTE_ROUTES.v2.root;
  const sessionHash = project && launcherId ? `launcher-${launcherId}` : "";
  const showSessionUrl = project
    ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
        namespace: project.namespace,
        slug: project.slug,
        session: session.name,
      })
    : ABSOLUTE_ROUTES.v2.root;

  return (
    <div
      className={cx("list-group-item-action", "list-group-item")}
      data-cy="dashboard-session-list-item"
    >
      <Link
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "link-primary",
          "text-body",
          "text-decoration-none"
        )}
        to={{ pathname: projectUrl, hash: sessionHash }}
      >
        <Row className="g-2">
          <Col className="order-1" xs={12} md={9} lg={10}>
            <Row className="g-2">
              <Col
                xs={12}
                xl="auto"
                className={cx(
                  "cursor-pointer",
                  "d-inline-block",
                  "link-primary",
                  "text-body"
                )}
                data-cy="list-session-link"
              >
                <h6>
                  {project && launcher ? (
                    <>
                      <span className="fw-bold">{project.name}</span> /{" "}
                      {launcher?.environment?.name}
                    </>
                  ) : (
                    projectId ?? "Unknown"
                  )}
                </h6>
              </Col>
              <Col xs={12} xl="auto" className="mt-1">
                <SessionStatusV2Label session={session} />
              </Col>
            </Row>
          </Col>
          <Col className={cx("order-3", "order-md-2")} xs={12} md={3} lg={2}>
            {/* NOTE: This is a placeholder for the session actions button */}
            <div className={cx("text-start", "text-md-end", "px-2", "py-1")}>
              <span className="bi" />
            </div>
          </Col>
          <Col className={cx("order-2", "order-md-3", "mt-2")} xs={12}>
            <SessionStatusV2Description session={session} />
          </Col>
        </Row>
      </Link>
      {/* NOTE: The session actions button is visually placed within the link card, but its DOM tree is kept separate. */}
      <div className={cx(styles.sessionButton, "position-absolute")}>
        <ActiveSessionButton
          session={session}
          showSessionUrl={showSessionUrl}
        />
      </div>
      <EnvironmentLogsV2 name={displayModal.targetServer} />
    </div>
  );
}
