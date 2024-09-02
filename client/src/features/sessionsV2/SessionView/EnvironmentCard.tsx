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
import { Clock, Globe2, Link45deg } from "react-bootstrap-icons";
import { Card, CardBody, Col, Row } from "reactstrap";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import { SessionLauncher } from "../sessionsV2.types";

export function CustomEnvironmentValues({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  const environment = launcher.environment;
  return (
    environment.environment_kind === "CUSTOM" && (
      <>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>Default URL:</label>
          <code>{`${environment.default_url ?? ""}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>Port:</label>
          <code>{`${environment.port ?? ""}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>Working directory:</label>
          <code>{`${environment.working_directory ?? ""}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>Mount directory:</label>
          <code>{`${environment.mount_directory ?? ""}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>UID:</label>
          <code>{`${environment.uid ?? ""}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>GUI:</label>
          <code>{`${environment.gid ?? ""}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>Command:</label>
          <code>{`${environment.command?.join(" ") ?? "-"}`}</code>
        </Col>
        <Col
          xs={12}
          className={cx(
            "d-flex",
            "align-items-center",
            "justify-content-start",
            "gap-3",
            "py-2"
          )}
        >
          <label>Args:</label>
          <code>{`${environment.args?.join(" ") ?? "-"}`}</code>
        </Col>
      </>
    )
  );
}
export function EnvironmentCard({ launcher }: { launcher: SessionLauncher }) {
  const environment = launcher.environment;
  return (
    <>
      <Card className={cx("border")}>
        <CardBody className={cx("d-flex", "flex-column")}>
          <Row>
            <Col
              xs={12}
              className={cx(
                "d-flex",
                "align-items-center",
                "justify-content-between",
                "py-2"
              )}
            >
              <div className={cx("d-flex", "gap-3")}>
                <h5 className={cx("fw-bold", "mb-0")}>
                  <small>
                    {environment.environment_kind === "GLOBAL"
                      ? environment?.name || ""
                      : launcher.name}
                  </small>
                </h5>
              </div>
            </Col>
            <Col
              xs={12}
              className={cx(
                "d-flex",
                "align-items-center",
                "justify-content-start",
                "py-2"
              )}
            >
              {environment.environment_kind === "CUSTOM" ? (
                <div className="d-flex align-items-center gap-2">
                  <Link45deg size={24} />
                  Custom image
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Globe2 size={24} />
                  Global environment
                </div>
              )}
            </Col>
            {environment.environment_kind === "GLOBAL" ? (
              <>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "align-items-center",
                    "justify-content-start",
                    "py-2"
                  )}
                >
                  {environment?.description ? (
                    <p>{environment.description}</p>
                  ) : (
                    <p className="fst-italic mb-0">No description</p>
                  )}
                </Col>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "align-items-center",
                    "justify-content-start",
                    "gap-2",
                    "py-0"
                  )}
                >
                  <label>Container image:</label>
                  <CommandCopy command={environment?.container_image || ""} />
                </Col>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "flex-wrap",
                    "align-items-center",
                    "gap-2",
                    "py-2"
                  )}
                >
                  <Clock size="16" className="flex-shrink-0" />
                  Created by <strong>Renku</strong> on{" "}
                  {toHumanDateTime({
                    datetime: launcher.creation_date,
                    format: "date",
                  })}
                </Col>
              </>
            ) : (
              <>
                <Col
                  xs={12}
                  className={cx(
                    "d-flex",
                    "align-items-center",
                    "justify-content-start",
                    "gap-3",
                    "py-2"
                  )}
                >
                  <label>Container image:</label>
                  <CommandCopy noMargin command={environment.container_image} />
                </Col>
                {environment.environment_kind === "CUSTOM" && (
                  <CustomEnvironmentValues launcher={launcher} />
                )}
              </>
            )}
          </Row>
        </CardBody>
      </Card>
    </>
  );
}
