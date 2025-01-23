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
import { CaretRightFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Col, ListGroupItem, Row } from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { useProject } from "../../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import { SessionStatusV2Label } from "../components/SessionStatus/SessionStatus";
import { getShowSessionUrlByProject } from "../SessionsV2";
import type { SessionLauncher, SessionV2 } from "../sessionsV2.types";
import SessionViewV2 from "../SessionView/SessionViewV2";

import styles from "./Actions.module.scss";

interface SessionItemV2Props {
  launcher: SessionLauncher;
  session: SessionV2;
}

export default function SessionItemV2({
  launcher,
  session,
}: SessionItemV2Props) {
  const { project } = useProject();

  const [hash, setHash] = useLocationHash();
  const sessionHash = useMemo(
    () => `session-v2-${session.name}`,
    [session.name]
  );
  const isSessionViewOpen = useMemo(
    () => hash === sessionHash,
    [hash, sessionHash]
  );
  const toggleSessionView = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === sessionHash;
      return isOpen ? "" : sessionHash;
    });
  }, [sessionHash, setHash]);

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
          to={{ hash: sessionHash }}
        >
          <Row className="g-2">
            <Col
              className={cx("order-1", "align-items-center", "d-flex")}
              xs={12}
              md={8}
              lg={9}
            >
              <CaretRightFill className={cx("bi", "me-1")} />
              <SessionStatusV2Label session={session} />
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
          <ActiveSessionButton
            session={session}
            showSessionUrl={getShowSessionUrlByProject(project, session.name)}
          />
        </div>
      </ListGroupItem>
      <SessionViewV2
        isOpen={isSessionViewOpen}
        toggle={toggleSessionView}
        launcher={launcher}
        session={session}
      />
    </>
  );
}
