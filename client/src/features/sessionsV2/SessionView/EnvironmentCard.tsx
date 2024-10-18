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
import { ReactNode } from "react";
import { Clock, Globe2, Link45deg } from "react-bootstrap-icons";
import { Card, CardBody, Col, Row } from "reactstrap";
import { ErrorLabel } from "../../../components/formlabels/FormLabels";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import { safeStringify } from "../session.utils";
import { SessionLauncher } from "../sessionsV2.types";

export function EnvironmentCard({ launcher }: { launcher: SessionLauncher }) {
  const environment = launcher.environment;
  if (!environment) return null;
  const { environment_kind, name } = environment;
  const cardName = environment_kind === "GLOBAL" ? name || "" : launcher.name;

  return (
    <>
      <Card className={cx("border")}>
        <CardBody className={cx("d-flex", "flex-column")}>
          <Row>
            <EnvironmentRow>
              <h5 className={cx("fw-bold", "mb-0")}>
                <small>{cardName}</small>
              </h5>
            </EnvironmentRow>
            <EnvironmentRow>
              {environment.environment_kind === "CUSTOM" ? (
                <>
                  <Link45deg size={24} />
                  Custom image
                </>
              ) : (
                <>
                  <Globe2 size={24} />
                  Global environment
                </>
              )}
            </EnvironmentRow>
            {environment_kind === "GLOBAL" && (
              <>
                <EnvironmentRow>
                  {environment?.description ? (
                    <p>{environment.description}</p>
                  ) : (
                    <p className="fst-italic mb-0">No description</p>
                  )}
                </EnvironmentRow>
                <EnvironmentRowWithLabel
                  label="Container image"
                  value={environment?.container_image || ""}
                />
                <EnvironmentRow>
                  <Clock size="16" className="flex-shrink-0" />
                  Created by <strong>Renku</strong> on{" "}
                  {toHumanDateTime({
                    datetime: launcher.creation_date,
                    format: "date",
                  })}
                </EnvironmentRow>
              </>
            )}
            {environment_kind === "CUSTOM" && (
              <>
                <CustomEnvironmentValues launcher={launcher} />
              </>
            )}
          </Row>
        </CardBody>
      </Card>
    </>
  );
}

export function CustomEnvironmentValues({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  const environment = launcher.environment;

  if (environment.environment_kind !== "CUSTOM") {
    return null;
  }

  return (
    <>
      <EnvironmentRowWithLabel
        label="Container image"
        value={environment?.container_image || ""}
      />
      <EnvironmentRowWithLabel
        label="Default URL path"
        value={environment.default_url}
      />
      <EnvironmentRowWithLabel label="Port" value={environment.port} />
      <EnvironmentRowWithLabel
        label="Working directory"
        value={environment.working_directory}
      />
      <EnvironmentRowWithLabel
        label="Mount directory"
        value={environment.mount_directory}
      />
      <EnvironmentRowWithLabel label="UID" value={environment.uid} />
      <EnvironmentRowWithLabel label="GID" value={environment.gid} />
      <EnvironmentJSONArrayRowWithLabel
        label="Command"
        value={safeStringify(environment.command)}
      />
      <EnvironmentJSONArrayRowWithLabel
        label="Args"
        value={safeStringify(environment.args)}
      />
    </>
  );
}

function EnvironmentRow({ children }: { children: ReactNode }) {
  return (
    <Col
      xs={12}
      className={cx("d-flex", "align-items-center", "py-2", "gap-2")}
    >
      {children}
    </Col>
  );
}

function EnvironmentRowWithLabel({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <EnvironmentRow>
      <div className="d-block">
        <label className={cx("text-nowrap", "mb-0", "me-2")}>{label}:</label>
        <code>{value ?? "-"}</code>
      </div>
    </EnvironmentRow>
  );
}

function EnvironmentJSONArrayRowWithLabel({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <EnvironmentRow>
      <div className="d-block">
        <label className={cx("text-nowrap", "mb-0", "me-2")}>{label}:</label>
        {value === null ? (
          <ErrorLabel text={"Invalid JSON array value"} />
        ) : (
          <code> {value} </code>
        )}
      </div>
    </EnvironmentRow>
  );
}
