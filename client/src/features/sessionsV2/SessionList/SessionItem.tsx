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
import { CircleFill } from "react-bootstrap-icons";
import { Col, ListGroupItem, Row } from "reactstrap";

import { Project } from "../../projectsV2/api/projectV2.api";
import { getShowSessionUrlByProject } from "../SessionsV2";
import StartSessionButton from "../StartSessionButton";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  SessionBadge,
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "../components/SessionStatus/SessionStatus";
import { SessionLauncher } from "../sessionsV2.types";
import { Session } from "../../session/sessions.types";

interface SessionItemProps {
  launcher?: SessionLauncher;
  name?: string;
  project: Project;
  session?: Session;
  toggleSessionDetails: () => void;
}
export default function SessionItem({
  launcher,
  name,
  project,
  session,
  toggleSessionDetails,
}: SessionItemProps) {
  return (
    <ListGroupItem
      action
      className="cursor-pointer"
      onClick={() => toggleSessionDetails()}
    >
      <Row className="g-2">
        <Col
          className={cx("align-items-center", "d-flex")}
          xs={12}
          md={8}
          lg={9}
          xl={10}
        >
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
            >
              <span className="fw-bold" data-cy="session-name">
                {name ? (
                  name
                ) : (
                  <span className="fst-italic">Orphan session</span>
                )}
              </span>
            </Col>
            <Col xs={12} xl="auto">
              {session ? (
                <SessionStatusV2Label session={session} />
              ) : (
                <SessionBadge className={cx("border-dark-subtle", "bg-light")}>
                  <CircleFill
                    className={cx("me-1", "text-icon", "text-light-emphasis")}
                  />
                  <span className="text-dark-emphasis" data-cy="session-status">
                    Not Running
                  </span>
                </SessionBadge>
              )}
            </Col>
            {session ? (
              <Col className={cx("align-items-center", "d-flex")} xs={12}>
                <SessionStatusV2Description
                  session={session}
                  showInfoDetails={false}
                />
              </Col>
            ) : null}
          </Row>
        </Col>
        <Col className={cx("d-flex", "ms-md-auto")} xs="auto">
          <div className="my-sm-auto">
            {session != null ? (
              <ActiveSessionButton
                session={session}
                showSessionUrl={getShowSessionUrlByProject(
                  project,
                  session.name
                )}
              />
            ) : launcher != null ? (
              <StartSessionButton
                launcherId={launcher.id}
                namespace={project.namespace}
                slug={project.slug}
              />
            ) : null}
          </div>
        </Col>
      </Row>
    </ListGroupItem>
  );
}
