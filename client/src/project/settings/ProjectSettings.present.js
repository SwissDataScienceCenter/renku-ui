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
  FormText, Input, InputGroup, Label, Row, Table, Nav, NavItem, UncontrolledTooltip
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck, faEdit, faExclamationTriangle, faTrash, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash/array";

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
  const disabled = !devAccess || newConfig.updating;

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

  // Handle ongoing operations and errors
  if (config.fetching || options.fetching)
    return (<SessionsDiv><Loader /></SessionsDiv>);

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
      devAccess={devAccess} globalOptions={globalOptions} setConfig={setConfig} disabled={disabled}
    />
  );

  const advancedOptions = (
    <SessionConfigAdvanced devAccess={devAccess} defaults={projectData.defaults.project}
      options={projectData.options.unknown} setConfig={setConfig} disabled={disabled}
    />
  );

  const unknownOptions = (
    <SessionConfigUnknown devAccess={devAccess} defaults={projectData.defaults.project}
      options={projectData.options.unknown} setConfig={setConfig} disabled={disabled}
    />
  );

  // Information based on user's access level
  const text = devAccess ?
    null :
    (<p>Settings can be changed only by developers and maintainers.</p>);

  return (
    <SessionsDiv>
      <NewConfigStatus {...newConfig} />
      {text}
      {knownOptions}
      {advancedOptions}
      {unknownOptions}
    </SessionsDiv>
  );
}

function OptionCol({ option, devAccess, disabled, defaults, globalOptions, setConfig }) {
  return <Col key={option} xs={12} md={5} lg={4}>
    <SessionsElement
      configPrefix={NotebooksHelper.sessionConfigPrefix}
      devAccess={devAccess}
      disabled={disabled}
      globalDefault={defaults.global[option]}
      option={option}
      projectDefault={defaults.project[option]}
      rendering={globalOptions[option]}
      setConfig={setConfig}
    />
  </Col>;

}

function SessionConfigKnown(props) {
  const { availableOptions, defaults, devAccess, disabled, globalOptions, setConfig } = props;
  const optionsRows = [];
  let options = availableOptions.known;
  if (options.includes("default_url")) {
    const option = "default_url";
    const row = <Row key="default_url">
      <OptionCol option={option} defaults={defaults}
        devAccess={devAccess} disabled={disabled}
        globalOptions={globalOptions} setConfig={setConfig} />
    </Row>;
    optionsRows.push(row);
  }

  options = options.filter(o => o !== "default_url");
  let chunks = _.chunk(options, 2);
  chunks.forEach((c, i) => {
    const elements = c.map(option => <OptionCol key={option} option={option} defaults={defaults}
      devAccess={devAccess} disabled={disabled}
      globalOptions={globalOptions} setConfig={setConfig} />);
    const row = <Row key={i}>{elements}</Row>;
    optionsRows.push(row);
  });
  return <Fragment>{optionsRows}</Fragment>;
}

function SessionConfigUnknown(props) {
  const { defaults, devAccess, disabled, setConfig } = props;
  // Remove "image" from the options since that's handled separately
  const options = props.options.length ?
    props.options.filter(option => option !== "image") :
    [];

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
      (<SessionsOptionReset disabled={disabled} onChange={() => resetValue(option)} option={option} />) :
      null;

    return (
      <FormGroup key={option}>
        <Label>{option}: {value}</Label> {reset}
      </FormGroup>
    );
  });

  // Collapse unknown values by default
  return (
    <div className="mb-2">
      <Collapse isOpen={showUnknown}>
        <h5>Unrecognized settings</h5>
        <p>
          The following settings are stored in the project configuration but they are not
          supported in this RenkuLab deployment.
        </p>
        {unknownOptions}
      </Collapse>
      <Button color="link" className="font-italic btn-sm" onClick={toggleShowUnknown}>
        [{showUnknown ? "Hide " : "Show "} unrecognized settings]
      </Button>
    </div>
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
  const { error, keyName } = props;

  if (error) {
    return (
      <Alert color="danger">
        <FontAwesomeIcon icon={faExclamationTriangle} /> Error occurred
        while updating &quot;{keyName}&quot;: {error}
      </Alert>
    );
  }

  return null;
}

function SessionsDiv(props) {
  return (
    <div className="mt-2">
      <h3>Session settings</h3>
      {props.children}
    </div>
  );
}

function SessionsOptionReset(props) {
  const { disabled, onChange, option } = props;
  return (
    <Fragment>
      <Button disabled={disabled} id={`${option}_reset`} color="outline-primary" size="sm"
        className="border-0" onClick={(event) => onChange(event, null, true)}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={`${option}_reset`}>
        Reset value
      </UncontrolledTooltip>
    </Fragment>
  );
}

function SessionsElement(props) {
  const {
    configPrefix, devAccess, disabled, globalDefault, option, projectDefault, rendering, setConfig
  } = props;

  // temporary save the new value to highlight the correct option while updating
  const [newValue, setNewValue] = useState(null);
  const [newValueApplied, setNewValueApplied] = useState(false);

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
        value = event.target.checked;

      else
        value = event.target.value;
    }

    setNewValue(value);
    setNewValueApplied(true);
    const configKey = `${configPrefix}${option}`;
    // ? stringify non null values to prevent API errors
    value = value === null ?
      value :
      value.toString();
    setConfig(configKey, value, rendering.displayName);
  };

  // Provide default info when nothing is selected
  let info = projectDefault != null ?
    null :
    (<FormText>Defaults to <b>{rendering.default.toString()}</b></FormText>);

  // Add reset button
  const reset = devAccess && projectDefault != null ?
    (<SessionsOptionReset disabled={disabled} onChange={onChange} option={option} />) :
    null;

  // Render proper type
  if (rendering.type === "enum") {
    const warning = projectDefault && !rendering.options.includes(projectDefault) && option !== "default_url" ?
      true :
      false;
    if (warning) {
      info = (<FormText color="danger">
        <FontAwesomeIcon className="cursor-default" icon={faExclamationTriangle} /> Unsupported value on RenkuLab.
        { devAccess ? " Consider changing it." : "" }
      </FormText>);
    }
    else if (rendering.options.length === 1) {
      info = (<FormText>Cannot be changed on this server</FormText>);
    }

    const labelLoader = newValueApplied ?
      (<Loader size="14" inline="true" />) :
      null;

    const separator = rendering.options.length === 1 ? null : (<br />);
    return (
      <FormGroup>
        <Label className="me-2">{rendering.displayName} {labelLoader}</Label>
        {separator}
        <ServerOptionEnum {...rendering} selected={newValueApplied ? newValue : projectDefault}
          onChange={onChange} warning={warning ? projectDefault : null} disabled={disabled} />
        {reset}
        {info ? (<Fragment><br />{info}</Fragment>) : null}
      </FormGroup>
    );
  }
  else if (rendering.type === "boolean") {
    return (
      <FormGroup>
        <ServerOptionBoolean {...rendering} selected={newValueApplied ? newValue : projectDefault}
          onChange={onChange} disabled={disabled} />
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
        <br /><ServerOptionRange step={step} {...rendering} selected={newValueApplied ? newValue : projectDefault}
          disabled={disabled} onChange={onChange} />
        {reset}
      </FormGroup>
    );
  }
}

function SessionConfigAdvanced(props) {
  const { defaults, devAccess, disabled, options, setConfig } = props;
  const imageAvailable = options.length && options.includes("image") ?
    true :
    false;

  // Collapse unknown values by default when none are already assigned
  const [showImage, setShowImage] = useState(false);
  const toggleShowImage = () => setShowImage(!showImage);

  const warningMessage = devAccess ?
    (<Alert color="warning">
      <FontAwesomeIcon className="cursor-default" icon={faExclamationTriangle} color="warning" /> Fixing
      an image can yield improvements, but it can also lead to sessions not working in the expected
      way. <a href="https://renku.readthedocs.io/en/latest/user/interactive_customizing.html">
        Please consult the documentation
      </a> before changing this setting.
    </Alert>) :
    null;
  return (
    <div className="mb-2">
      <Collapse isOpen={showImage}>
        <h5>Advanced settings</h5>
        {warningMessage}
        <SessionPinnedImage
          devAccess={devAccess}
          disabled={disabled}
          setConfig={setConfig}
          value={imageAvailable ? defaults["image"] : null}
        />
      </Collapse>
      <Button color="link" className="font-italic btn-sm" onClick={toggleShowImage}>
        [{showImage ? "Hide " : "Show "} advanced settings]
      </Button>
    </div>
  );
}

function SessionPinnedImage(props) {
  const { devAccess, disabled, setConfig, value } = props;

  const [modifyString, setModifyString] = useState(false);
  const [newString, setNewString] = useState("");
  //const [modifyReference, setModifyReference] = useState(false);

  const toggleModifyString = () => {
    if (!modifyString)
      setNewString(value ? value : "");
    // setModifyReference(false);
    setModifyString(!modifyString);
  };

  // const toggleModifyReference = () => {
  //   setModifyString(false);
  //   setModifyReference(!modifyReference);
  // };

  const setValue = (value = null) => {
    if (value !== "")
      setConfig(`${NotebooksHelper.sessionConfigPrefix}image`, value, "Docker image");
    // setConfig("image", value, "Docker image");
  };

  const imageTarget = value ?
    value :
    "none";

  // TODO: alternative solution when implementing selection through branch and commit
  // const modify = devAccess && !modifyString && !modifyReference ?
  //   (<div>
  //     <ButtonGroup>
  //       <Button id="button_change_image_reference" size="sm" color="outline-primary"
  //         onClick={toggleModifyReference}>
  //         Select reference
  //       </Button>
  //       <UncontrolledTooltip placement="top" target="button_change_image_reference">
  //         Pick a specific branch/commit from this project
  //       </UncontrolledTooltip>
  //       <Button id="button_change_image_manually" size="sm" color="outline-primary"
  //         onClick={toggleModifyString}>
  //         Modify manually
  //       </Button>
  //       <UncontrolledTooltip placement="top" target="button_change_image_manually">
  //         Provide a valid docker image uri
  //       </UncontrolledTooltip>
  //     </ButtonGroup>
  //   </div>) :
  //   null;
  const modify = null;

  let image;
  if (modifyString) {
    image = (<Fragment>
      <InputGroup disabled={disabled}>
        <Input value={newString} onChange={e => setNewString(e.target.value)} />
        <Button id="advanced_image_confirm" color="secondary" onClick={() => setValue(newString)}>
          <FontAwesomeIcon icon={faCheck} />
        </Button>
        <Button id="advanced_image_back" color="outline-primary" onClick={toggleModifyString}
          style={{ borderLeft: 0 }}>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_back">
          Discard changes
        </UncontrolledTooltip>
      </InputGroup>
    </Fragment>);
  }
  // TODO: implement selection through branch and commit
  // else if (modifyReference) {
  //   image = "Not implemented yet";
  // }
  else if (value) {
    const edit = devAccess ?
      (<Fragment>
        <Button id="advanced_image_edit" color="outline-primary" onClick={toggleModifyString}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_edit">
          Edit value
        </UncontrolledTooltip>
        <Button id="advanced_image_reset" color="primary" onClick={() => setValue()}
          style={{ borderLeft: 0 }}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_reset">
          Reset value
        </UncontrolledTooltip>
      </Fragment>) :
      null;
    image = (<InputGroup disabled={disabled}><Input disabled={true} value={value} /> {edit}</InputGroup>);
  }
  else {
    const edit = devAccess ?
      (<Fragment>
        <Button disabled={disabled} id="advanced_image_add" color="outline-primary" size="sm"
          className="border-0" onClick={toggleModifyString}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_add">
          Set image
        </UncontrolledTooltip>
      </Fragment>) :
      null;

    image = (<Fragment>
      <code className="me-2">{imageTarget}</code>
      {edit}
    </Fragment>);
  }

  return (
    <FormGroup>
      <Label className="me-2">Docker image:</Label>
      {image}
      {modify}
    </FormGroup>
  );
}

export { ProjectSettingsGeneral, ProjectSettingsNav, ProjectSettingsSessions };
