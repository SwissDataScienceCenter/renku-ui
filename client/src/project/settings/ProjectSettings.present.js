/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  ProjectSettings.present.js
 *  Project settings presentational components.
 */

import React from "react";
import { Col, Nav, NavItem, Row } from "reactstrap";
import { InfoAlert } from "../../components/Alert";
import { RenkuNavLink } from "../../components/RenkuNavLink";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { ProjectAvatarEdit, ProjectTags } from "../shared";

//** Navigation **//

function ProjectSettingsNav(props) {
  return (
    <Nav
      className="flex-column nav-light nav-pills-underline"
      data-cy="settings-navbar"
    >
      <NavItem>
        <RenkuNavLink to={props.settingsUrl} title="General" />
      </NavItem>
      <NavItem>
        <RenkuNavLink to={props.settingsSessionsUrl} title="Sessions" />
      </NavItem>
    </Nav>
  );
}

//** General settings **//

function ProjectSettingsGeneral(props) {
  let loginElement = null;
  if (!props.user.logged) {
    const textPre = "You can";
    const textPost = "here.";
    loginElement = (
      <p className="mt-3 mb-0">
        <LoginAlert
          logged={false}
          noWrapper={true}
          textPre={textPre}
          textPost={textPost}
        />
      </p>
    );
  }

  if (props.settingsReadOnly) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          Project settings can be changed only by maintainers.
        </p>
        {loginElement}
      </InfoAlert>
    );
  }

  return (
    <div className="form-rk-green">
      <Row>
        <Col xs={12}>
          <div className="card card-body mb-4">
            <ProjectTags
              tagList={props.metadata.tagList}
              onProjectTagsChange={props.onProjectTagsChange}
              settingsReadOnly={props.settingsReadOnly}
            />
          </div>
          <div className="card card-body mb-4">
            <ProjectAvatarEdit
              externalUrl={props.externalUrl}
              avatarUrl={props.metadata.avatarUrl}
              onAvatarChange={props.onAvatarChange}
              settingsReadOnly={props.settingsReadOnly}
              includeRequiredLabel={false}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export { ProjectSettingsGeneral, ProjectSettingsNav };
