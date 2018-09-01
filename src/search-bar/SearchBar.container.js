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

import { StateKind, Schema, StateModel } from './../model/Model';
import { SearchBarPresent } from './SearchBar.present';

const suggestionSchema = new Schema({
  path: {mandatory: true},
  id: {mandatory: true}
});

const searchBarSchema = new Schema({
  value: {initial: '', mandatory: false},
  suggestions: {schema: [suggestionSchema], mandatory: true, initial: []}
});

class searchBarModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(searchBarSchema, stateBinding, stateHolder, initialState)
  }
}

class SearchBarContainer extends Component {
  constructor(props) {
    super(props)
    this.bar = new searchBarModel(StateKind.REACT, this);
  }

  onSuggestionsFetchRequested({ value, reason }) {

    // We only start searching after the second
    // letter has been typed.
    if (value.length < 2) return;

    this.props.client.getProjects({
      search: value
    })
      .then((projects) => {
        return projects.map((project) => {
          return {
            path: project.path_with_namespace,
            id: project.id
          };
        });
      })
      .then((parsedProjects) => {
        this.bar.set('suggestions', parsedProjects);
      });
  }

  onSuggestionsClearRequested() {
    this.bar.set('suggestions', []);
  }

  onChange = (event, { newValue }) => {
    this.bar.set('value', newValue);
  };

  render () {
    const inputProps = {
      placeholder: 'Search Renku',
      value: this.bar.get('value'),
      onChange: this.onChange.bind(this)
    };

    return <SearchBarPresent
      suggestions={this.bar.get('suggestions')}
      renderSuggestion={this.renderSuggestion}
      getSuggestionValue={(suggestion) => ''}
      onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
      onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
      inputProps={inputProps}
    />
  }
}

export { SearchBarContainer }
