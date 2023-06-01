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
import {
  faCheck,
  faEdit,
  faExclamationTriangle,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import { Link } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  FormGroup,
  FormText,
  Input,
  InputGroup,
  Label,
  Collapse,
  UncontrolledTooltip,
  ExternalLink,
  Nav,
  NavItem,
  Row,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../api-client";
import { InfoAlert, WarnAlert } from "../../components/Alert";
import { Loader } from "../../components/Loader";
import { RenkuNavLink } from "../../components/RenkuNavLink";
import { InlineSubmitButton } from "../../components/buttons/Button";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { Url } from "../../utils/helpers/url";
import { ProjectAvatarEdit, ProjectTags } from "../shared";
import {
  NotebooksHelper,
  ServerOptionBoolean,
  ServerOptionEnum,
  ServerOptionRange,
} from "../../notebooks";
import { CoreErrorAlert } from "../../components/errors/CoreErrorAlert";
import { Docs } from "../../utils/constants/Docs";
import { SuccessLabel } from "../../components/formlabels/FormLabels";

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

//** Sessions settings **//

function ProjectSettingsSessions(props) {
  const { config, coreSupport, metadata, newConfig, options, setConfig, user } =
    props;
  const { accessLevel, repositoryUrl } = metadata;
  const devAccess = accessLevel > ACCESS_LEVELS.DEVELOPER ? true : false;
  const locked = props.lockStatus?.locked ?? false;
  const disabled = !devAccess || newConfig?.updating;

  // ? Anonymous users may have problem with notebook options, depending on the deployment
  if (!user.logged) {
    const textIntro = "Only authenticated users can access sessions setting.";
    const textPost = "to visualize sessions settings.";
    return (
      <SessionsDiv>
        <LoginAlert
          logged={user.logged}
          textIntro={textIntro}
          textPost={textPost}
        />
      </SessionsDiv>
    );
  }
  if (locked) {
    return (
      <SessionsDiv>
        <p className="text-muted">
          This project is currently being modified. You will be able to change
          the session settings once the changes to the project are complete.
        </p>
      </SessionsDiv>
    );
  }

  // Handle ongoing operations and errors
  if (config.fetching || options.fetching || !coreSupport.computed) {
    let message;
    if (config.fetching) message = "Getting project settings...";
    else if (options.fetching) message = "Getting RenkuLab settings...";
    else if (!coreSupport.computed)
      message = "Checking project version and RenkuLab compatibility...";
    else message = "Please wait...";

    return (
      <SessionsDiv>
        <p>{message}</p>
        <Loader />
      </SessionsDiv>
    );
  }

  if (!coreSupport.backendAvailable) {
    const settingsUrl = Url.get(Url.pages.project.settings, {
      namespace: metadata.namespace,
      path: metadata.path,
    });
    const updateInfo = devAccess
      ? "It is necessary to update this project"
      : "It is necessary to update this project. Either contact a project maintainer, or fork and update it";
    return (
      <SessionsDiv>
        <p>Session settings not available.</p>
        <WarnAlert dismissible={false}>
          <p>
            <b>Session settings are unavailable</b> because the project is not
            compatible with this RenkuLab instance.
          </p>
          <p>
            {updateInfo}.
            <br />
            The <Link to={settingsUrl}>Project settings</Link> page provides
            further information.
          </p>
        </WarnAlert>
      </SessionsDiv>
    );
  }

  if (config.error && config.error.code)
    return (
      <SessionsDiv>
        <CoreErrorAlert error={config.error} />
      </SessionsDiv>
    );

  // ? this prevents early rendering when hitting the sessions page on the url bar directly
  const globalOptions = options.global;
  if (!Object.keys(options.global).length) return null;

  // Get metadata and create the visual elements for every option
  const projectData = NotebooksHelper.getProjectDefault(
    options.global ? options.global : {},
    config.data ? config.data : {}
  );

  const knownOptions = (
    <SessionConfigKnown
      availableOptions={projectData.options}
      defaults={projectData.defaults}
      disabled={disabled}
      devAccess={devAccess}
      globalOptions={globalOptions}
      newConfig={newConfig}
      setConfig={setConfig}
    />
  );

  const advancedOptions = (
    <SessionConfigAdvanced
      devAccess={devAccess}
      defaults={projectData.defaults.project}
      disabled={disabled}
      options={projectData.options.unknown}
      repositoryUrl={repositoryUrl}
      setConfig={setConfig}
    />
  );

  const unknownOptions = (
    <SessionConfigUnknown
      devAccess={devAccess}
      defaults={projectData.defaults.project}
      options={projectData.options.unknown}
      setConfig={setConfig}
      disabled={disabled}
    />
  );

  // Information based on user's access level
  const text = devAccess ? null : (
    <p>Settings can be changed only by developers and maintainers.</p>
  );

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

function OptionCol({
  option,
  devAccess,
  disabled,
  defaults,
  globalOptions,
  setConfig,
  newConfig,
}) {
  const configKey = `${NotebooksHelper.sessionConfigPrefix}${option}`;
  const newConfigOption = newConfig?.key === configKey ? newConfig : null;
  return (
    <Col key={option} xs={12} md={6} lg={5}>
      <SessionsElement
        configPrefix={NotebooksHelper.sessionConfigPrefix}
        devAccess={devAccess}
        disabled={disabled}
        globalDefault={defaults.global[option]}
        option={option}
        projectDefault={defaults.project[option]}
        rendering={globalOptions[option]}
        setConfig={setConfig}
        newConfigOption={newConfigOption}
      />
    </Col>
  );
}

function SessionConfigKnown(props) {
  const {
    availableOptions,
    defaults,
    devAccess,
    disabled,
    globalOptions,
    setConfig,
    newConfig,
  } = props;
  const optionsRows = [];
  let options = availableOptions.known;
  if (options.includes("default_url")) {
    const option = "default_url";
    const row = (
      <Row key="default_url">
        <OptionCol
          option={option}
          defaults={defaults}
          devAccess={devAccess}
          disabled={disabled}
          newConfig={newConfig}
          globalOptions={globalOptions}
          setConfig={setConfig}
        />
      </Row>
    );
    optionsRows.push(row);
  }

  options = options.filter((o) => {
    if (o === "default_url") return false;
    if (globalOptions[o].default == null) return false;
    return true;
  });
  let chunks = _.chunk(options, 2);
  chunks.forEach((c, i) => {
    const elements = c.map((option) => (
      <OptionCol
        key={option}
        option={option}
        defaults={defaults}
        devAccess={devAccess}
        disabled={disabled}
        globalOptions={globalOptions}
        setConfig={setConfig}
        newConfig={newConfig}
      />
    ));
    const row = <Row key={i}>{elements}</Row>;
    optionsRows.push(row);
  });
  return <Fragment>{optionsRows}</Fragment>;
}

function SessionConfigUnknown(props) {
  const { defaults, devAccess, disabled, setConfig } = props;
  // Remove "image" from the options since that's handled separately
  const options = props.options.length
    ? props.options.filter((option) => option !== "image")
    : [];

  const [showUnknown, setShowUnknown] = useState(false);
  const toggleShowUnknown = () => setShowUnknown(!showUnknown);

  const resetValue = (option) => {
    const configKey = `${NotebooksHelper.sessionConfigPrefix}${option}`;
    setConfig(configKey, null, option);
  };

  // Don't show anything when there are no unknown settings
  if (!options || !options.length) return null;

  // Create option elements
  const unknownOptions = options.map((option) => {
    const value = defaults[option];
    if (value == null) return null;

    const reset = devAccess ? (
      <SessionsOptionReset
        disabled={disabled}
        onChange={() => resetValue(option)}
        option={option}
      />
    ) : null;

    return (
      <FormGroup key={option}>
        <Label>
          {option}: {value}
        </Label>{" "}
        {reset}
      </FormGroup>
    );
  });

  // Collapse unknown values by default
  return (
    <div className="mb-2">
      <Collapse isOpen={showUnknown}>
        <h5>Unrecognized settings</h5>
        <p>
          The following settings are stored in the project configuration but
          they are not supported in this RenkuLab deployment.
        </p>
        {unknownOptions}
      </Collapse>
      <Button
        color="link"
        className="font-italic btn-sm"
        onClick={toggleShowUnknown}
      >
        [{showUnknown ? "Hide " : "Show "} unrecognized settings]
      </Button>
    </div>
  );
}

function NewConfigStatus(props) {
  const { error, keyName } = props;

  if (!error) return null;

  let message = `Error occurred while updating "${keyName}"`;
  if (error.reason) message += `: ${error.reason}`;
  else if (error.userMessage) message += `: ${error.userMessage}`;
  else message += ".";
  return <CoreErrorAlert error={error} message={message} />;
}

function SessionsDiv(props) {
  return (
    <div className="mt-2">
      <h3>Session settings</h3>
      <div className="form-rk-green">{props.children}</div>
    </div>
  );
}

function SessionsOptionReset(props) {
  const { disabled, onChange, option } = props;
  return (
    <>
      <Button
        disabled={disabled}
        id={`${option}_reset`}
        color=""
        size="sm"
        className="border-0"
        onClick={(event) => onChange(event, null, true)}
      >
        <FontAwesomeIcon icon={faTimesCircle} />
      </Button>
      <UncontrolledTooltip
        key="tooltip"
        placement="top"
        target={`${option}_reset`}
      >
        Reset value
      </UncontrolledTooltip>
    </>
  );
}

function SessionsElement(props) {
  const {
    configPrefix,
    devAccess,
    disabled,
    globalDefault,
    option,
    projectDefault,
    rendering,
    setConfig,
    newConfigOption,
  } = props;

  // temporary save the new value to highlight the correct option while updating
  const [newValue, setNewValue] = useState(null);
  const [newValueApplied, setNewValueApplied] = useState(false);

  if (rendering.default == null) return null;

  // Compatibility layer to re-use the notebooks presentation components
  const onChange = (event, providedValue, reset = false) => {
    if (!devAccess) return null;

    // get the correct value
    let value;
    if (reset) {
      value = null;
    } else if (providedValue != null) {
      value = providedValue;
    } else {
      const target = event.target.type.toLowerCase();
      if (target === "button") value = event.target.textContent;
      else if (target === "checkbox") value = event.target.checked;
      else value = event.target.value;
    }

    setNewValue(value);
    setNewValueApplied(true);
    const configKey = `${configPrefix}${option}`;
    // ? stringify non null values to prevent API errors
    value = value === null ? value : value.toString();
    setConfig(configKey, value, rendering.displayName);
  };

  // Provide default info when nothing is selected
  let info =
    projectDefault != null ? null : (
      <FormText>
        Defaults to <b>{rendering.default.toString()}</b>
      </FormText>
    );

  // Add reset button
  const reset =
    devAccess && projectDefault != null ? (
      <SessionsOptionReset
        disabled={disabled}
        onChange={onChange}
        option={option}
      />
    ) : null;

  const labelLoader = newConfigOption?.updating ? (
    <Loader className="mx-2" size="14" inline="true" />
  ) : null;

  const labelDone = newConfigOption?.updated ? (
    <span className="mx-2">
      <SuccessLabel text="Updated." />
    </span>
  ) : null;

  // Render proper type
  if (rendering.type === "enum") {
    const warning =
      projectDefault &&
      !rendering.options.includes(projectDefault) &&
      option !== "default_url";
    if (warning) {
      info = (
        <FormText color="danger">
          <FontAwesomeIcon
            className="cursor-default"
            icon={faExclamationTriangle}
          />{" "}
          Unsupported value on RenkuLab.
          {devAccess ? " Consider changing it." : ""}
        </FormText>
      );
    } else if (rendering.options.length === 1) {
      info = <FormText>Cannot be changed on this server</FormText>;
    }

    const separator = rendering.options.length === 1 ? null : <br />;
    return (
      <FormGroup>
        <Label className="me-2">
          {rendering.displayName} {labelLoader}
          {labelDone}
        </Label>
        {separator}
        <ServerOptionEnum
          {...rendering}
          selected={newValueApplied ? newValue : projectDefault}
          onChange={onChange}
          warning={warning ? projectDefault : null}
          disabled={disabled}
          className="btn-outline-rk-green"
        />
        {reset}
        {info ? (
          <Fragment>
            <br />
            {info}
          </Fragment>
        ) : null}
      </FormGroup>
    );
  } else if (rendering.type === "boolean") {
    return (
      <FormGroup>
        <ServerOptionBoolean
          {...rendering}
          selected={newValueApplied ? newValue : projectDefault}
          onChange={onChange}
          disabled={disabled}
        />
        {reset}
        {labelLoader}
        {labelDone}
      </FormGroup>
    );
  } else if (rendering.type === "float" || rendering.type === "int") {
    const step = rendering.type === "float" ? 0.01 : 1;
    return (
      <FormGroup>
        <Label className="me-2">{`${rendering.displayName}: ${
          projectDefault || globalDefault
        }`}</Label>
        <br />
        <ServerOptionRange
          step={step}
          {...rendering}
          selected={newValueApplied ? newValue : projectDefault}
          disabled={disabled}
          onChange={onChange}
        />
        {reset}
      </FormGroup>
    );
  }
}

function SessionConfigAdvanced(props) {
  const { defaults, devAccess, disabled, options, repositoryUrl, setConfig } =
    props;
  const imageAvailable =
    options.length && options.includes("image") ? true : false;

  // Collapse unknown values by default when none are already assigned
  const [showImage, setShowImage] = useState(imageAvailable);
  const toggleShowImage = () => setShowImage(!showImage);

  const warningMessage = devAccess ? (
    <WarnAlert>
      Fixing an image can yield improvements, but it can also lead to sessions
      not working in the expected way.{" "}
      <ExternalLink
        role="text"
        title="Please consult the documentation"
        url={Docs.rtdTopicGuide("sessions/customizing-sessions.html")}
      />{" "}
      before changing this setting.
    </WarnAlert>
  ) : null;
  return (
    <div className="mb-2">
      <Collapse isOpen={showImage}>
        <h5>Advanced settings</h5>
        {warningMessage}
        <SessionPinnedImage
          devAccess={devAccess}
          disabled={disabled}
          repositoryUrl={repositoryUrl}
          setConfig={setConfig}
          value={imageAvailable ? defaults["image"] : null}
        />
      </Collapse>
      <Button
        color="link"
        className="font-italic btn-sm"
        onClick={toggleShowImage}
      >
        [{showImage ? "Hide " : "Show "} advanced settings]
      </Button>
    </div>
  );
}

function SessionPinnedImage(props) {
  const { devAccess, disabled, repositoryUrl, setConfig, value } = props;

  const [modifyString, setModifyString] = useState(false);
  const [newString, setNewString] = useState("");
  //const [modifyReference, setModifyReference] = useState(false);

  const toggleModifyString = () => {
    if (!modifyString) setNewString(value ? value : "");
    // setModifyReference(false);
    setModifyString(!modifyString);
  };

  // const toggleModifyReference = () => {
  //   setModifyString(false);
  //   setModifyReference(!modifyReference);
  // };

  const setValue = (value = null) => {
    if (value !== "")
      setConfig(
        `${NotebooksHelper.sessionConfigPrefix}image`,
        value,
        "Docker image"
      );
    // setConfig("image", value, "Docker image");
  };

  const imageTarget = value ? value : "none";

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
    image = (
      <Fragment>
        <InputGroup disabled={disabled} className="input-left">
          <Input
            value={newString}
            onChange={(e) => setNewString(e.target.value)}
          />
          <Button
            id="advanced_image_confirm"
            className="btn btn-rk-green m-0"
            onClick={() => setValue(newString)}
          >
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button
            id="advanced_image_back"
            className="btn btn-outline-rk-green m-0"
            onClick={toggleModifyString}
            style={{ borderLeft: 0 }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
          <UncontrolledTooltip placement="top" target="advanced_image_back">
            Discard changes
          </UncontrolledTooltip>
        </InputGroup>
      </Fragment>
    );
  }
  // TODO: implement selection through branch and commit
  // else if (modifyReference) {
  //   image = "Not implemented yet";
  // }
  else if (value) {
    const edit = devAccess ? (
      <Fragment>
        <Button
          id="advanced_image_edit"
          color="outline-primary"
          onClick={toggleModifyString}
        >
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_edit">
          Edit value
        </UncontrolledTooltip>
        <Button
          id="advanced_image_reset"
          color="primary"
          onClick={() => setValue()}
          style={{ borderLeft: 0 }}
        >
          <FontAwesomeIcon icon={faTimesCircle} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_reset">
          Reset value
        </UncontrolledTooltip>
      </Fragment>
    ) : null;
    image = (
      <InputGroup disabled={disabled}>
        <Input disabled={true} value={value} /> {edit}
      </InputGroup>
    );
  } else {
    const edit = devAccess ? (
      <Fragment>
        <Button
          disabled={disabled}
          id="advanced_image_add"
          color=""
          size="sm"
          className="border-0"
          onClick={toggleModifyString}
        >
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        <UncontrolledTooltip placement="top" target="advanced_image_add">
          Set image
        </UncontrolledTooltip>
      </Fragment>
    ) : null;

    image = (
      <Fragment>
        <code className="me-2">{imageTarget}</code>
        {edit}
      </Fragment>
    );
  }

  const imagesUrl = `${repositoryUrl}/container_registry`;
  const imagesLink = (
    <div>
      <FormText>
        A URL of a RenkuLab-compatible Docker image. For an image from this
        project, consult{" "}
        <ExternalLink
          role="link"
          title="the list of images for this project"
          url={imagesUrl}
        />
        .
      </FormText>
    </div>
  );

  return (
    <FormGroup>
      <Label className="me-2">Docker image:</Label>
      {image}
      {modify}
      {imagesLink}
    </FormGroup>
  );
}

export { ProjectSettingsGeneral, ProjectSettingsNav, ProjectSettingsSessions };
