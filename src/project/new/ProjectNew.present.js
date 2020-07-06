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


import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import {
  Row, Col, ButtonGroup, UncontrolledTooltip, Input, Button, Form, FormFeedback, FormGroup, FormText, Label, Alert
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

import { FieldGroup, Loader, ExternalLink } from "../../utils/UIComponents";
import { slugFromTitle } from "../../utils/HelperFunctions";
import { capitalize } from "../../utils/formgenerator/FormPanel";
import "./Project.style.css";


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
      <Button key="button" className="ml-2 p-0" color="link" size="sm"
        id={id} onClick={() => refresh()} disabled={disabled} >
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={id}>{tip}</UncontrolledTooltip>
    </Fragment>
  );
}

class NewProject extends Component {
  render() {
    // TODO: Support user provided repositories
    const { user } = this.props;
    if (!user.logged) {
      const postLoginUrl = this.props.location ? this.props.location.pathname : null;
      const to = { "pathname": "/login", "state": { previous: postLoginUrl } };
      return (
        <Fragment>
          <p>Only authenticated users can create new projects.</p>
          <Alert color="primary">
            <p className="mb-0">
              <Link className="btn btn-primary btn-sm" to={to} previous={postLoginUrl}>Log in</Link> to
              create a new project.
            </p>
          </Alert>
        </Fragment>
      );
    }

    let supportUserProvidedRepositories = false, userProvidedRepo = false;
    if (supportUserProvidedRepositories) userProvidedRepo = this.props.input.userRepo;
    return (
      <Row>
        <Col sm={10} md={9} lg={8} xl={7}>
          <h1>New project</h1>
          <Form className="mb-3">
            <Title {...this.props} />
            <Namespaces {...this.props} />
            <Home {...this.props} />
            <Visibility {...this.props} />
            <KnowledgeGraph {...this.props} />
            {supportUserProvidedRepositories ? <TemplateSource {...this.props} /> : null}
            {userProvidedRepo ?
              (<UserTemplate {...this.props} />) :
              (<Template {...this.props} />)
            }
            <Variables {...this.props} />
            {/* <Create canCreate={canCreate} {...this.props} /> */}
            <Creation {...this.props} />
            <Create {...this.props} />
          </Form>
        </Col>
      </Row>
    );
  }
}

class Title extends Component {
  render() {
    const { handlers } = this.props;
    const validationDict = this.props.meta.validation.client.errorDict;
    const url = "https://docs.gitlab.com/ce/user/reserved_names.html#reserved-project-names";

    const help = (
      <span>
        <FontAwesomeIcon icon={faInfoCircle} /> There are a
        few <ExternalLink url={url} title="reserverd names" role="link" /> you cannot use.
      </span>
    );

    return (
      <FieldGroup id="title" type="text" label="Title"
        placeholder="A brief name to identify the project" help={help}
        feedback={validationDict.title} invalid={validationDict.title != null}
        onChange={(e) => handlers.setProperty("title", e.target.value)} />
    );
  }
}

class Namespaces extends Component {
  async componentDidMount() {
    // fetch namespaces if not available yet
    const { namespace, namespaces, handlers } = this.props;
    if (!namespaces.fetched && !namespaces.fetching) {
      const namespaces = await handlers.getNamespaces();
      if (namespace == null) {
        const nsUserSorted = namespaces.sort((a, b) => (a.kind === "user") ? -1 : 1);
        this.props.handlers.setNamespace(nsUserSorted[0]);
      }
    }
  }

  render() {
    const { namespaces, handlers } = this.props;
    const refreshButton = makeRefreshButton(handlers.getNamespaces, "Refresh namespaces", namespaces.fetching);

    // loading or autosuggest
    const main = namespaces.fetching ?
      (<Fragment>
        <br />
        <Label className="font-italic">Refreshing... <Loader inline={true} size={16} /></Label>
      </Fragment>) :
      (<NamespacesAutosuggest {...this.props} />);
    const { list } = namespaces;

    // show info about visibility only when group namespaces are available
    const info = namespaces.fetched && list.length && list.filter(n => n.kind === "group").length ?
      (<FormText>
        <FontAwesomeIcon icon={faInfoCircle} /> Group namespaces may restrict the visibility options.
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
      suggestions: []
    };
  }

  componentDidUpdate() {
    // adjust state if a namespace has been pre-selected (e.g. only 1 namespace)
    if (this.props.input.namespace && this.state.value !== this.props.input.namespace)
      this.setState({ value: this.props.input.namespace });
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
    this.setState({ value: newValue });
    if (method === "enter" || method === "click") {
      const namespace = this.props.namespaces.list.filter(ns => ns.full_path === newValue)[0];
      this.props.handlers.setNamespace(namespace);
    }
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
        multiSection={true}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
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
        <Input readOnly value={slug} />
        <FormText>
          <FontAwesomeIcon icon={faInfoCircle} /> This is automatically derived from Namespace and Title.
        </FormText>
      </FormGroup>
    );
  }
}

class Visibility extends Component {
  render() {
    const { handlers, meta, input } = this.props;
    let main;
    if (!input.namespace) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Please select a namespace first.</Label>
        </Fragment>
      );
    }
    else if (meta.namespace.fetching) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Verifying... <Loader inline={true} size={16} /></Label>
        </Fragment>
      );
    }
    else {
      const options = meta.namespace.visibilities.map(v => <option key={v} value={v}>{capitalize(v)}</option>);
      main = (
        <Input type="select" placeholder="Choose visibility..."
          value={input.visibility}
          onChange={(e) => handlers.setProperty("visibility", e.target.value)} >
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
      <a href="https://renku.readthedocs.io/en/latest/user/knowledge-graph.html"
        target="_blank" rel="noopener noreferrer">
        Knowledge Graph
      </a>
    );
    return (
      <FormGroup>
        <Label check style={{ marginLeft: "1.25rem" }}>
          <Input type="checkbox" id="myCheckbox"
            checked={!this.props.input.knowledgeGraph}
            onChange={(e) => handlers.setProperty("knowledgeGraph", !e.target.checked)} />
          Opt-out from Knowledge Graph
        </Label>
        <FormText>
          <FontAwesomeIcon icon={faInfoCircle} /> The {kgLink} may make some metadata public,
          opt-out if this is not acceptable.
        </FormText>
      </FormGroup>
    );
  }
}

class TemplateSource extends Component {
  render() {
    const { handlers, config, input } = this.props;
    if (!config.custom)
      return null;
    return (
      <FormGroup>
        <Label>Template source</Label>
        <br />
        <ButtonGroup size="sm">
          <Button color="primary" outline active={!input.userRepo}
            onClick={(e) => handlers.setProperty("userRepo", false)}>
            Renkulab
          </Button>
          <Button color="primary" outline active={input.userRepo}
            onClick={(e) => handlers.setProperty("userRepo", true)}>
            Enter manually
          </Button>
        </ButtonGroup>
      </FormGroup>
    );
  }
}

class UserTemplate extends Component {
  render() {
    // TODO: Stub for supporting custom user template. Finish the component
    return <Fragment>
      <FormGroup>
        <FormText>Not working yet... Use the RenkuLab templates</FormText>
      </FormGroup>
    </Fragment>;
    //   const { templates, handlers, config } = this.props;

    //   let urlExample = "https://github.com/SwissDataScienceCenter/renku-project-template";
    //   if (config.repositories && config.repositories.length)
    //     urlExample = config.repositories[0].url;
    //   let refExample = "0.1.11";
    //   if (config.repositories && config.repositories.length)
    //     refExample = config.repositories[0].ref;
    //   const templatesDocs = (
    //     <a href="https://renku.readthedocs.io/en/latest/user/templates.html"
    //       target="_blank" rel="noopener noreferrer">
    //       Renku templates
    //     </a>
    //   );

    //   return (
    //     <Fragment>
    //       <FormGroup>
    //         <Label>Repository URL</Label>
    //         <Input type="text" placeholder={`E.G. ${urlExample}`}
    //           onChange={(e) => handlers.setProperty("title", e.target.value)} />
    //         <FormText>
    //           <FontAwesomeIcon icon={faInfoCircle} /> A valid {templatesDocs} repository.
    //         </FormText>
    //       </FormGroup>
    //       <FormGroup>
    //         <Label>Repository Reference</Label>
    //         <Input type="text" placeholder={`E.G. ${urlExample}`}
    //           onChange={(e) => handlers.setProperty("title", e.target.value)} />
    //         <FormText>
    //           <FontAwesomeIcon icon={faInfoCircle} /> Preferably a tag or a commit. A branch is also valid,
    //           but it is not a static reference.
    //         </FormText>
    //       </FormGroup>
    //       <FormGroup>
    //         <FormText>Not working yet... Use the RenkuLab templates</FormText>
    //       </FormGroup>
    //     </Fragment>
    //   );
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
    const { handlers, input, templates } = this.props;
    const validationDict = this.props.meta.validation.client.errorDict;
    const feedback = validationDict.template, invalid = validationDict.template != null;
    let main, help = null;
    if (templates.fetching) {
      main = (
        <Fragment>
          <br />
          <Label className="font-italic">Fetching... <Loader inline={true} size={16} /></Label>
        </Fragment>
      );
    }
    else {
      const options = templates.all.map(t => (
        <option key={t.id} value={t.id}>{`${t.parentRepo} / ${t.name}`}</option>)
      );
      main = (
        <Input type="select" placeholder="Select template..."
          value={input.template} invalid={invalid}
          onChange={(e) => handlers.setProperty("template", e.target.value)} >
          <option key="" value="" disabled>Select a template...</option>
          {options}
        </Input>
      );
      if (input.template)
        help = templates.all.filter(t => t.id === input.template)[0].description;
    }
    const subProps = { invalid };

    return (
      <FormGroup>
        <Label>Template</Label>
        {main}
        {feedback && <FormFeedback {...subProps}>{feedback}</FormFeedback>}
        {help && <FormText color="muted">{help}</FormText>}
      </FormGroup>
    );
  }
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
    const variables = Object.keys(template.variables).map(variable => (
      <FormGroup key={variable}>
        <Label className="text-capitalize">
          {variable} <span id={`info-${variable}`}><FontAwesomeIcon icon={faInfoCircle} /></span>
        </Label>
        <UncontrolledTooltip key="tooltip" placement="top" target={`info-${variable}`}>
          Required for this template. Can be an empty string.
        </UncontrolledTooltip>
        <Input type="text" placeholder="Insert a value..."
          onChange={(e) => handlers.setVariable(variable, e.target.value)} />
        <FormText>{template.variables[variable]}</FormText>
      </FormGroup>
    ));

    return variables;
  }
}

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      reason: null
    };
  }

  componentDidMount() {
    this.setMetadata();
  }

  componentDidUpdate() {
    this.setMetadata();
  }

  setMetadata = () => {
    const { templates, namespaces, input, projects, meta } = this.props;
    const reserverdNames = ["badges", "blame", "blob", "builds", "commits", "create", "create_dir",
      "edit", "environments/folders", "files", "find_file", "gitlab-lfs/objects", "info/lfs/objects",
      "new", "preview", "raw", "refs", "tree", "update", "wikis"];

    let disabled = false, reason = null;
    if (templates.errors && templates.errors.length) {
      disabled = true;
      reason = null;
    }
    else if (templates.fetching || namespaces.fetching) {
      disabled = true;
      reason = "Ongoing operation...";
    }
    else if (meta.creation.creating || meta.creation.kgUpdating || meta.creation.projectUpdating) {
      disabled = true;
      reason = "Creating project...";
    }
    else if (!input.title) {
      disabled = true;
      reason = "Enter a title";
    }
    else if (!input.template) {
      disabled = true;
      reason = "Select a template";
    }
    else if (reserverdNames.includes(input.title)) {
      disabled = true;
      reason = "Reserverd title name";
    }
    else {
      // TODO: this should be moved up to improve performance, possible in the container mapState function
      const fullpaths = projects.list.map(project => project.path_with_namespace);
      const fullpath = `${input.namespace}/${slugFromTitle(input.title, true)}`;
      if (fullpaths.includes(fullpath)) {
        disabled = true;
        reason = "Title already in current namespace.";
      }
    }

    // update state if needed
    if (this.state.disabled === disabled && this.state.reason === reason)
      return;

    let newState = {};
    if (this.state.disabled !== disabled)
      newState.disabled = disabled;
    if (this.state.reason !== reason)
      newState.reason = reason;
    this.setState(newState);
  }

  render() {
    const { templates, meta } = this.props;

    // do not show while posting
    if (meta.creation.creating || meta.creation.projectUpdating || meta.creation.kgUpdating)
      return null;
    // do not show if posted succesfully with visibility or KG warning
    if (meta.creation.created && (meta.creation.projectError || meta.creation.kgError))
      return null;

    // compute error alert
    let alert = null;
    const error = templates.errors && templates.errors.length ?
      templates.errors[0] :
      null;
    if (error) {
      let text;
      for (let key of Object.keys(error))
        text = error[key];
      alert = (<Alert color="danger">{text}</Alert>);
    }

    // compute info
    let info = null;
    if (this.state.reason) {
      info = (
        <UncontrolledTooltip
          key="tooltip" placement="top" target="create-new-project">{this.state.reason}
        </UncontrolledTooltip>
      );
    }

    return (
      <Fragment>
        {alert}
        <Button id="create-new-project" color="primary"
          onClick={this.props.handlers.onSubmit}
          disabled={this.state.disabled}>
          Create project
        </Button>
        {info}
      </Fragment>
    );
  }
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
      message = (<span>Posting project to the remote repository... {loader}</span>);
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
        <p>Errors occured while creating the project.</p>
        {errors}
      </div>);
    }
    else if (creation.projectUpdating) {
      message = (<span>Updating the project visibility... {loader}</span>);
    }
    else if (creation.projectError) {
      color = "warning";
      message = (<div>
        <p>
          An error occured while updating project metadata (name or visibility). Please, adjust it on GitLab if needed.
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
          An error occured while activating the knowledge graph. You can activate it later to get the lineage.
        </p>
        <p>Error details: {creation.kgError}</p>
        <Button color="primary" onClick={(e) => { handlers.goToProject(); }}>Go to the project</Button>
      </div>);
    }
    else {
      return null;
    }

    return (
      <Alert color={color}>{message}</Alert>
    );
  }
}


export { NewProject };
