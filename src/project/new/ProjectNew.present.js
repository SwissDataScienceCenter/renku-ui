/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
 *  Presentational components.
 */



import React, { Component } from 'react';

import Autosuggest from 'react-autosuggest';

import { Row, Col } from 'reactstrap';
import { Button, FormGroup, FormText, Label } from 'reactstrap';
import { Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Alert } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { faInfoCircle, faExternalLinkAlt } from '@fortawesome/fontawesome-free-solid'

import collection from 'lodash/collection';
import { FieldGroup, Loader } from '../../utils/UIComponents'
import './Project.style.css';


class ProjectPath extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.doChange.bind(this);
    this.onBlur = this.doBlur.bind(this);
    this.onSuggestionsFetchRequested = this.doSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.doSuggestionsClearRequested.bind(this);

    this.state = {
      suggestions: [],
      input: this.props.namespace.name
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.namespace.name !== prevProps.namespace.name) {
      this.setState({input: this.props.namespace.name});
    }
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion) {
    return <span>{suggestion.name}</span>;
  }

  renderSectionTitle(section) {
    return (
      <strong>{section.kind}</strong>
    );
  }

  getSectionSuggestions(section) {
    return section.namespaces;
  }

  doBlur(event, {highlightedSuggestion}) {
    // Take the highlighted suggestion or return to the selected namespace
    if (null != highlightedSuggestion) {
      this.props.onChange(highlightedSuggestion);
      this.props.onAccept();
    }
    this.setState({input: this.props.namespace.name})
  }

  doChange(event, { newValue, method }) {
    // If the user typed, store it as local input, otherwise set the selection
    if (method === 'type') {
      this.setState({input: newValue});
    } else {
      this.props.onChange(newValue)
    }
    if (method === 'enter' || method === 'click') {
      this.props.onAccept();
    }
  }

  async doSuggestionsFetchRequested({ value, reason }) {
    let searchValue = value;
    // Do a broad search on input-focused to show many options
    if (reason === 'input-focused') searchValue = '';
    const matches = await this.props.fetchMatchingNamespaces(searchValue);
    const namespaces = collection.groupBy(matches, 'kind');
    const suggestions = ['user', 'group']
      .map(section => {
        const sectionNs = namespaces[section];
        return {
          kind: section,
          namespaces: (sectionNs == null) ? [] : sectionNs
        };
      })
      .filter(section => section.namespaces.length > 0);

    // Show current as first on input-focused, otherwise do not show
    if (reason === 'input-focused') {
      const current = {kind: 'current', namespaces: [this.props.namespace]};
      suggestions.splice(0, 0, current);
    }
    this.setState({ suggestions });
  }

  doSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  render() {
    const { suggestions } = this.state;
    const inputProps = {
      placeholder: "{user}",
      value: this.state.input || '',
      onChange: this.onChange,
      onBlur: this.onBlur
    };
    // See https://github.com/moroshko/react-autosuggest#themeProp
    const defaultTheme = {
      container:                'react-autosuggest__container',
      containerOpen:            'react-autosuggest__container--open',
      input:                    'react-autosuggest__input',
      inputOpen:                'react-autosuggest__input--open',
      inputFocused:             'react-autosuggest__input--focused',
      suggestionsContainer:     'react-autosuggest__suggestions-container',
      suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
      suggestionsList:          'react-autosuggest__suggestions-list',
      suggestion:               'react-autosuggest__suggestion',
      suggestionFirst:          'react-autosuggest__suggestion--first',
      suggestionHighlighted:    'react-autosuggest__suggestion--highlighted',
      sectionContainer:         'react-autosuggest__section-container',
      sectionContainerFirst:    'react-autosuggest__section-container--first',
      sectionTitle:             'react-autosuggest__section-title'
    };
    // Override the input theme to match our visual style
    const theme = {...defaultTheme, ...{input: 'form-control'}};
    return <FormGroup>
      <Label>Project Home</Label>
      <InputGroup>
        <Autosuggest
          multiSection={true}
          highlightFirstSuggestion={true}
          suggestions={suggestions}
          inputProps={inputProps}
          theme={theme}
          shouldRenderSuggestions={(v) => true}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          renderSectionTitle={this.renderSectionTitle}
          getSectionSuggestions={this.getSectionSuggestions} />
        <InputGroupAddon addonType="append">
          <InputGroupText>/</InputGroupText>
          <InputGroupText>{this.props.slug}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <FormText color="muted">{"By default, a project is owned by the user that created it, but \
        it can optionally be created within a group."}</FormText>
    </FormGroup>
  }
}

class DataVisibility extends Component {
  render() {
    const visibilities = this.props.visibilities;
    const vizExplanation = (visibilities.length === 3) ?
      "" :
      "The project home's visibility setting limits the project visibility options.";
    const options = visibilities.map(v =>
      <option key={v.value} value={v.value}>{v.name}</option>
    )
    let warningPrivate = null;
    if (this.props.value !== "public") {
      warningPrivate = <FormText color="primary">
        <FontAwesomeIcon icon={faInfoCircle} /> The Knowledge Graph may make some metadata public;
        the contents will remain private.
        <br />
        <a href="https://renku.readthedocs.io/en/latest/introduction/lineage.html"
          target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faExternalLinkAlt} /> Read more about Lineage.
        </a>
      </FormText>;
    }
    return <FormGroup>
      <Label>Visibility</Label>
      <Input type="select" placeholder="visibility" value={this.props.value} onChange={this.props.onChange}>
        {options}
      </Input>
      {warningPrivate}
      <FormText color="muted">{vizExplanation}</FormText>
    </FormGroup>
  }
}

class ProjectNew extends Component {

  render() {
    const statuses = this.props.statuses;
    const titleHelp = this.props.model.display.slug.length > 0 ? `Id: ${this.props.model.display.slug}` : null;
    return [
      <Row key="header"><Col md={8}>
        <h1>New Project</h1>
      </Col></Row>,
      <Row key="body"><Col md={8}>
        <form action="" method="post" encType="multipart/form-data" id="js-upload-form">
          <FieldGroup id="title" type="text" label="Title" placeholder="A brief name to identify the project"
            help={titleHelp} value={this.props.model.display.title}
            feedback={statuses.title} invalid={statuses.title != null}
            onChange={this.props.handlers.onTitleChange} />
          <FieldGroup id="description" type="textarea" label="Description" placeholder="A description of the project"
            help="A description of the project helps users understand it and is highly recommended."
            feedback={statuses.description} invalid={statuses.description != null}
            value={this.props.model.display.description} onChange={this.props.handlers.onDescriptionChange} />
          <ProjectPath namespace={this.props.model.meta.projectNamespace} slug={this.props.model.display.slug}
            namespaces={this.props.namespaces}
            onChange={this.props.handlers.onProjectNamespaceChange}
            onAccept={this.props.handlers.onProjectNamespaceAccept}
            fetchMatchingNamespaces={this.props.handlers.fetchMatchingNamespaces} />
          <DataVisibility
            value={this.props.model.meta.visibility}
            visibilities={this.props.visibilities}
            onChange={this.props.handlers.onVisibilityChange} />
          <br/>
          <SubmitErrors errors={this.props.model.display.errors} />
          <Button color="primary" onClick={this.props.handlers.onSubmit} disabled={this.props.model.display.loading}>
            Create
          </Button>
          <SubmitLoader loading={this.props.model.display.loading} />
        </form>
      </Col></Row>
    ]
  }
}

class SubmitLoader extends Component {
  render() {
    if (!this.props.loading) return null;
    return(<Loader size="16" inline="true" margin="2" />)
  }
}

class SubmitErrors extends Component {
  render() {
    if (!this.props.errors || !this.props.errors.length) return null;
    return(
      <div>
        <Alert color="danger">
          <Col>
            <Row>
              {
                this.props.errors.length > 1
                  ? <h5>Some errors occurred</h5>
                  : <h5>An error occurred</h5>
              }
            </Row>
            {this.props.errors.map(error => (
              <Row key={error}>
                {error}
              </Row>
            ))}
          </Col>
        </Alert>
      </div>
    )
  }

}

export default ProjectNew;
