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
    this.callbacks = {
      onChange: this.onChange.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onSuggestionsFetchRequested: this.onSuggestionsFetchRequested.bind(this),
      onSuggestionsClearRequested: this.onSuggestionsClearRequested.bind(this),
      onSuggestionSelected: this.onSuggestionSelected.bind(this),
      getSuggestionValue: (suggestion) =>  suggestion ? suggestion.path : ''
    }
    this.currentSearchValue = null;
  }

  onSubmit(e) {
    e.preventDefault();
    const suggestion = this.bar.get('selectedSuggestion');
    const value = this.bar.get('value');
    this.bar.set('value', '');
    this.bar.set('selectedSuggestion', null);

    let url = null;
    if (suggestion == null || suggestion.url == null)
      url = this.searchUrlForValue(value)
    else
      url = suggestion.url;

    if (url == null) return;
    this.props.history.push(url);
  }

  onSuggestionsFetchRequested({ value, reason }) {

    this.currentSearchValue = value;
    if (this.currentSearchValue !== value) return;

    // constants come from react-autosuggest
    if (reason === 'suggestions-revealed') return;
    if (this.props.user.memberProjects == null || this.props.user.starredProjects == null) return;

    // Search member projects and starred project
    const regex = new RegExp(value, 'i');
    const searchDomain = this.props.user.memberProjects.concat(this.props.user.starredProjects);
    const hits = {};
    searchDomain.forEach(d => {
      if (regex.exec(d.path_with_namespace) != null) {
        hits[d.path_with_namespace] = d;
      }
    });
    const suggestions = [];
    if (value.length > 0) {
      suggestions.push({title: 'Search',
        suggestions: [{query: value, id: -1, path: value, url: this.searchUrlForValue(value)}]
      });
    }
    const hitKeys = Object.keys(hits);
    if (hitKeys.length > 0) {
      suggestions.push({
        title: 'Projects',
        suggestions: hitKeys.sort().map(k => ({path: k, id: hits[k].id, url: `/projects/${hits[k].id}`}))
      });
    }

    this.bar.set('suggestions', suggestions);
  }

  searchUrlForValue(value) {
    return (value != null) ? `/projects/search?q=${value}` : null;
  }

  onSuggestionsClearRequested() {
    this.bar.set('suggestions', []);
  }

  onChange(event, { newValue, method }) {
    this.bar.set('value', newValue);
  }

  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    const selectedSuggestion = this.bar.get('suggestions')[sectionIndex].suggestions[suggestionIndex];
    this.bar.set('selectedSuggestion', selectedSuggestion)
  }

  render () {
    return <QuickNavPresent
      suggestions={this.bar.get('suggestions')}
      value={this.bar.get('value')}
      callbacks={this.callbacks}
    />
  }
}

const QuickNavContainer = withRouter(QuickNavContainerWithRouter)

export { QuickNavContainer }
