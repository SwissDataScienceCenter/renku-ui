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
import { Col, ListGroup, ListGroupItem, Row } from "reactstrap";

import type { SessionLauncher } from "../api/sessionLaunchersV2.api";

export default function EnvVariablesCard({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  const envVariables = launcher.env_variables ?? [];

  if (envVariables.length === 0) {
    return (
      <p className="fst-italic">No environment variables have been defined.</p>
    );
  }

  return (
    <ListGroup data-cy="env-variables-card">
      {envVariables.map(({ name, value }) => (
        <ListGroupItem key={`env-var-${name}`}>
          <Row data-cy="env-var-row">
            <Col
              xs={6}
              className={cx("fw-bold", "text-break")}
              data-cy="env-var-name"
            >
              {name}
            </Col>
            <Col xs={6} className="text-break" data-cy="env-var-value">
              {value ?? ""}
            </Col>
          </Row>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}
