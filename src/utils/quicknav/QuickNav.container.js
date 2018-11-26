/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

import React, { Component } from 'react';
import { withRouter } from 'react-router';

import { StateKind, Schema, StateModel } from '../../model/Model';
import { QuickNavPresent } from './QuickNav.present';

const suggestionSchema = new Schema({
  path: {mandatory: true},
  id: {mandatory: true}
});

const searchBarSchema = new Schema({
  value: {initial: '', mandatory: false},
  suggestions: {schema: [suggestionSchema], mandatory: true, initial: []},
  selectedSuggestion: {schema: suggestionSchema, mandatory: false}
});

class SearchBarModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(searchBarSchema, stateBinding, stateHolder, initialState)
  }
}

class QuickNavContainerWithRouter extends Component {
  constructor(props) {
    super(props)
    this.bar = new SearchBarModel(StateKind.REACT, this);
    this.onChange = this.doChange.bind(this);
    this.onSubmit = this.doSubmit.bind(this);
    this.onSuggestionsFetchRequested = this.doSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.doSuggestionsClearRequested.bind(this);
    this.currentSearchValue = null;
  }

  doSubmit(e) {
    e.preventDefault();
    this.bar.set('value', '');
    const suggestion = this.bar.get('selectedSuggestion');
    this.bar.set('selectedSuggestion', null);

    if (suggestion == null) return;
    this.props.history.push(`/projects/${suggestion.id}`);
  }

  doSuggestionsFetchRequested({ value, reason }) {

    // We only do the API call when no letter has been
    // typed for one second.
    this.currentSearchValue = value;
    setTimeout(() => {
      if (this.currentSearchValue !== value) return;

      // constants come from react-autosuggest
      if (reason === 'suggestions-revealed') return;

      this.props.client.getProjects({
        search: value
      })
        .then((response) => {
          return response.data.map((project) => {
            return {
              path: project.path_with_namespace,
              id: project.id
            };
          });
        })
        .then((parsedProjects) => {
          this.bar.set('suggestions', parsedProjects);
        });
    }, 1000);
  }

  doSuggestionsClearRequested() {
    this.bar.set('suggestions', []);
  }

  doChange = (event, { newValue, method }) => {
    this.bar.set('value', newValue);
    const suggestions = this.bar.get('suggestions')
      .filter((s) => s.path === newValue);
    if (suggestions.length > 0)
      this.bar.set('selectedSuggestion', suggestions[0])
    else
      this.bar.set('selectedSuggestion', null);
  };

  render () {
    const callbacks = {
      onChange: this.onChange,
      onSubmit: this.onSubmit,
      onSuggestionsClearRequested: this.onSuggestionsClearRequested,
      onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
      getSuggestionValue: (suggestion) =>  suggestion ? suggestion.path : ''
    }

    return <QuickNavPresent
      suggestions={this.bar.get('suggestions')}
      value={this.bar.get('value')}
      callbacks={callbacks}
    />
  }
}

const QuickNavContainer = withRouter(QuickNavContainerWithRouter)

export { QuickNavContainer }
