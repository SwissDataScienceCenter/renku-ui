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

import { SessionEnvironment, SessionLauncher } from "../sessionsV2.types.ts";
import { Card, CardBody, Col, Row } from "reactstrap";
import cx from "classnames";
import { Clock, Globe2, Link45deg } from "react-bootstrap-icons";
import { CommandCopy } from "../../../components/commandCopy/CommandCopy.tsx";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils.ts";

export function CustomEnvironmentValues({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  return (
    launcher.environment_kind === "container_image" && (
      <>
        <Row>
          <Col xs={3} className={cx("py-1", "d-flex", "align-items-center")}>
            <label>Default URL:</label>
          </Col>
          <Col xs={9} className={cx("py-1")}>
            <CommandCopy command={`${launcher.default_url ?? ""}`} />
          </Col>
        </Row>
        <Row>
          <Col xs={3} className={cx("py-1", "d-flex", "align-items-center")}>
            <label>Working directory:</label>
          </Col>
          <Col xs={9} className={cx("py-1")}>
            <CommandCopy command={`${launcher.workingDirectory ?? ""}`} />
          </Col>
        </Row>
        <Row>
          <Col xs={3} className={cx("py-1", "d-flex", "align-items-center")}>
            <label>Mount directory:</label>
          </Col>
          <Col xs={9} className={cx("py-1")}>
            <CommandCopy command={`${launcher.mountDirectory ?? ""}`} />
          </Col>
        </Row>
        <Row>
          <Col xs={3} className={cx("py-1", "d-flex", "align-items-center")}>
            <label>Port:</label>
          </Col>
          <Col xs={4} className={cx("py-1")}>
            <CommandCopy command={`${launcher.port ?? ""}`} />
          </Col>
        </Row>
        <Row>
          <Col xs={3} className={cx("py-1", "d-flex", "align-items-center")}>
            <label>UID:</label>
          </Col>
          <Col xs={4} className={cx("py-1")}>
            <CommandCopy command={`${launcher.uid ?? ""}`} />
          </Col>
        </Row>
        <Row>
          <Col xs={3} className={cx("py-1", "d-flex", "align-items-center")}>
            <label>GUI:</label>
          </Col>
          <Col xs={4} className={cx("py-1")}>
            <CommandCopy command={`${launcher.gid ?? ""}`} />
          </Col>
        </Row>
      </>
    )
  );
}
export function EnvironmentCard({
  launcher,
  environment,
}: {
  launcher: SessionLauncher;
  environment?: SessionEnvironment;
}) {
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
                    {launcher.environment_kind === "global_environment"
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
              {launcher.environment_kind === "container_image" ? (
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
            {launcher.environment_kind === "global_environment" ? (
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
                <Row>
                  <Col
                    xs={3}
                    className={cx("py-1", "d-flex", "align-items-center")}
                  >
                    <label>Container image:</label>
                  </Col>
                  <Col xs={9} className={cx("py-1")}>
                    <CommandCopy command={launcher.container_image} />
                  </Col>
                </Row>
                {launcher.environment_kind === "container_image" && (
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
