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

import { ReactNode } from "react";
import { Col, Row } from "reactstrap";

import GroupNew from "~/features/groupsV2/new/GroupNew";
import type { Project } from "~/features/projectsV2/api/projectV2.api";
import ProjectV2New from "~/features/projectsV2/new/ProjectV2New";
import ContainerWrap from "../../../components/container/ContainerWrap";
import ProjectPageHeader from "../ProjectPageHeader/ProjectPageHeader";
import ProjectPageNav from "../ProjectPageNav/ProjectPageNav";

interface ProjectPageLayoutProps {
  project: Project;
  children?: ReactNode;
}

export default function ProjectPageLayout({
  project,
  children,
}: ProjectPageLayoutProps) {
  return (
    <ContainerWrap>
      <ProjectV2New />
      <GroupNew />

      <Row>
        <Col xs={12}>
          <ProjectPageHeader project={project} />
        </Col>
        <Col xs={12} className="mb-2">
          <div className="mb-3">
            <ProjectPageNav project={project} />
          </div>
        </Col>
        <Col xs={12}>
          <main>{children}</main>
        </Col>
      </Row>
    </ContainerWrap>
  );
}
