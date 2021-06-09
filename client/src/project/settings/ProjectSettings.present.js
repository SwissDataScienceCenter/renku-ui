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

import React, { Component, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert, Button, Col, Collapse, Form, FormGroup,
  FormText, Input, Label, Row, Table, Nav, NavItem, UncontrolledTooltip
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle, faInfoCircle, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { ACCESS_LEVELS } from "../../api-client";
import { ProjectAvatarEdit, ProjectTags, } from "../shared";
import { NotebooksHelper, ServerOptionBoolean, ServerOptionEnum, ServerOptionRange } from "../../notebooks";
import { Clipboard, Loader, RenkuNavLink } from "../../utils/UIComponents";
import { Url } from "../../utils/url";


//** Navigation **//

function ProjectSettingsNav(props) {
  return (
    <Nav className="flex-column nav-light">
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
  return (
    <Fragment>
      <Row className="mt-2">
        <Col xs={12} lg={6}>
          <ProjectTags
            tag_list={props.system.tag_list}
            onProjectTagsChange={props.onProjectTagsChange}
            settingsReadOnly={props.settingsReadOnly} />
          <ProjectDescription {...props} />
        </Col>
        <Col xs={12} lg={6}>
          <RepositoryClone {...props} />
          <RepositoryUrls {...props} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <ProjectAvatarEdit externalUrl={props.externalUrl}
            avatarUrl={props.core.avatar_url} onAvatarChange={props.onAvatarChange}
            settingsReadOnly={props.settingsReadOnly} />
        </Col>
      </Row>
    </Fragment>
  );
}

class RepositoryClone extends Component {
  render() {
    const { externalUrl } = this.props;
    const renkuClone = `renku clone ${externalUrl}.git`;
    return (
      <div className="mb-3">
        <Label className="font-weight-bold">Clone commands</Label>
        <Table size="sm" className="mb-0">
          <tbody>
            <CommandRow application="Renku" command={renkuClone} />
          </tbody>
        </Table>
        <GitCloneCmd externalUrl={externalUrl} projectPath={this.props.core.project_path} />
      </div>
    );
  }
}

function GitCloneCmd(props) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const { externalUrl, projectPath } = props;
  const gitClone = `git clone ${externalUrl}.git && cd ${projectPath} && git lfs install --local --force`;
  const gitHooksInstall = "renku githooks install"; // eslint-disable-line
  return (cmdOpen) ?
    <div className="mt-3">
      <p style={{ fontSize: "smaller" }} className="font-italic">
        If the <b>renku</b> command is not available, you can clone a project using Git.
      </p>
      <Table style={{ fontSize: "smaller" }} size="sm" className="mb-0" borderless={true}>
        <tbody>
          <tr>
            <th scope="row">Git<sup>*</sup></th>
            <td>
              <code>{gitClone}</code>
              <div className="mt-2 mb-0">
                If you want to work with the repo using renku, {" "}
                you need to run the following after the <code>git clone</code> completes:
              </div>
            </td>
            <td style={{ width: 1 }}><Clipboard clipboardText={gitClone} /></td>
          </tr>
          <tr>
            <th scope="row"></th>
            <td>
              <code>{gitHooksInstall}</code>
            </td>
            <td style={{ width: 1 }}><Clipboard clipboardText={gitHooksInstall} /></td>
          </tr>
        </tbody>
      </Table>
      <Button style={{ fontSize: "smaller" }} color="link" onClick={() => setCmdOpen(false)}>
        Hide git command
      </Button>
    </div> :
    <Button color="link" style={{ fontSize: "smaller" }} className="font-italic"
      onClick={() => setCmdOpen(true)}>
      Do not have renku?
    </Button>;
}

class ProjectDescription extends Component {
  constructor(props) {
    super(props);
    this.state = ProjectDescription.getDerivedStateFromProps(props, {});
    this.onValueChange = this.handleChange.bind(this);
    this.onSubmit = this.handleSubmit.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const update = { value: nextProps.core.description };
    return { ...update, ...prevState };
  }

  handleChange(e) { this.setState({ value: e.target.value }); }

  handleSubmit(e) { e.preventDefault(); this.props.onProjectDescriptionChange(this.state.value); }

  render() {
    const inputField = this.props.settingsReadOnly ?
      <Input id="projectDescription" readOnly value={this.state.value} /> :
      <Input id="projectDescription" onChange={this.onValueChange}
        value={this.state.value === null ? "" : this.state.value} />;
    let submit = (this.props.core.description !== this.state.value) ?
      <Button className="mb-3 updateProjectSettings" color="primary">Update</Button> :
      <span></span>;
    return <Form onSubmit={this.onSubmit}>
      <FormGroup>
        <Label for="projectDescription">Project Description</Label>
        {inputField}
        <FormText>A short description for the project</FormText>
      </FormGroup>
      {submit}
    </Form>;
  }
}

function CommandRow(props) {
  return (
    <tr>
      <th scope="row">{props.application}</th>
      <td>
        <code>{props.command}</code>
      </td>
      <td style={{ width: 1 }}><Clipboard clipboardText={props.command} /></td>
    </tr>
  );
}

class RepositoryUrls extends Component {
  render() {
    return (
      <div className="mb-3">
        <Label className="font-weight-bold">Repository URL</Label>
        <Table size="sm">
          <tbody>
            <RepositoryUrlRow urlType="SSH" url={this.props.system.ssh_url} />
            <RepositoryUrlRow urlType="HTTP" url={this.props.system.http_url} />
          </tbody>
        </Table>
      </div>
    );
  }
}

function RepositoryUrlRow(props) {
  return (
    <tr>
      <th scope="row">{props.urlType}</th>
      <td>{props.url}</td>
      <td style={{ width: 1 }}><Clipboard clipboardText={props.url} /></td>
    </tr>
  );
}


//** Sessions settings **//

function ProjectSettingsSessions(props) {
  const { config, location, metadata, newConfig, options, setConfig, user } = props;
  const { accessLevel } = metadata;
  const devAccess = accessLevel > ACCESS_LEVELS.DEVELOPER ? true : false;

  // ? Anonymous users may have problem with notebook options, depending on the deployment
  if (!user.logged) {
    const to = Url.get(Url.pages.login.link, { pathname: location.pathname });
    return (
      <SessionsDiv>
        <p>Anonymous users cannot access sessions settings.</p>
        <p>You can <Link className="btn btn-primary btn-sm" to={to}>Log in</Link> to see them.</p>
      </SessionsDiv>
    );
  }

  // Handle ongoing operations
  if (config.fetching || options.fetching)
    return (<SessionsDiv><Loader /></SessionsDiv>);

  if (newConfig.updating)
    return (<SessionsDiv><NewConfigStatus {...newConfig} /></SessionsDiv>);

  // Handle errors
  if (config.error && config.error.code)
    return (<SessionsDiv><SessionConfigError config={config} /></SessionsDiv>);

  // ? this prevents early rendering when hitting the sessions page on the url bar directly
  const globalOptions = options.global;
  if (!Object.keys(options.global).length)
    return null;

  // Get metadata and create the visual elements for every option
  const projectData = NotebooksHelper.getProjectDefault(
    options.global ? options.global : {},
    config.data ? config.data : {}
  );

  const knownOptions = (
    <SessionConfigKnown availableOptions={projectData.options} defaults={projectData.defaults}
      devAccess={devAccess} globalOptions={globalOptions} setConfig={setConfig}
    />
  );

  const unknownOptions = (
    <SessionConfigUnknown devAccess={devAccess} defaults={projectData.defaults.project}
      options={projectData.options.unknown} setConfig={setConfig}
    />
  );

  // Information based on user's access level
  const text = devAccess ?
    (<p>
      Any change will be permanently saved in the project options and used as default.
      <br /> Mind that users can still manually modify any option before starting a session.
    </p>) :
    (<p>Settings can be changed only by developers and maintainers.</p>);

  return (
    <SessionsDiv>
      <NewConfigStatus {...newConfig} />
      {text}
      {knownOptions}
      {unknownOptions}
    </SessionsDiv>
  );
}

function SessionConfigKnown(props) {
  const { availableOptions, defaults, devAccess, globalOptions, setConfig } = props;

  return availableOptions.known.map(option => {
    return (
      <SessionsElement key={option}
        option={option} // key cannot be accessed as a property, hence the duplication here
        globalDefault={defaults.global[option]}
        projectDefault={defaults.project[option]}
        rendering={globalOptions[option]}
        setConfig={setConfig}
        devAccess={devAccess}
        configPrefix={NotebooksHelper.sessionConfigPrefix}
      />
    );
  });
}

function SessionConfigUnknown(props) {
  const { defaults, devAccess, options, setConfig } = props;

  const [showUnknown, setShowUnknown] = useState(false);
  const toggleShowUnknown = () => setShowUnknown(!showUnknown);

  const resetValue = (option) => {
    const configKey = `${NotebooksHelper.sessionConfigPrefix}${option}`;
    setConfig(configKey, null, option);
  };

  // Don't show anything when there are no unknown settings
  if (!options || !options.length)
    return null;

  // Create option elements
  const unknownOptions = options.map(option => {
    const value = defaults[option];

    const reset = devAccess ?
      (<SessionsOptionReset onChange={() => resetValue(option)} option={option} />) :
      null;

    return (
      <FormGroup key={option}>
        <Label>{option}: {value}</Label> {reset}
      </FormGroup>
    );
  });

  // Collapse unknown values by default
  return (
    <Fragment>
      <Collapse isOpen={showUnknown}>
        <h4>Unrecognized settings</h4>
        <p>
          The following settings are stored in the project configuration but they are not
          supported in this RenkuLab deployment.
        </p>
        {unknownOptions}
      </Collapse>
      <Button color="link" className="font-italic btn-sm" onClick={toggleShowUnknown}>
        [{showUnknown ? "Hide " : "Show "} unrecognized settings]
      </Button>
    </Fragment>
  );
}

function SessionConfigError(props) {
  const { config } = props;

  const [showError, setShowError] = useState(false);
  const toggleShowError = () => setShowError(!showError);

  return (
    <Alert color="danger">
      <h3>Error</h3>
      <p>We could not access the project settings.</p>

      <Collapse isOpen={showError}>
        <code>{config.error.reason ? config.error.reason : `Error code ${config.error.code}`}</code>
      </Collapse>
      <Button color="link" className="font-italic btn-sm" onClick={toggleShowError}>
        [{showError ? "Hide details" : "Show details"} info]
      </Button>
    </Alert>
  );
}

function NewConfigStatus(props) {
  const { error, keyName, updated, updating, value } = props;

  if (updating) {
    return (<div><span>Updating {keyName}, please wait... <Loader size="14" inline="true" /></span></div>);
  }
  else if (error) {
    return (
      <Alert color="danger">
        <FontAwesomeIcon icon={faExclamationTriangle} /> Error occurred
        while updating &quot;{keyName}&quot;: {error}
      </Alert>
    );
  }
  else if (updated) {
    const text = value == null ?
      "unset." :
      (<span>updated to <code>{value}</code></span>);
    return (<Alert color="info"><FontAwesomeIcon icon={faInfoCircle} /> &quot;{keyName}&quot; {text}</Alert>);
  }

  return null;
}

function SessionsDiv(props) {
  return (
    <div className="mt-2">
      <h3>Sessions settings</h3>
      {props.children}
    </div>
  );
}

function SessionsOptionReset(props) {
  const { onChange, option } = props;
  return (
    <Fragment>
      <Button id={`${option}_reset`} color="outline-primary" size="sm" className="border-0"
        onClick={(event) => onChange(event, null, true)}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={`${option}_reset`}>
        Reset value
      </UncontrolledTooltip>
    </Fragment>
  );
}

function SessionsElement(props) {
  const { configPrefix, devAccess, globalDefault, option, projectDefault, rendering, setConfig } = props;

  // Compatibility layer to re-use the notebooks presentation components
  const onChange = (event, providedValue, reset = false) => {
    if (!devAccess)
      return null;

    // get the correct value
    let value;
    if (reset) {
      value = null;
    }
    else if (providedValue != null) {
      value = providedValue;
    }
    else {
      const target = event.target.type.toLowerCase();
      if (target === "button")
        value = event.target.textContent;

      else if (target === "checkbox")
        value = event.target.checked.toString();

      else
        value = event.target.value;
    }

    const configKey = `${configPrefix}${option}`;
    setConfig(configKey, value, rendering.displayName);
  };

  // Provide default info when nothing is selected
  const info = projectDefault != null ?
    null :
    (<Fragment>
      <span id={`${option}_info`}><FontAwesomeIcon className="cursor-default" icon={faInfoCircle} /></span>
      <UncontrolledTooltip key="tooltip" placement="top" target={`${option}_info`}>
        Default RenkuLab value: <code className="text-white">{rendering.default.toString()}</code>
      </UncontrolledTooltip>
    </Fragment>);

  // Add reset button
  const reset = devAccess && projectDefault != null ?
    (<SessionsOptionReset onChange={onChange} option={option} />) :
    null;

  // Render proper type
  if (rendering.type === "enum") {
    let warning = projectDefault && !rendering.options.includes(projectDefault) && option !== "default_url" ?
      (<Fragment>
        <span id={`${option}_warn`} className="text-danger">
          <FontAwesomeIcon className="cursor-default" icon={faExclamationTriangle} color="danger" />
        </span>
        <UncontrolledTooltip key="tooltip" placement="top" target={`${option}_warn`}>
          Unsupported value on RenkuLab.
          { devAccess ? " Consider changing it." : "" }
        </UncontrolledTooltip>
      </Fragment>) :
      null;

    return (
      <FormGroup>
        <Label className="me-2">{rendering.displayName} {info} {warning}</Label>
        <ServerOptionEnum {...rendering} selected={projectDefault} onChange={onChange}
          warning={warning ? projectDefault : null} />
        {reset}
      </FormGroup>
    );
  }
  else if (rendering.type === "boolean") {
    return (
      <FormGroup>
        <ServerOptionBoolean {...rendering} selected={projectDefault} onChange={onChange} />
        {reset}
      </FormGroup>
    );
  }
  else if (rendering.type === "float" || rendering.type === "int") {
    const step = rendering.type === "float" ?
      0.01 :
      1;
    return (
      <FormGroup>
        <Label className="me-2">{`${rendering.displayName}: ${projectDefault || globalDefault}`}</Label>
        <ServerOptionRange step={step} {...rendering} selected={projectDefault} onChange={onChange} />
        {reset}
      </FormGroup>
    );
  }
}

export { ProjectSettingsGeneral, ProjectSettingsNav, ProjectSettingsSessions };
