/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { Col, Row } from "reactstrap";
import { Project } from "../../projectsV2/api/projectV2.api";
import { ActiveSessionButton } from "../components/SessionButton/ActiveSessionButton";
import {
  getSessionStatusStyles,
  SessionStatusV2Description,
  SessionStatusV2LabelAlt,
} from "../components/SessionStatus/SessionStatus";
import { getShowSessionUrlByProject } from "../SessionsV2";
import { SessionV2 } from "../sessionsV2.types";
import styles from "./Session.module.scss";

interface SessionCardProps {
  project: Project;
  session?: SessionV2;
}
export default function SessionCard({ project, session }: SessionCardProps) {
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
                <span className={cx("small", "text-muted", "me-3")}>
                  Session
                </span>
              </Col>
              <Col
                className={cx("align-items-center", "mt-0", "gap-2")}
                xs="auto"
                xl="auto"
              >
                <SessionStatusV2LabelAlt session={session} />
              </Col>
              <Col xs="auto" className={cx("mt-0", "ms-3", "d-flex")}>
                <SessionStatusV2Description
                  session={session}
                  showInfoDetails={false}
                />
              </Col>
            </Row>
          </Col>
          <Col
            xs={12}
            xl="auto"
            className={cx("d-flex", "ms-md-auto", "justify-content-end")}
          >
            <div>
              <ActiveSessionButton
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
