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
import { Card, CardBody, Col, Row, Table } from "reactstrap";

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
    <Card data-cy="env-variables-card" className={cx("border")}>
      <CardBody className={cx("d-flex", "flex-column")}>
        <Row>
          <Col
            xs={12}
            className={cx(
              "d-flex",
              "flex-wrap",
              "flex-sm-nowrap",
              "align-items-start",
              "justify-content-between",
              "pb-2",
              "gap-2"
            )}
          >
            <Table size="sm">
              <tbody>
                {envVariables.map((env) => (
                  <EnvVariableRow
                    key={env.name}
                    env={env.name}
                    value={env.value}
                  />
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

interface EnvRowParameterProps {
  env: string;
  value: string | null | undefined;
}

function EnvVariableRow({ env, value }: EnvRowParameterProps) {
  return (
    <tr>
      <th scope="row">{env}</th>
      <td>{value ?? ""}</td>
    </tr>
  );
}
