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

import React, { Component, useEffect } from "react";
import {
  Col,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Nav,
  NavItem,
  Row,
} from "reactstrap";
import { InfoAlert } from "../../components/Alert";
import { RenkuNavLink } from "../../components/RenkuNavLink";
import { InlineSubmitButton } from "../../components/buttons/Button";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { ProjectAvatarEdit, ProjectTags } from "../shared";

//** Navigation **//

function ProjectSettingsNav(props) {
  return (
    <Nav className="flex-column nav-light nav-pills-underline">
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
  useEffect(() => {
    return function cleanup() {
      props?.fetchProject(true);
    };
  }, []); // eslint-disable-line

  if (props.settingsReadOnly && !props.user.logged) {
    const textIntro = "Only authenticated users can access project setting.";
    const textPost = "to visualize project settings.";
    return (
      <LoginAlert logged={false} textIntro={textIntro} textPost={textPost} />
    );
  }

  if (props.settingsReadOnly) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          Project settings can be changed only by maintainers.
        </p>
      </InfoAlert>
    );
  }

  return (
    <div className="form-rk-green">
      <Row className="mt-2">
        <Col xs={12}>
          <ProjectTags
            tagList={props.metadata.tagList}
            onProjectTagsChange={props.onProjectTagsChange}
            settingsReadOnly={props.settingsReadOnly}
          />
          <ProjectDescription {...props} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <ProjectAvatarEdit
            externalUrl={props.externalUrl}
            avatarUrl={props.metadata.avatarUrl}
            onAvatarChange={props.onAvatarChange}
            settingsReadOnly={props.settingsReadOnly}
          />
        </Col>
      </Row>
    </div>
  );
}

class ProjectDescription extends Component {
  constructor(props) {
    super(props);
    this.state = ProjectDescription.getDerivedStateFromProps(props, {});
    this.onValueChange = this.handleChange.bind(this);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = { value: nextProps.metadata.description, pristine: true };
    return { ...update, ...prevState };
  }

  handleChange(e) {
    if (e.target.values !== this.state.value)
      this.setState({ value: e.target.value, updated: false, pristine: false });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ value: this.state.value, updating: true });
    this.props.onProjectDescriptionChange(this.state.value).then(() => {
      this.setState({
        value: this.state.value,
        updated: true,
        updating: false,
      });
    });
  }

  render() {
    const inputField =
      this.props.settingsReadOnly || this.state.updating ? (
        <Input id="projectDescription" readOnly value={this.state.value} />
      ) : (
        <Input
          id="projectDescription"
          onChange={this.onValueChange}
          data-cy="description-input"
          value={this.state.value === null ? "" : this.state.value}
        />
      );

    const submitButton = this.props.settingsReadOnly ? null : (
      <InlineSubmitButton
        id="update-desc"
        className="updateProjectSettings"
        submittingText="Updating"
        doneText="Updated"
        text="Update"
        isDone={this.state.updated}
        isReadOnly={this.state.updating || this.state.pristine}
        isSubmitting={this.state.updating}
        pristine={this.state.pristine}
        tooltipPristine="Modify description to update value"
      />
    );
    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup>
          <Label for="projectDescription">Project Description</Label>
          <div className="d-flex">
            {inputField}
            {submitButton}
          </div>
          <FormText>A short description for the project</FormText>
        </FormGroup>
      </Form>
    );
  }
}

export { ProjectSettingsGeneral, ProjectSettingsNav };
