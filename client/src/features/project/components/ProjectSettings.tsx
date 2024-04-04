/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { Route, Routes } from "react-router-dom-v5-compat";
import { Col, Nav, NavItem, Row } from "reactstrap";

import RenkuNavLinkV2 from "../../../components/RenkuNavLinkV2";
import ProjectSettingsCloudStorage from "./ProjectSettingsCloudStorage";
import { ProjectSettingsGeneral } from "./ProjectSettingsGeneral";
import ProjectSettingsSessions from "./ProjectSettingsSessions";

type ProjectSettingsProps = Parameters<typeof ProjectSettingsGeneral>[0];

export default function ProjectSettings({ ...props }: ProjectSettingsProps) {
  return (
    <Col key="settings">
      <Row>
        <Col key="nav" sm={12} md={2}>
          <ProjectSettingsNav />
        </Col>
        <Col key="content" sm={12} md={10} data-cy="settings-container">
          <Routes>
            <Route path="/" element={<ProjectSettingsGeneral {...props} />} />
            <Route path="sessions" element={<ProjectSettingsSessions />} />
            <Route path="storage" element={<ProjectSettingsCloudStorage />} />
          </Routes>
        </Col>
      </Row>
    </Col>
  );
}

export function ProjectSettingsNav() {
  return (
    <Nav
      className="flex-column nav-light nav-pills-underline"
      data-cy="settings-navbar"
    >
      <NavItem>
        <RenkuNavLinkV2 end to=".">
          General
        </RenkuNavLinkV2>
      </NavItem>
      <NavItem>
        <RenkuNavLinkV2 to="sessions">Sessions</RenkuNavLinkV2>
      </NavItem>
      <NavItem>
        <RenkuNavLinkV2 to="storage">Cloud Storage</RenkuNavLinkV2>
      </NavItem>
    </Nav>
  );
}
