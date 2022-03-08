/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  ProjectNew.present.js
 *  New project presentational components.
 */


import React, { Component, Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import {
  Alert, Button, ButtonGroup, Card, CardBody, CardText, CardFooter, Col, DropdownItem, Fade, Form,
  FormFeedback, FormGroup, FormText, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader,
  UncontrolledPopover, PopoverHeader, PopoverBody, Row, Table, UncontrolledTooltip
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle, faInfoCircle, faLink, faQuestionCircle, faSyncAlt, faUndo
} from "@fortawesome/free-solid-svg-icons";


import { simpleHash, slugFromTitle } from "../../utils/helpers/HelperFunctions";
import { capitalize } from "../../utils/components/formgenerator/FormGenerator.present";
import { Url } from "../../utils/helpers/url";

import "./Project.style.css";
import defaultTemplateIcon from "./templatePlaceholder.svg";
import { Loader } from "../../utils/components/Loader";
import { ErrorAlert, WarnAlert } from "../../utils/components/Alert";
import { ExternalLink } from "../../utils/components/ExternalLinks";
import { FieldGroup } from "../../utils/components/FieldGroups";
import { ButtonWithMenu } from "../../utils/components/Button";
import { Clipboard } from "../../utils/components/Clipboard";


/**
 * Generate refresh button
 *
 * @param {function} refresh - function to invoke
 * @param {string} tip - message to display in the tooltip
 * @param {boolean} disabled - whether it's disabled or not
 */
function makeRefreshButton(refresh, tip, disabled) {
  const id = refresh.name.replace(" ", "");

  return (
    <Fragment>
      <Button key="button" className="ms-1 p-0" color="link" size="sm"
        id={id} onClick={() => refresh()} disabled={disabled} >
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={id}>{tip}</UncontrolledTooltip>
    </Fragment>
  );
}

function ForkProject(props) {
  const { error, fork, forkedTitle, forking, forkUrl, namespaces, projects, toggleModal } = props;

  const fetching = {
    projects: projects.fetching,
    namespaces: namespaces.fetching
  };

  return (
    <Fragment>
      <ForkProjectHeader forkedTitle={forkedTitle} toggleModal={toggleModal} />
      <ForkProjectBody {...props} fetching={fetching} />
      <ForkProjectFooter
        error={error} fetching={fetching} fork={fork} forking={forking} forkUrl={forkUrl} toggleModal={toggleModal}
      />
    </Fragment>
  );
}

function ForkProjectHeader(props) {
  const { forkedTitle, toggleModal } = props;
  return (
    <ModalHeader toggle={toggleModal}>
      Fork project <span className="font-italic">{forkedTitle}</span>
    </ModalHeader>
  );
}

function ForkProjectBody(props) {
  const { fetching, forkError, forkVisibilityError, forking } = props;
  if (fetching.namespaces || fetching.projects) {
    const text = fetching.namespaces ?
      "namespaces" :
      "existing projects";
    return (
      <ModalBody>
        <p>Checking your {text}...</p>
        <Loader />
      </ModalBody>
    );
  }
  return (
    <ModalBody>
      <ForkProjectContent {...props} />
      <ForkProjectStatus forkVisibilityError={forkVisibilityError} forkError={forkError} forking={forking} />
    </ModalBody>
  );
}

function ForkProjectFooter(props) {
  const { error, fetching, fork, forking, forkUrl, toggleModal } = props;

  let forkButton;
  if (forking) {
    forkButton = null;
  }
  else {
    if (forkUrl)
      forkButton = (<Link className="btn btn-primary" to={forkUrl}>Go to forked project</Link>);
    else
      forkButton = (<Button color="primary" disabled={error ? true : false} onClick={fork}>Fork</Button>);
  }

  let closeButton = null;
  if (toggleModal)
    closeButton = <Button outline color="primary" onClick={toggleModal}>{forking ? "Close" : "Cancel"}</Button>;


  if (fetching.namespaces || fetching.projects)
    return null;
  return (
    <ModalFooter>
      {forkButton}
      {closeButton}
    </ModalFooter>
  );
}

function ForkProjectStatus(props) {
  if (props.forking) {
    return (
      <Fragment>
        <span>Forking the project... </span>{" "}<Loader inline={true} size={16} />
        <p className="mt-3">
          <FontAwesomeIcon icon={faInfoCircle} />{" "}
          This operation may take a while. You will be redirected automatically or
          receive a notification at the end.
        </p>
      </Fragment>
    );
  }
  else if (props.forkError) {
    return (<FormText key="help" color="danger">{props.forkError}</FormText>);
  }
  else if (props.forkVisibilityError) {
    return (
      <p>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        {" "} The project has been forked but an error occurred when setting the visibility
        {props.forkVisibilityError}
      </p>
    );
  }
  return null;
}

function ForkProjectContent(props) {
  const {
    fetching,
    error,
    forking,
    handlers,
    namespace,
    namespaces,
    title,
    user,
    visibility,
    visibilities,
    forkVisibilityError } = props;

  if (forking || forkVisibilityError)
    return null;

  const input = { namespace, title, titlePristine: false, visibility, visibilityPristine: false };
  const meta = {
    validation: { errors: { title: error } },
    namespace: {
      fetching: fetching.namespaces,
      visibilities,
    },
  };

  return (
    <Fragment>
      <Title handlers={handlers} input={input} meta={meta} />
      <Namespaces handlers={handlers} input={input} namespaces={namespaces} user={user} />
      <Home input={input} />
      <Visibility handlers={handlers} input={input} meta={meta}/>
    </Fragment>
  );
}

class NewProject extends Component {
  render() {
    const { automated, config, handlers, input, location, user } = this.props;
    if (!user.logged) {
      const to = Url.get(Url.pages.login.link, { pathname: location.pathname });
      return (
        <Fragment>
          <p>Only authenticated users can create new projects.</p>
          <Alert color="primary">
            <p className="mb-0">
              <Link className="btn btn-primary btn-sm" to={to}>Log in</Link> to
              create a new project.
            </p>
          </Alert>
        </Fragment>
      );
    }

    const userRepo = config.custom && input.userRepo;
    return (
      <Row>
        <Col sm={10} md={9} lg={8} xl={7}>
          <h1>New project</h1>
          <Form className="mb-3">
            <Automated automated={automated} removeAutomated={handlers.removeAutomated} />
            <Title {...this.props} />
            <Description {...this.props} />
            <Namespaces {...this.props} />
            <Home {...this.props} />
            <Visibility {...this.props} />
            <KnowledgeGraph {...this.props} />
            {config.custom ? <TemplateSource {...this.props} /> : null}
            {userRepo ? <UserTemplate {...this.props} /> : null}
            <Template {...this.props} />
            <Variables {...this.props} />
            <Creation {...this.props} />
            <Create {...this.props} />
          </Form>
        </Col>
      </Row>
    );
  }
}

function Automated(props) {
  const { automated, removeAutomated } = props;

  const [showError, setShowError] = useState(false);
  const toggleError = () => setShowError(!showError);

  const [showWarnings, setShowWarnings] = useState(false);
  const toggleWarn = () => setShowWarnings(!showWarnings);

  if (!automated.finished) {
    // Show a static modal while loading the data
    if (automated.received && automated.valid)
      return (<AutomatedModal removeAutomated={removeAutomated}></AutomatedModal>);
    return null;
  }
  // Show a feedback when the automated part has finished
  // errors
  if (automated.error) {
    const error = (<pre>{automated.error}</pre>);
    return (
      <ErrorAlert key="alert" >
        <p>
          We could not pre-fill the fields with the information provided in the RenkuLab project-creation link.
        </p>
        <p>
          It is possible that the link is outdated or not valid.
          Please contact the source of the RenkuLab link and ask for a new one.
        </p>

        <Button color="link" style={{ fontSize: "smaller" }} className="font-italic" onClick={() => toggleError()}>
          {showError ? "Hide error details" : "Show error details"}
        </Button>
        <Fade in={showError} tag="div">{showError ? error : null}</Fade>
      </ErrorAlert>
    );
  }
  // warnings
  else if (automated.warnings.length) {
    const warnings = (<pre>{automated.warnings.join("\n")}</pre>);
    return (
      <WarnAlert>
        <p>
          Some fields could not be pre-filled with the information provided in the RenkuLab project-creation link.
        </p>
        <Button color="link" style={{ fontSize: "smaller" }} className="font-italic" onClick={() => toggleWarn()}>
          {showWarnings ? "Hide warnings" : "Show warnings"}
        </Button>
        <Fade in={showWarnings} tag="div">{showWarnings ? warnings : null}</Fade>
      </WarnAlert>
    );
  }
  // all good
  return (
    <Alert color="primary">
      <p className="mb-0">
        <FontAwesomeIcon icon={faInfoCircle} />&nbsp;
        Some fields were pre-filled.
        <br />You can still change any values before you create the project.
      </p>
    </Alert>
  );
}


function AutomatedModal(props) {
  const { removeAutomated } = props;

  const [showFadeIn, setShowFadeIn] = useState(false);

  const toggle = () => setShowFadeIn(!showFadeIn);

  const button = showFadeIn ?
    null :
    (
      <Button color="link" style={{ fontSize: "smaller" }} className="font-italic" onClick={() => toggle()}>
        Taking too long?
      </Button>
    );

  const to = Url.get(Url.pages.project.new);
  const fadeInContent = (
    <p className="mt-3">
      If pre-filling the new project form is taking too long, you can
      <Link className="btn btn-primary btn-sm" to={to} onClick={() => { removeAutomated(); }}>
        use a blank form
      </Link>
    </p>
  );
  return (
    <Modal isOpen={true} centered={true} keyboard={false} backdrop="static">
      <ModalHeader>Fetching initialization data</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>You entered a url containing information to pre-fill.</p>
            <span>
              Please wait while we fetch the required metadata...&nbsp;
              <Loader inline={true} size={16} />
            </span>
            <div className="mt-2">
              {button}
              <Fade in={showFadeIn} tag="div">{showFadeIn ? fadeInContent : null}</Fade>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

class Title extends Component {
  render() {
    const { handlers, meta, input } = this.props;
    const error = meta.validation.errors["title"];
    const url = "https://docs.gitlab.com/ce/user/reserved_names.html#reserved-project-names";

    const help = (
      <span>
        <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> There are a
        few <ExternalLink url={url} title="reserved names" role="link" /> you cannot use.
      </span>
    );

    return (
      <FieldGroup id="title" type="text" label="Title" data-cy="project-title-input"
        value={input.title}
        placeholder="A brief name to identify the project" help={help}
        feedback={error} invalid={error && !input.titlePristine}
        onChange={(e) => handlers.setProperty("title", e.target.value)} />
    );
  }
}

function Description(props) {
  const { handlers, meta, input } = props;
  const error = meta.validation.errors["description"];

  return (
    <FieldGroup id="description" type="text" label="Description"
      value={input.description}
      placeholder="A short project description"
      feedback={error} invalid={error && !input.descriptionPristine}
      onChange={(e) => handlers.setProperty("description", e.target.value)} />
  );
}

class Namespaces extends Component {
  async componentDidMount() {
    // fetch namespaces if not available yet
    const { namespaces, handlers } = this.props;
    if (!namespaces.fetched && !namespaces.fetching)
      handlers.getNamespaces();
  }

  render() {
    const { namespaces, handlers } = this.props;
    const refreshButton = makeRefreshButton(handlers.getNamespaces, "Refresh namespaces", namespaces.fetching);

    // loading or autosuggest
    const main = namespaces.fetching ?
      (<Fragment>
        <br />
        <Label className="font-italic d-block">Refreshing... <Loader inline={true} size={16} /></Label>
      </Fragment>) :
      (<NamespacesAutosuggest {...this.props} />);
    const { list } = namespaces;

    // show info about visibility only when group namespaces are available
    const info = namespaces.fetched && list.length && list.filter(n => n.kind === "group").length ?
      (<FormText>
        <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> Group namespaces may
        restrict the visibility options.
      </FormText>) :
      null;

    return (
      <FormGroup>
        <Label>Namespace {refreshButton}</Label>
        {main}
        {info}
      </FormGroup>
    );
  }
}

class NamespacesAutosuggest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      suggestions: [],
      preloadUpdated: false
    };
  }

  componentDidMount() {
    // set first user namespace as default (at least one should always available)
    const { namespaces, namespace, user } = this.props;
    if (namespaces.fetched && namespaces.list.length && !namespace) {
      let defaultNamespace = null, personalNs = null;
      if (user.logged)
        personalNs = namespaces.list.find(ns => ns.kind === "user" && ns.full_path === user.username);
      if (personalNs)
        defaultNamespace = personalNs;
      else
        defaultNamespace = namespaces.list.find(ns => ns.kind === "user");

      this.props.handlers.setNamespace(defaultNamespace);
      this.setState({ value: defaultNamespace.full_path });
    }
  }

  // Fix the inconsistent state when automated content modifies the namespace
  componentDidUpdate() {
    const { automated, input } = this.props;
    const { value, preloadUpdated } = this.state;
    if (automated && automated.received && automated.finished && input.namespace !== value && !preloadUpdated)
      this.setState({ value: input.namespace, preloadUpdated: true });
  }

  getSuggestions(value) {
    const { namespaces } = this.props;
    const inputValue = value.trim().toLowerCase();

    // filter namespaces
    const filtered = inputValue.length === 0 ?
      namespaces.list :
      namespaces.list.filter(namespace => namespace.full_path.toLowerCase().indexOf(inputValue) >= 0);
    if (!filtered.length)
      return [];

    // separate different namespaces kind
    const suggestionsObject = filtered.reduce(
      (suggestions, namespace) => {
        namespace.kind === "group" ? suggestions.group.push(namespace) : suggestions.user.push(namespace);
        return suggestions;
      },
      { user: [], group: [] }
    );

    // filter 0 length groups
    return Object.keys(suggestionsObject).reduce(
      (suggestions, kind) => suggestionsObject[kind].length ?
        [...suggestions, { kind, namespaces: suggestionsObject[kind] }] :
        suggestions,
      []
    );
  }

  getSuggestionValue(suggestion) {
    return suggestion.full_path;
  }

  getSectionSuggestions(suggestion) {
    return suggestion.namespaces;
  }

  renderSuggestion = (suggestion) => {
    const className = suggestion.full_path === this.state.value ? "highlighted" : "";
    return (<span className={className}>{suggestion.full_path}</span>);
  }

  renderSectionTitle(suggestion) {
    return (<strong>{suggestion.kind}</strong>);
  }

  onBlur = (event, { newValue }) => {
    if (newValue)
      this.props.handlers.setNamespace(newValue);
    else if (this.props.input.namespace)
      this.setState({ value: this.props.input.namespace });
  }

  onChange = (event, { newValue, method }) => {
    if (method === "type")
      this.setState({ value: newValue });
  };

  onSuggestionsFetchRequested = ({ value, reason }) => {
    // show all namespaces on mouse click
    if (reason === "input-focused")
      value = "";
    this.setState({ suggestions: this.getSuggestions(value) });
  };

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  onSuggestionSelected = (event, { suggestionValue, method }) => {
    this.setState({ value: suggestionValue });
    const namespace = this.props.namespaces.list.filter(ns => ns.full_path === suggestionValue)[0];
    this.props.handlers.setNamespace(namespace);
  }

  getTheme() {
    const defaultTheme = {
      container: "react-autosuggest__container",
      containerOpen: "react-autosuggest__container--open",
      input: "react-autosuggest__input",
      inputOpen: "react-autosuggest__input--open",
      inputFocused: "react-autosuggest__input--focused",
      suggestionsContainer: "react-autosuggest__suggestions-container",
      suggestionsContainerOpen: "react-autosuggest__suggestions-container--open",
      suggestionsList: "react-autosuggest__suggestions-list",
      suggestion: "react-autosuggest__suggestion",
      suggestionFirst: "react-autosuggest__suggestion--first",
      suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
      sectionContainer: "react-autosuggest__section-container",
      sectionContainerFirst: "react-autosuggest__section-container--first",
      sectionTitle: "react-autosuggest__section-title"
    };
    // Override the input theme to match our visual style
    return { ...defaultTheme, ...{ input: "form-control" } };
  }

  render() {
    const { value, suggestions } = this.state;
    const theme = this.getTheme();

    const inputProps = {
      placeholder: "Select a namespace...",
      value,
      onChange: this.onChange,
      onBlur: this.onBlur
    };

    return (
      <Autosuggest
        id="namespace"
        multiSection={true}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        getSuggestionValue={this.getSuggestionValue}
        getSectionSuggestions={this.getSectionSuggestions}
        renderSuggestion={this.renderSuggestion}
        renderSectionTitle={this.renderSectionTitle}
        shouldRenderSuggestions={(v) => true}
        inputProps={inputProps}
        theme={theme}
      />
    );
  }
}

class Home extends Component {
  render() {
    const { input } = this.props;
    const namespace = input.namespace ?
      input.namespace :
      "<no namespace>";
    const title = input.title ?
      slugFromTitle(input.title, true) :
      "<no title>";
    const slug = `${namespace}/${title}`;

    return (
      <FormGroup>
        <Label>Identifier</Label>
        <Input id="slug" readOnly value={slug} />
        <FormText>
          <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> This is automatically derived from
          Namespace and Title.
        </FormText>
      </FormGroup>
    );
  }
}

class Visibility extends Component {
  render() {
    const { handlers, meta, input } = this.props;
    const error = meta.validation.errors["visibility"];
    let main;
    if (!input.namespace) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Please select a namespace first.</Label>
        </Fragment>
      );
    }
    else if (meta.namespace.fetching || !meta.namespace.visibilities || !input.visibility) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Determining options... <Loader inline={true} size={16} /></Label>
        </Fragment>
      );
    }
    else {
      const options = meta.namespace.visibilities.map(v => <option key={v} value={v}>{capitalize(v)}</option>);
      main = (
        <Input id="visibility" type="select" placeholder="Choose visibility..." className="custom-select"
          value={input.visibility} feedback={error} invalid={error && !input.visibilityPristine}
          onChange={(e) => handlers.setProperty("visibility", e.target.value)} data-cy="visibility-select" >
          <option key="" value="" disabled>Choose visibility...</option>
          {options}
        </Input>
      );
    }

    return (
      <FormGroup>
        <Label>Visibility</Label>
        {main}
      </FormGroup>
    );
  }
}

class KnowledgeGraph extends Component {
  render() {
    const { handlers, input, meta } = this.props;

    if (input.visibility !== "private" || meta.namespace.fetching)
      return null;

    const kgLink = (
      <a href="https://renku.readthedocs.io/en/latest/topic-guides/knowledge-graph.html"
        target="_blank" rel="noopener noreferrer">
        Knowledge Graph
      </a>
    );
    return (
      <FormGroup>
        <Label check>
          <Input id="knowledgeGraph" type="checkbox" className="me-2"
            checked={!this.props.input.knowledgeGraph}
            onChange={(e) => handlers.setProperty("knowledgeGraph", !e.target.checked)} />
          Opt-out from Knowledge Graph
        </Label>
        <FormText className="d-block">
          <FontAwesomeIcon className="no-pointer" icon={faInfoCircle} /> The {kgLink} may make some metadata
          public, opt-out if this is not acceptable.
        </FormText>
      </FormGroup>
    );
  }
}

class TemplateSource extends Component {
  render() {
    const { handlers, input } = this.props;
    return (
      <FormGroup>
        <Label>Template source</Label>
        <br />
        <ButtonGroup size="sm">
          <Button color="primary" outline active={!input.userRepo}
            onClick={(e) => handlers.setProperty("userRepo", false)}>
            RenkuLab
          </Button>
          <Button color="primary" outline active={input.userRepo}
            onClick={(e) => handlers.setProperty("userRepo", true)}>
            Custom
          </Button>
        </ButtonGroup>
      </FormGroup>
    );
  }
}

class UserTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      missingUrl: false,
      missingRef: false
    };
  }

  fetchTemplates() {
    const { meta } = this.props;

    // check if url or ref are missing
    const { missingUrl, missingRef } = this.state;
    let newState = {
      missingUrl: false,
      missingRef: false
    };
    if (!meta.userTemplates.url)
      newState.missingUrl = true;
    if (!meta.userTemplates.ref)
      newState.missingRef = true;
    if (missingUrl !== newState.missingUrl || missingRef !== newState.missingRef)
      this.setState(newState);

    // try to get user templates if repository data are available
    if (newState.missingUrl || newState.missingRef)
      return;
    return this.props.handlers.getUserTemplates();
  }

  render() {
    const { meta, handlers, config } = this.props;

    // placeholders and links
    let urlExample = "https://github.com/SwissDataScienceCenter/renku-project-template";
    if (config.repositories && config.repositories.length)
      urlExample = config.repositories[0].url;
    let refExample = "0.1.11";
    if (config.repositories && config.repositories.length)
      refExample = config.repositories[0].ref;
    const templatesDocs = (
      <a href="https://renku.readthedocs.io/en/latest/reference/templates.html"
        target="_blank" rel="noopener noreferrer">
        Renku templates
      </a>
    );

    return (
      <Fragment>
        <FormGroup>
          <Label>Repository URL</Label>
          <Input type="text" placeholder={`E.G. ${urlExample}`} value={meta.userTemplates.url}
            onChange={(e) => handlers.setTemplateProperty("url", e.target.value)}
            invalid={this.state.missingUrl} />
          <FormFeedback>Provide a template repository URL.</FormFeedback>
          <FormText>
            <FontAwesomeIcon icon={faInfoCircle} /> A valid {templatesDocs} repository.
          </FormText>
        </FormGroup>
        <FormGroup>
          <Label>Repository Reference</Label>
          <Input type="text" placeholder={`E.G. ${refExample}`} value={meta.userTemplates.ref}
            onChange={(e) => handlers.setTemplateProperty("ref", e.target.value)}
            invalid={this.state.missingRef} />
          <FormFeedback>Provide a template repository reference.</FormFeedback>
          <FormText>
            <FontAwesomeIcon icon={faInfoCircle} /> Preferably a tag or a commit. A branch is also valid,
            but it is not a static reference.
          </FormText>
        </FormGroup>
        <FormGroup>
          <Button id="fetch-custom-templates" color="primary" size="sm"
            onClick={() => this.fetchTemplates()}>
            Fetch templates
          </Button>
        </FormGroup>
      </Fragment>
    );
  }
}

class Template extends Component {
  async componentDidMount() {
    // fetch templates if not available yet
    const { templates, handlers } = this.props;
    if (!templates.fetched && !templates.fetching) {
      let templates = await handlers.getTemplates();
      if (templates && templates.length === 1)
        handlers.setProperty("template", templates[0].id);
    }
  }

  render() {
    const { config, handlers, input, templates, meta } = this.props;
    const error = meta.validation.errors["template"];
    const invalid = error && !input.templatePristine ? true : false;
    let main = null;
    if ((!input.userRepo && templates.fetching) || (input.userRepo && meta.userTemplates.fetching)) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Fetching... <Loader inline={true} size={16} /></Label>
        </Fragment>
      );
    }
    else if (input.userRepo && !meta.userTemplates.fetched) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Fetch templates first, or switch source to RenkuLab.</Label>
        </Fragment>
      );
    }
    else {
      // Pass down templates and repository with the same format to the gallery component
      let listedTemplates, repositories;
      if (input.userRepo) {
        listedTemplates = meta.userTemplates.all;
        repositories = [{ url: meta.userTemplates.url, ref: meta.userTemplates.ref, name: "Custom" }];
      }
      else {
        listedTemplates = templates.all;
        repositories = config.repositories;
      }

      const select = (template) => handlers.setProperty("template", template);
      main = (
        <TemplateGallery
          // error={error && invalid} // ? we may consider adding a more prominent underlining for errors
          repositories={repositories}
          select={select}
          selected={input.template}
          templates={listedTemplates}
        />
      );
    }

    return (
      <FormGroup>
        <Label>Template</Label>
        {error && invalid && <div className="text-danger small">{error}</div>}
        {main}
      </FormGroup>
    );
  }
}

function TemplateGallery(props) {
  const { repositories, select, selected, templates } = props;

  // One GalleryRow for each source
  const gallery = repositories.map((repository) => {
    const repoTitle = repository.name;
    const repoTemplates = templates.filter(t => t.parentRepo === repoTitle);
    const repoKey = simpleHash(repository.url + repository.ref);
    return (
      <TemplateGalleryRow
        key={repoKey}
        repository={repository}
        select={select}
        selected={selected}
        templates={repoTemplates}
      />
    );
  });

  return (<div>{gallery}</div>);
}

// Show a link when we have a valid url. Otherwise, just simple text
function TemplateRepositoryLink(props) {
  const { url } = props;
  let repoUrl = url && url.length && url.startsWith("http") ?
    url :
    "";
  if (repoUrl.endsWith(".git"))
    repoUrl = repoUrl.substring(repoUrl.length - 4);
  const repoLink = repoUrl ?
    (<ExternalLink url={repoUrl} title={url} role="link" />) :
    url;
  return repoLink;
}

function TemplateGalleryRow(props) {
  const { repository, select, selected, templates } = props;

  // Don't render anything if there are no templates for the repository
  if (!templates || !templates.length)
    return null;

  // Show a card for each template
  const elements = templates.map(t => {
    const imgSrc = t.icon ?
      `data:image/png;base64,${t.icon}` :
      defaultTemplateIcon;
    const id = "id" + simpleHash(repository.name) + simpleHash(t.id);
    const selectedClass = selected === t.id ?
      "selected" :
      "";

    return (
      <Col key={t.id}>
        <Card id={id} className={`template-card mb-2 text-center ${selectedClass}`}
          onClick={() => { select(t.id); }} data-cy="project-template-card">
          <CardBody className="p-1">
            <img src={imgSrc} alt={t.id + " template image"} />
          </CardBody>
          <CardFooter className="p-1">
            <CardText className="small">{t.name}</CardText>
          </CardFooter>
        </Card>
        <UncontrolledTooltip key="tooltip" placement="bottom" target={id}>
          {t.description}
        </UncontrolledTooltip>
      </Col>
    );
  });

  // Add a title with information about the source repository
  const repositoryInfoId = `info-${repository.name}`;
  const title = (
    <Row>
      <p className="fst-italic mt-2 mb-1">
        Source: {repository.name}
        <FontAwesomeIcon id={repositoryInfoId} className="ms-2" icon={faQuestionCircle} />
      </p>
      <UncontrolledPopover target={repositoryInfoId} trigger="legacy" placement="bottom">
        <PopoverHeader>{repository.name} templates</PopoverHeader>
        <PopoverBody>
          <p className="mb-1">
            <span className="fw-bold">Repository</span>:&nbsp;
            <TemplateRepositoryLink url={repository.url} />
          </p>
          <p className="mb-0">
            <span className="fw-bold">Reference</span>: {repository.ref}
          </p>
        </PopoverBody>
      </UncontrolledPopover>
    </Row>
  );

  return (
    <div>
      {title}
      <Row className="row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">{elements}</Row>
    </div>
  );
}

/**
 * Create a "restore default" button.
 *
 * @param {function} restore - function to invoke
 * @param {string} tip - message to display in the tooltip
 * @param {boolean} disabled - whether it's disabled or not
 */
function RestoreButton(props) {
  const { restore, name, disabled } = props;

  const id = `restore_${name}`;
  const tip = disabled ?
    "Default value already selected" :
    "Restore default value";

  return (
    <div id={id} className="d-inline ms-2">
      <Button key="button" className="p-0" color="link" size="sm"
        onClick={() => restore()} disabled={disabled} >
        <FontAwesomeIcon icon={faUndo} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={id}>{tip}</UncontrolledTooltip>
    </div>
  );
}

class Variables extends Component {
  render() {
    const { input, handlers } = this.props;
    if (!input.template)
      return null;

    const templates = input.userRepo ?
      this.props.meta.userTemplates :
      this.props.templates;

    const template = templates.all.filter(t => t.id === input.template)[0];
    if (!template || !template.variables || !Object.keys(template.variables).length)
      return null;
    const variables = Object.keys(template.variables).map(variable => {
      const data = template.variables[variable];

      // fallback to avoid breaking old variable structure
      if (typeof data !== "object") {
        return (
          <FormGroup key={variable}>
            <Label>{capitalize(variable)}</Label>
            <Input id={"parameter-" + variable} type="text" value={input.variables[variable]}
              onChange={(e) => handlers.setVariable(variable, e.target.value)} />
            <FormText>{capitalize(template.variables[variable])}</FormText>
          </FormGroup>
        );
      }

      // expected `data` properties: default_value, description, enum, type.
      // changing enum to enumValues to avoid using js reserved word
      return (
        <Variable
          enumValues={data["enum"]}
          handlers={handlers}
          key={variable}
          input={input}
          name={variable}
          {...data}
        />
      );
    });

    return variables;
  }
}

function Variable(props) {
  const { default_value, description, enumValues, handlers, input, name, type } = props;
  const id = `parameter-${name}`;

  const descriptionOutput = description ?
    (<FormText>{capitalize(description)}</FormText>) :
    null;

  const defaultOutput = default_value != null ?
    `Default: ${default_value}` :
    null;

  const restoreButton = default_value != null ?
    (
      <RestoreButton
        disabled={input.variables[name] === default_value}
        name={name}
        restore={() => handlers.setVariable(name, default_value)}
      />
    ) :
    null;

  let inputElement = null;
  if (type === "boolean") {
    inputElement = (
      <FormGroup className="form-check form-switch d-inline-block">
        <Input type="switch" id={id} label={name}
          checked={input.variables[name]}
          onChange={(e) => handlers.setVariable(name, e.target.checked)}
          className="form-check-input rounded-pill" />
        <Label check htmlFor={"parameter-" + name}>{name}</Label>
        {restoreButton}
      </FormGroup>
    );
    // inputElement = null;
  }
  else if (type === "enum") {
    const enumObjects = enumValues.map(enumObject => {
      const enumId = `enum-${id}-${enumObject.toString()}`;
      return (
        <option key={enumId} value={enumObject}>{enumObject}</option>
      );
    });
    inputElement = (
      <FormGroup>
        <Label>{name}</Label>{restoreButton}
        <Input id={id} type="select" value={input.variables[name]}
          onChange={(e) => handlers.setVariable(name, e.target.value)}>
          {enumObjects}
        </Input>
        {descriptionOutput}
      </FormGroup>
    );
  }
  else {
    const inputType = type === "number" ?
      "number" :
      "text";
    inputElement = (
      <FormGroup>
        <Label>{name}</Label>{restoreButton}
        <Input id={id} type={inputType} value={input.variables[name]}
          onChange={(e) => handlers.setVariable(name, e.target.value)}
          placeholder={defaultOutput} />
        {descriptionOutput}
      </FormGroup>
    );
  }

  return inputElement;
}

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };

    this.toggle = this.toggleModal.bind(this);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  render() {
    let { templates, meta, input } = this.props;
    if (input.userRepo)
      templates = meta.userTemplates;

    // do not show while posting
    if (meta.creation.creating || meta.creation.projectUpdating || meta.creation.kgUpdating)
      return null;
    // do not show if posted successfully with visibility or KG warning
    if (meta.creation.created && (meta.creation.projectError || meta.creation.kgError))
      return null;

    // check template errors and provide adequate feedback
    let alert = null;
    const error = templates.errors && templates.errors.length ?
      templates.errors[0] :
      null;
    if (error) {
      let content;
      if (typeof error == "string") {
        content = <pre className="text-wrap">{error}</pre>;
      }
      else {
        const errors = Object.keys(error).map(v => {
          const text = typeof error[v] == "string" ?
            `${v}: ${error[v]}` :
            `Error message: ${JSON.stringify(error[v])}`;
          return (<pre key={v} className="text-wrap">{text}</pre>);
        });
        if (errors.length === 1)
          content = (errors[0]);
        else
          content = error[0];
      }
      const fatal = templates.all && templates.all.length ? false : true;
      const suggestion = input.userRepo ?
        (<span>
          Double check the Repository URL and Reference, then try to fetch again.
          If the error persists, you may want to use a RenkuLab template instead.
        </span>) :
        (<span>
          You can try refreshing the page. If the error persists, you should contact the development team on&nbsp;
          <a href="https://gitter.im/SwissDataScienceCenter/renku"
            target="_blank" rel="noreferrer noopener">Gitter</a> or&nbsp;
          <a href="https://github.com/SwissDataScienceCenter/renku"
            target="_blank" rel="noreferrer noopener">GitHub</a>.
        </span>);
      alert = fatal ? (
        <ErrorAlert>
          <p>Unable to fetch templates.</p>
          {content}
          <small>
            {suggestion}
          </small>
        </ErrorAlert>
      ) : (
        <WarnAlert>
          <p>Errors happened while fetching templates. Some of them may be unavailable.</p>
          {content}
          <small>
            {suggestion}
          </small>
        </WarnAlert>
      );
      if (fatal)
        return alert;
    }

    // provide a minimal feedback under the button if any loading operation is ongoing
    const warnings = Object.keys(meta.validation.warnings);
    const loading = warnings.length ?
      meta.validation.warnings[`${warnings[0]}`] :
      null;

    // create dropdown items
    const disabled = loading ?
      true :
      false;
    const createProject = (
      <Button
        id="create-new-project"
        color="primary"
        data-cy="create-project-button"
        onClick={this.props.handlers.onSubmit}
        disabled={disabled}
      >
        Create project
      </Button>
    );
    const createLink = (
      <DropdownItem onClick={this.toggle}><FontAwesomeIcon icon={faLink} /> Create link</DropdownItem>
    );
    const templateDetails = input.template ?
      "based on " + (templates.all.find(t => t.id === input.template).name) :
      "";

    const errorFields = meta.validation.errors ?
      Object.keys(meta.validation.errors)
        .filter(field => !input[`${field}Pristine`]) // don't consider pristine fields
        .map(field => capitalize(field)) :
      [];
    const plural = errorFields.length > 1 ?
      "s" :
      "";
    const errorMessage = errorFields.length ?
      (
        <FormText className="d-block">
          <span className="text-danger">
            To create a new project, please first fix problems with the following field{plural}:{" "}
            <span className="fw-bold">{errorFields.join(", ")}</span>
          </span>
        </FormText>
      ) :
      null;

    return (
      <Fragment>
        {alert}
        <ButtonWithMenu color="primary" default={createProject} disabled={disabled} direction="up">
          {createLink}
        </ButtonWithMenu>
        {templateDetails && (<FormText className="ms-2" color="primary">{templateDetails}</FormText>)}
        {loading && (<FormText className="d-block" color="primary">{loading}</FormText>)}
        <ShareLinkModal
          show={this.state.showModal}
          toggle={this.toggle}
          input={input}
          meta={meta}
          createUrl={this.props.handlers.createEncodedUrl}
        />
        {errorMessage}
      </Fragment>
    );
  }
}


function ShareLinkModal(props) {
  const { createUrl, input } = props;
  const { userTemplates } = props.meta;

  const defaultObj = {
    title: false,
    description: false,
    namespace: false,
    visibility: false,
    templateRepo: false,
    template: false,
    variables: false
  };

  const [available, setAvailable] = useState(defaultObj);
  const [include, setInclude] = useState(defaultObj);
  const [url, setUrl] = useState("");

  // Set availability of inputs
  useEffect(() => {
    let variablesAvailable = false;
    if (input.template && input.variables && Object.keys(input.variables).length) {
      for (let variable of Object.keys(input.variables)) {
        if (input.variables[variable]) {
          variablesAvailable = true;
          break;
        }
      }
    }

    setAvailable({
      title: input.title ? true : false,
      description: input.description ? true : false,
      namespace: true,
      visibility: true,
      templateRepo: input.userRepo && userTemplates.fetched && userTemplates.url && userTemplates.ref ? true : false,
      template: input.template ? true : false,
      variables: variablesAvailable
    });
  }, [input, userTemplates]);

  // Update selected params
  useEffect(() => {
    setInclude({
      title: available.title,
      description: available.description,
      namespace: false,
      visibility: false,
      templateRepo: available.templateRepo,
      template: available.template,
      variables: available.variables
    });
  }, [available]);

  // Re-create shareable link
  useEffect(() => {
    let dataObject = {};
    if (include.title)
      dataObject.title = input.title;
    if (include.description)
      dataObject.description = input.description;
    if (include.namespace)
      dataObject.namespace = input.namespace;
    if (include.visibility)
      dataObject.visibility = input.visibility;
    if (include.templateRepo) {
      dataObject.url = userTemplates.url;
      dataObject.ref = userTemplates.ref;
    }
    if (include.template)
      dataObject.template = input.template;
    if (include.variables) {
      let variablesObject = {};
      for (let variable of Object.keys(input.variables)) {
        if (input.variables[variable] != null)
          variablesObject[variable] = input.variables[variable];
      }
      dataObject.variables = variablesObject;
    }

    setUrl(createUrl(dataObject));
  }, [createUrl, include, input, userTemplates]);

  const handleCheckbox = (target, event) => {
    setInclude({ ...include, [target]: event.target.checked });
  };

  const labels = Object.keys(include).map(item => (
    <FormGroup key={item} check>
      <Label check className={`text-capitalize${available[item] ? "" : " text-muted"}`}>
        <Input
          type="checkbox"
          disabled={available[item] ? false : true}
          checked={include[item]}
          onChange={e => handleCheckbox(item, e)}
        /> {item === "templateRepo" ? "template source" : item}
      </Label>
    </FormGroup>
  ));

  const feedback = include.namespace ?
    (
      <FormText color="danger">
        Pre-filling the namespace may lead to errors since other users are not guaranteed to have access to it.
      </FormText>
    ) :
    null;

  return (
    <Modal isOpen={props.show} toggle={props.toggle}>
      <ModalHeader toggle={props.toggle}>Create shareable link</ModalHeader>
      <ModalBody>
        <Row>
          <Col>
            <p>
              Here is your shareable link, containing the current values for a new project.
              Following the link will lead to a <b>New project</b> form with these values pre-filled.
            </p>
            <p>
              You can control which values should be pre-filled.
            </p>

            <Form className="mb-3">
              {labels}
              {feedback}
            </Form>


            <Table size="sm">
              <tbody>
                <tr className="border-bottom">
                  <th scope="row">URL</th>
                  <td style={{ wordBreak: "break-all" }}>{url}</td>
                  <td style={{ width: 1 }}><Clipboard clipboardText={url} /></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}

class Creation extends Component {
  render() {
    const { handlers } = this.props;
    const { creation } = this.props.meta;
    if (!creation.creating && !creation.createError && !creation.projectUpdating &&
      !creation.projectError && !creation.kgUpdating && !creation.kgError && !creation.newName)
      return null;

    let color = "primary";
    let message = "";
    const loader = (<Loader inline={true} size={16} />);
    if (creation.creating) {
      message = (<span>Initializing project... {loader}</span>);
    }
    else if (creation.createError) {
      color = "danger";
      let errors;
      if (typeof creation.createError === "string") {
        errors = <p>{creation.createError}</p>;
      }
      else {
        errors = Object.keys(creation.createError).map(error =>
          (<p key={error}>{`${error}: ${creation.createError[error]}`}</p>)
        );
      }
      message = (<div>
        <p>Errors occurred while creating the project.</p>
        {errors}
      </div>);
    }
    else if (creation.projectUpdating) {
      message = (<span>Updating project metadata... {loader}</span>);
    }
    else if (creation.projectError) {
      color = "warning";
      message = (<div>
        <p>
          An error occurred while updating project metadata (name or visibility). Please, adjust it on GitLab if needed.
        </p>
        <p>Error details: {creation.projectError}</p>
        <Button color="primary" onClick={(e) => { handlers.goToProject(); }}>Go to the project</Button>
      </div>);
    }
    else if (creation.kgUpdating) {
      message = (<span>Activating the knowledge graph... {loader}</span>);
    }
    else if (creation.kgError) {
      color = "warning";
      message = (<div>
        <p>
          An error occurred while activating the knowledge graph. You can activate it later to get the lineage.
        </p>
        <p>Error details: {creation.kgError}</p>
        <Button color="primary" onClick={(e) => { handlers.goToProject(); }}>Go to the project</Button>
      </div>);
    }
    else {
      return null;
    }

    if (color === "warning") {
      return (
        <WarnAlert>{message}</WarnAlert>
      );
    }

    if (color === "danger") {
      return (
        <ErrorAlert>{message}</ErrorAlert>
      );
    }

    return (
      <Alert color={color}>{message}</Alert>
    );
  }
}


export { NewProject, ForkProject };
