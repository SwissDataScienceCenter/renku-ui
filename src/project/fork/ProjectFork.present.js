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

import { Row, Col, Button, FormGroup, FormText, Label } from 'reactstrap';
import {  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Alert } from 'reactstrap';

import collection from 'lodash/collection';
import { Loader } from '../../utils/UIComponents'
import '../new/Project.style.css'
import {Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


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

  componentDidMount(){
    this.props.fetchAllNamespaces();
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
      <FormText color="muted">{"By default, a project is owned by the user that forked it, but \
        it can optionally be forked within a group."}</FormText>
    </FormGroup>
  }
}

class ForkProjectModal extends Component {

  render() {
    return <div>
      <Modal 
        isOpen={this.props.forkModalOpen !== undefined && this.props.forkModalOpen !== false} 
        toggle={this.props.handlers.toogleForkModal} 
        className={this.props.className}>
        <ModalHeader toggle={this.props.handlers.toogleForkModal}>Fork Project</ModalHeader>
        <ModalBody>
          <ProjectPath 
            namespace={this.props.model.meta.projectNamespace} 
            slug={this.props.slug}
            namespaces={this.props.namespaces}
            onChange={this.props.handlers.onProjectNamespaceChange}
            onAccept={this.props.handlers.onProjectNamespaceAccept}
            fetchMatchingNamespaces={this.props.handlers.fetchMatchingNamespaces} 
            fetchAllNamespaces={this.props.handlers.fetchAllNamespaces}/>
          <SubmitErrors errors={this.props.model.display.errors} />
          <SubmitLoader loading={this.props.model.display.loading} />
        </ModalBody>
        <ModalFooter>
          <Button 
            color="primary" 
            disabled={ this.props.model.display.loading } 
            onClick={this.props.handlers.onSubmit}>
            Fork
          </Button>{' '}
          <Button 
            color="secondary" 
            disabled={ this.props.model.display.loading } 
            onClick={this.props.handlers.toogleForkModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
      
  }
}

class SubmitLoader extends Component {
  render() {
    if (!this.props.loading) return null;
    return(
      <FormText color="primary">
        <Loader size="16" inline="true" margin="2"/>
        The project is being forked...
      </FormText> )
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

export default ForkProjectModal;
