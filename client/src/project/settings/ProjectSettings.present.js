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

import React, { Component } from "react";
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
import { EditVisibility } from "../new/components/Visibility";

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

  const namespace = {
    name: props.metadata.namespace,
    kind: props.metadata.namespaceKind,
  };

  return (
    <div className="form-rk-green">
      <Row className="mt-2">
        <Col xs={12}>
          <div className="form-rk-section">
            <ProjectTags
              tagList={props.metadata.tagList}
              onProjectTagsChange={props.onProjectTagsChange}
              settingsReadOnly={props.settingsReadOnly}
            />
          </div>
          <div className="form-rk-section">
            <ProjectDescription {...props} />
          </div>
          <div className="form-rk-section">
            <EditVisibility
              projectId={props.metadata.id}
              namespace={namespace}
              forkedProjectId={props.forkedFromProject?.id}
              visibility={props.metadata.visibility}
            />
          </div>
          <div className="form-rk-section">
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
