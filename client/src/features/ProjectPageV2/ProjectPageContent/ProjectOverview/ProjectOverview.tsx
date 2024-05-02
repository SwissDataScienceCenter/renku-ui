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
import { Col, Row } from "reactstrap";
import { Project } from "../../../projectsV2/api/projectV2.api.ts";
import { SessionLaunchersListDisplay } from "../../../sessionsV2/SessionsV2.tsx";
import { CodeRepositoriesDisplay } from "../CodeRepositories/RepositoriesBox.tsx";
import { DataSourcesDisplay } from "../DataSources/DataSourcesBox.tsx";
import styles from "./ProjectOverview.module.scss";

function OverviewBox({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        "border-1",
        "border-rk-text-light",
        "rounded-2",
        "bg-white",
        "mt-3",
        "mt-lg-0",
        styles.BorderDashed,
        styles.ProjectPageOverviewBox
      )}
    >
      {children}
    </div>
  );
}

export default function ProjectPageOverview({ project }: { project: Project }) {
  return (
    <div className="mx-3 pb-5">
      <Row className="g-5">
        <Col sm={12}>
          <OverviewBox>
            <SessionLaunchersListDisplay project={project} />
          </OverviewBox>
        </Col>
        <Col xl={6}>
          <OverviewBox>
            <DataSourcesDisplay />
          </OverviewBox>
        </Col>
        <Col xl={6}>
          <OverviewBox>
            <CodeRepositoriesDisplay project={project} />
          </OverviewBox>
        </Col>
      </Row>
    </div>
  );
}
