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
import { Badge, Col, ListGroupItem, Row } from "reactstrap";

import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import type { SessionLauncher } from "../sessionsV2.types";
import SessionLauncherView from "../SessionView/SessionLauncherView";

interface SessionLauncherItemProps {
  launcher: SessionLauncher;
}

export default function SessionLauncherItem({
  launcher,
}: SessionLauncherItemProps) {
  const { name } = launcher;

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
      <ListGroupItem
        action
        className="cursor-pointer"
        data-cy="session-launcher-item"
        tag="button"
        onClick={toggleLauncherView}
      >
        <Row className="g-2">
          <Col
            className={cx("align-items-center", "d-flex")}
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
                    "text-success-emphasis"
                  )}
                  pill
                >
                  <CircleFill className={cx("bi", "me-1")} />
                  Ready
                </Badge>
              </Col>
            </Row>
          </Col>
        </Row>
      </ListGroupItem>
      <div className="d-none">
        <button>{"<ACTIONS>"}</button>
      </div>
      <SessionLauncherView
        isOpen={isLauncherViewOpen}
        toggle={toggleLauncherView}
        launcher={launcher}
      />
    </>
  );
}
