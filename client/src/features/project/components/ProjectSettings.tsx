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

import { Route, Switch } from "react-router";
import { Col, Nav, NavItem, Row } from "reactstrap";
import { RenkuNavLink } from "../../../components/RenkuNavLink";
import ProjectSettingsCloudStorage from "./ProjectSettingsCloudStorage";
import { ProjectSettingsGeneral } from "./ProjectSettingsGeneral";
import ProjectSettingsSessions from "./ProjectSettingsSessions";

type ProjectSettingsGeneralProps = Parameters<typeof ProjectSettingsGeneral>[0];

interface ProjectSettingsProps extends ProjectSettingsGeneralProps {
  settingsUrl: string;
  settingsSessionsUrl: string;
  settingsCloudStorageUrl: string;
}

export default function ProjectSettings({
  settingsUrl,
  settingsSessionsUrl,
  settingsCloudStorageUrl,
  ...rest
}: ProjectSettingsProps) {
  return (
    <Col key="settings">
      <Row>
        <Col key="nav" sm={12} md={2}>
          <ProjectSettingsNav
            settingsUrl={settingsUrl}
            settingsSessionsUrl={settingsSessionsUrl}
            settingsCloudStorageUrl={settingsCloudStorageUrl}
          />
        </Col>
        <Col key="content" sm={12} md={10} data-cy="settings-container">
          <Switch>
            <Route exact path={settingsUrl}>
              <ProjectSettingsGeneral
                settingsUrl={settingsUrl}
                settingsSessionsUrl={settingsSessionsUrl}
                settingsCloudStorageUrl={settingsCloudStorageUrl}
                {...rest}
              />
            </Route>
            <Route exact path={settingsSessionsUrl}>
              <ProjectSettingsSessions />
            </Route>
            <Route exact path={settingsCloudStorageUrl}>
              <ProjectSettingsCloudStorage />
            </Route>
          </Switch>
        </Col>
      </Row>
    </Col>
  );
}

interface ProjectSettingsNavProps {
  settingsUrl: string;
  settingsSessionsUrl: string;
  settingsCloudStorageUrl: string;
}

export function ProjectSettingsNav({
  settingsUrl,
  settingsSessionsUrl,
  settingsCloudStorageUrl,
}: ProjectSettingsNavProps) {
  return (
    <Nav
      className="flex-column nav-light nav-pills-underline"
      data-cy="settings-navbar"
    >
      <NavItem>
        <RenkuNavLink to={settingsUrl} title="General" />
      </NavItem>
      <NavItem>
        <RenkuNavLink to={settingsSessionsUrl} title="Sessions" />
      </NavItem>
      <NavItem>
        <RenkuNavLink to={settingsCloudStorageUrl} title="Cloud Storage" />
      </NavItem>
    </Nav>
  );
}
