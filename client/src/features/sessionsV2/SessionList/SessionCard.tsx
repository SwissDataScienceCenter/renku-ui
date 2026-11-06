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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useRef } from "react";
import {
  Col,
  PopoverBody,
  PopoverHeader,
  Row,
  UncontrolledPopover,
} from "reactstrap";

import useClickableHostHandlers from "~/components/buttons/useClickableHostHandlers.hook";
import {
  getLauncherCategoryDefinition,
  sessionLauncherKindToCategory,
} from "~/features/sessionsV2/session.utils";
import { Project } from "../../projectsV2/api/projectV2.api";
import { useGetResourcePoolsByResourcePoolIdQuery } from "../api/computeResources.api";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  getSessionStatusStyles,
  SessionStatusV2Description,
  SessionStatusV2Label,
} from "../components/SessionStatus/SessionStatus";
import { getShowSessionUrlByProject } from "../SessionsV2";
import { SessionV2 } from "../sessionsV2.types";
import useResourcePoolByClassId from "../useResourcePoolByClassId.hook";

import styles from "./Session.module.scss";

interface SessionCardProps {
  project: Project;
  onOpen?: () => void;
  session?: SessionV2;
}
export default function SessionCard({
  project,
  session,
  onOpen,
}: SessionCardProps) {
  const hostHandlers = useClickableHostHandlers(onOpen);

  if (!session) return null;

  const launcherCategory = sessionLauncherKindToCategory(session.session_type);
  const stylesPerSession = getSessionStatusStyles(session, launcherCategory);
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);

  return (
    <div
      data-cy="session-item"
      className={cx(
        `bg-${stylesPerSession.bgColor}`,
        `bg-opacity-${stylesPerSession.bgOpacity}`,
        "p-0",
        "pb-3",
        "cursor-pointer",
      )}
      onClick={hostHandlers.onClick}
      role={onOpen ? "button" : undefined}
      aria-label={onOpen ? "View session details for this launcher" : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      {launcherCategory === "session" && (
        <img
          src={stylesPerSession.sessionLine}
          className={cx("position-absolute", styles.SessionLine)}
          alt="Session line indicator"
          loading="lazy"
        />
      )}
      <div
        className={cx(
          launcherCategory === "session" ? "ms-5" : "ms-2",
          "px-3",
          "pt-3",
        )}
      >
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
                  "mt-1",
                )}
              >
                <span className={cx("small", "text-muted", "me-3")}>
                  {launcherDefinition.text.display}
                  <RemotePoolLabel
                    resourceClassId={session.resource_class_id}
                    launcherInlineText={launcherDefinition.text.inline}
                  />
                  {session.submission_id ? `: ${session.submission_id}` : ""}
                </span>
              </Col>
              <Col
                className={cx("align-items-center", "mt-0", "gap-2")}
                xs="12"
                xl="auto"
              >
                <SessionStatusV2Label session={session} variant="card" />
              </Col>
              <Col
                xs="auto"
                className={cx("mt-0", "ms-0", "ms-xl-3", "d-flex")}
              >
                <SessionStatusV2Description
                  session={session}
                  showInfoDetails={true}
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
                  session.name,
                )}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

interface RemotePoolLabelProps {
  resourceClassId: number;
  launcherInlineText: string;
}
function RemotePoolLabel({
  resourceClassId,
  launcherInlineText,
}: RemotePoolLabelProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { resourcePool } = useResourcePoolByClassId(resourceClassId);

  // TEMPORARY: `GET /resource_pools` never fills in `cluster_id`, so we fetch the single pool instead.
  // Remove this query and the `cluster` check below, once/if the backend is updated.
  const { data: resourcePoolDetails } =
    useGetResourcePoolsByResourcePoolIdQuery(
      resourcePool != null &&
        resourcePool.cluster_id == null &&
        resourcePool.remote == null
        ? { resourcePoolId: resourcePool.id }
        : skipToken,
    );

  if (
    resourcePool == null ||
    (resourcePool.cluster_id == null &&
      resourcePool.remote == null &&
      resourcePoolDetails?.cluster == null) // TEMPORARY, see above
  ) {
    return null;
  }

  return (
    <>
      {" "}
      <span className="fw-bold" data-cy="session-remote-pool" ref={ref}>
        on remote pool
      </span>
      <UncontrolledPopover placement="bottom" target={ref} trigger="hover">
        <PopoverHeader>Remote resource pool</PopoverHeader>
        <PopoverBody>
          This {launcherInlineText} runs on the remote resource pool{" "}
          <span className="fw-bold">{resourcePool.name}</span>.
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}
