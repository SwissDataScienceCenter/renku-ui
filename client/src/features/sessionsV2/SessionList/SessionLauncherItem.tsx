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
import { useCallback, useMemo } from "react";
import { CircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Badge, Col, ListGroupItem, Row } from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import { useGetSessionsQuery as useGetSessionsQueryV2 } from "../api/sessionsV2.api";
import type { SessionLauncher } from "../sessionsV2.types";
import SessionLauncherView from "../SessionView/SessionLauncherView";
import SessionItemV2 from "./SessionItemV2";

import styles from "./Actions.module.scss";
import SessionLauncherActions from "./SessionLauncherActions";

interface SessionLauncherItemProps {
  launcher: SessionLauncher;
}

export default function SessionLauncherItem({
  launcher,
}: SessionLauncherItemProps) {
  const { name } = launcher;

  const { project } = useProject();

  const { data: sessions } = useGetSessionsQueryV2();
  const filteredSessions = useMemo(
    () =>
      sessions != null
        ? sessions.filter(
            (session) =>
              session.launcher_id === launcher.id &&
              session.project_id === project.id
          )
        : [],
    [launcher.id, project.id, sessions]
  );

  const [hash, setHash] = useLocationHash();
  const launcherHash = useMemo(
    () => `launcher-v2-${launcher.id}`,
    [launcher.id]
  );
  const isLauncherViewOpen = useMemo(
    () => hash === launcherHash,
    [hash, launcherHash]
  );
  const toggleLauncherView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === launcherHash;
      return isOpen ? "" : launcherHash;
    });
  }, [launcherHash, setHash]);

  return (
    <>
      <ListGroupItem action className="py-0" data-cy="session-launcher-item">
        <Link
          className={cx(
            "d-flex",
            "flex-column",
            "gap-3",
            "link-primary",
            "text-body",
            "text-decoration-none",
            "py-3"
          )}
          to={{ hash: launcherHash }}
        >
          <Row className="g-2">
            <Col
              className={cx("order-1", "align-items-center", "d-flex")}
              xs={12}
              md={8}
              lg={9}
            >
              <Row className="g-2">
                <Col
                  xs={12}
                  xl="auto"
                  className={cx("d-inline-block", "link-primary", "text-body")}
                >
                  <span className="fw-bold" data-cy="session-name">
                    {name}
                  </span>
                </Col>
                <Col xs={12} xl="auto">
                  <Badge
                    className={cx(
                      "border",
                      "bg-success-subtle",
                      "border-success",
                      "text-success-emphasis",
                      "fs-small",
                      "fw-normal"
                    )}
                    pill
                  >
                    <CircleFill className={cx("bi", "me-1")} />
                    Ready
                  </Badge>
                </Col>
              </Row>
            </Col>
            <Col className={cx("order-3", "order-md-2")} xs={12} md={3} lg={2}>
              {/* NOTE: This is a placeholder for the session actions button */}
              <div className={cx("text-start", "text-md-end", "px-2", "py-1")}>
                <span className="bi" />
              </div>
            </Col>
          </Row>
        </Link>
        {/* NOTE: The session actions button is visually placed within the link card, but its DOM tree is kept separate. */}
        <div className={cx(styles.actionsButton, "position-absolute")}>
          <SessionLauncherActions
            launcher={launcher}
            sessions={filteredSessions}
          />
        </div>
      </ListGroupItem>
      {filteredSessions.map((session) => (
        <SessionItemV2
          key={session.name}
          launcher={launcher}
          session={session}
        />
      ))}
      <SessionLauncherView
        isOpen={isLauncherViewOpen}
        toggle={toggleLauncherView}
        launcher={launcher}
      />
    </>
  );
}
