/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { Col, Row } from "reactstrap";

import { TimeCaption } from "~/components/TimeCaption";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { AppResponse } from "../api/apps.api";
import type { Build, SessionLauncher } from "../api/sessionLaunchersV2.api";
import AppLauncherActions from "../components/launcherActions/app/AppLauncherActions";
import { getAppStatusDisplay, getAppStatusStyles } from "./apps.utils";

import styles from "./AppCard.module.scss";

interface AppCardProps {
  app: AppResponse;
  launcher: SessionLauncher;
  project: Project;
  builds?: Build[];
  lastBuild?: Build;
}

/**
 * A running app deployment, rendered as a status-tinted row beneath the
 * launcher header. The launcher header already names the app, so this row
 * carries only the status badge, the "Published …" caption, and the runtime
 * controls (open / copy / stop …) right-aligned in the row.
 */
export default function AppCard({
  app,
  launcher,
  project,
  builds,
  lastBuild,
}: AppCardProps) {
  const style = getAppStatusStyles(app.status);
  const { label, badgeClassName, description, timeCaptionPrefix, isLive } =
    getAppStatusDisplay(app.status);
  const launcherDescription = launcher.description?.trim();

  return (
    <div
      data-cy="app-item"
      className={cx(
        `bg-${style.bgColor}`,
        `bg-opacity-${style.bgOpacity}`,
        "p-0",
        "pb-3",
      )}
    >
      <div className={cx("px-3", "pt-3")}>
        <Row className={cx("gx-2", "gy-2", "gy-xl-0", "align-items-center")}>
          <Col xs={12} xl="auto">
            <Row
              className={cx("gx-2", "gy-2", "gy-xl-0", "align-items-center")}
            >
              <Col
                className={cx("align-items-center", "mt-0", "gap-2")}
                xs="12"
                xl="auto"
              >
                <div
                  className={cx(
                    "d-flex",
                    "flex-row",
                    "gap-2",
                    "align-items-center",
                  )}
                >
                  <span
                    data-cy="app-status-label"
                    className={cx(
                      "badge",
                      "rounded-pill",
                      "border",
                      "fs-small",
                      "fw-normal",
                      "d-inline-flex",
                      "align-items-center",
                      badgeClassName,
                    )}
                  >
                    <CircleFill
                      className={cx("bi", "me-1", isLive && styles.pulseDot)}
                      fontSize={14}
                    />
                    {label}
                  </span>
                </div>
              </Col>
              <Col
                xs="auto"
                className={cx(
                  "mt-0",
                  "ms-0",
                  "ms-xl-3",
                  "d-flex",
                  "flex-column",
                  "justify-content-center",
                )}
              >
                <div
                  className={cx(
                    "time-caption",
                    "d-flex",
                    "flex-row",
                    "flex-wrap",
                    "gap-2",
                    "align-items-center",
                  )}
                >
                  {description && (
                    <span
                      data-cy="app-status-description"
                      className={cx("text-muted", "small")}
                    >
                      {description}
                    </span>
                  )}
                  {app.started && timeCaptionPrefix && (
                    <TimeCaption
                      className={cx("text-muted", "small")}
                      datetime={app.started}
                      prefix={timeCaptionPrefix}
                      enableTooltip
                    />
                  )}
                </div>
                {launcherDescription && (
                  <div
                    data-cy="app-launcher-description"
                    className={cx("small", "text-muted")}
                  >
                    {launcherDescription}
                  </div>
                )}
              </Col>
            </Row>
          </Col>
          <Col
            xs={12}
            xl="auto"
            className={cx(
              "d-flex",
              "ms-md-auto",
              "justify-content-end",
              "align-items-center",
            )}
          >
            <div>
              <AppLauncherActions
                builds={builds}
                lastBuild={lastBuild}
                launcher={launcher}
                project={project}
                otherActions={false}
                displayBuildActions={false}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
