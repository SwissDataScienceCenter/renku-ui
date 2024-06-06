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
import cx from "classnames";
import { ReactNode, useMemo, useState } from "react";
import {
  Clock,
  DashCircleFill,
  LayoutSidebarInsetReverse,
} from "react-bootstrap-icons";
import { Col, Row } from "reactstrap";

import { TimeCaption } from "../../../components/TimeCaption";
import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import { Project } from "../../projectsV2/api/projectV2.api";
import sessionsApi from "../../session/sessions.api";
import { filterSessionsWithCleanedAnnotations } from "../../session/sessions.utils";
import { SessionView } from "../SessionView/SessionView";
import { getShowSessionUrlByProject } from "../SessionsV2";
import StartSessionButton from "../StartSessionButton";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  SessionBadge,
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "../components/SessionStatus/SessionStatus";
import { SessionLauncher } from "../sessionsV2.types";

import sessionItemStyles from "./SessionItemDisplay.module.scss";

export function SessionNameBox({
  children,
  handler,
}: {
  children: ReactNode;
  handler: () => void;
}) {
  return (
    <Col
      xl={3}
      sm={6}
      xs={12}
      className={cx(
        "d-flex",
        "align-items-center",
        "gap-2",
        "fw-bold",
        "cursor-pointer",
        "ps-sm-3",
        "ps-xl-4",
        sessionItemStyles.ItemDisplaySessionName
      )}
      onClick={() => handler()}
    >
      {children}
    </Col>
  );
}
export function SessionStatusBadgeBox({ children }: { children: ReactNode }) {
  return (
    <Col
      xl={3}
      xs={12}
      className={cx(
        "d-flex",
        "align-items-center",
        "order-2",
        "order-sm-3",
        "order-xl-2",
        "pe-0",
        "ps-5",
        "ps-xl-2",
        "pt-2",
        "pt-xl-0"
      )}
    >
      {children}
    </Col>
  );
}
export function SessionStatusLabelBox({ children }: { children: ReactNode }) {
  return (
    <Col
      xl={3}
      xs={12}
      className={cx(
        "d-flex",
        "align-items-center",
        "order-3",
        "order-xl-3",
        "order-sm-4",
        "col-xl",
        "pe-0",
        "ps-5",
        "ps-xl-2",
        "pt-2",
        "pt-xl-0"
      )}
    >
      {children}
    </Col>
  );
}
export function SessionBtnBox({ children }: { children: ReactNode }) {
  return (
    <Col
      xl={3}
      sm={6}
      xs={12}
      className={cx(
        "col",
        "d-flex",
        "align-items-center",
        "order-4",
        "order-sm-2",
        "order-xl-4",
        "justify-content-start",
        "justify-content-sm-end",
        "pe-0",
        "pe-sm-2",
        "pe-xl-3",
        "ps-5",
        "ps-sm-2",
        "pt-2",
        "pt-sm-0"
      )}
    >
      {children}
    </Col>
  );
}

interface SessionLauncherDisplayProps {
  launcher: SessionLauncher;
  project: Project;
}
export function SessionItemDisplay({
  launcher,
  project,
}: SessionLauncherDisplayProps) {
  const { name, creation_date } = launcher;
  const [toggleSessionView, setToggleSessionView] = useState(false);
  const { data: sessions } = sessionsApi.endpoints.getSessions.useQueryState();
  const filteredSessions = useMemo(
    () =>
      sessions != null
        ? filterSessionsWithCleanedAnnotations<NotebookAnnotations>(
            sessions,
            ({ annotations }) =>
              annotations["renkuVersion"] === "2.0" &&
              annotations["projectId"] === project.id &&
              annotations["launcherId"] === launcher.id
          )
        : {},
    [launcher.id, project.id, sessions]
  );
  const filteredSessionsLength = useMemo(
    () => Object.keys(filteredSessions).length,
    [filteredSessions]
  );

  const toggleSessionDetails = () => {
    setToggleSessionView((open: boolean) => !open);
  };

  return (
    <>
      {filteredSessionsLength > 0 ? (
        Object.entries(filteredSessions).map(([key, session]) => (
          <Row
            key={`session-item-${key}`}
            className={cx(
              "px-0",
              "py-4",
              "py-xl-3",
              "m-0",
              sessionItemStyles.ItemDisplaySessionRow
            )}
            data-cy="session-launcher-item"
          >
            <SessionNameBox handler={() => toggleSessionDetails()}>
              <LayoutSidebarInsetReverse
                className={cx("flex-shrink-0", "me-0")}
                size="20"
              />
              <span className={cx("text-truncate")} data-cy="session-name">
                {name}
              </span>
            </SessionNameBox>
            <SessionStatusBadgeBox>
              <SessionStatusV2Label key={key} session={session} />
            </SessionStatusBadgeBox>
            <SessionStatusLabelBox>
              <SessionStatusV2Description key={key} session={session} />
            </SessionStatusLabelBox>
            <SessionBtnBox>
              <ActiveSessionButton
                session={session}
                showSessionUrl={getShowSessionUrlByProject(
                  project,
                  session.name
                )}
              />
            </SessionBtnBox>
          </Row>
        ))
      ) : (
        <Row
          className={cx(
            "px-0",
            "py-4",
            "py-xl-3",
            "m-0",
            sessionItemStyles.ItemDisplaySessionRow
          )}
          data-cy="session-launcher-item"
        >
          <SessionNameBox handler={() => toggleSessionDetails()}>
            <LayoutSidebarInsetReverse
              className={cx("flex-shrink-0", "me-0")}
              size="20"
            />
            <span className={cx("text-truncate")} data-cy="session-name">
              {name}
            </span>
          </SessionNameBox>
          <SessionStatusBadgeBox>
            <SessionBadge className={cx("border-dark-subtle", "bg-light")}>
              <DashCircleFill
                className={cx("bi", "me-1", "text-light-emphasis")}
                size={16}
              />
              <span className="text-dark" data-cy="session-status">
                Not Running
              </span>
            </SessionBadge>
          </SessionStatusBadgeBox>
          <SessionStatusLabelBox>
            <div className={cx("d-flex", "align-items-center", "gap-2")}>
              <Clock size="16" className="flex-shrink-0" />
              <TimeCaption
                datetime={creation_date}
                enableTooltip
                prefix="Created"
              />
            </div>
          </SessionStatusLabelBox>
          <SessionBtnBox>
            <StartSessionButton
              launcherId={launcher.id}
              namespace={project.namespace}
              slug={project.slug}
            />
          </SessionBtnBox>
        </Row>
      )}
      <SessionView
        launcher={launcher}
        project={project}
        sessions={filteredSessions}
        setToggleSessionView={toggleSessionDetails}
        toggleSessionView={toggleSessionView}
      />
    </>
  );
}
