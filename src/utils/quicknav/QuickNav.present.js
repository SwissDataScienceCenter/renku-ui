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
import { RenkuNavLink } from '../UIComponents';
import Autosuggest from 'react-autosuggest';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import './QuickNav.style.css';

class QuickNavPresent extends Component {

  renderSuggestion = (suggestion) => <RenkuNavLink
    to={`/projects/${suggestion.id}`}
    title={suggestion.path}
  />

  render () {
    const theme = {
      container: 'input-group',
      input: 'form-control border-primary',
      suggestionsContainer: 'searchBarSuggestionsContainer',
      suggestion: {listStyle: 'none'}
    };

    const inputProps = {
      placeholder: 'Jump to...',
      value: this.props.value,
      onChange: this.props.callbacks.onChange
    };


    return <form className="form-inline my-2 my-lg-0">
      <div className="input-group">
        <Autosuggest
          suggestions={this.props.suggestions}
          getSuggestionValue={this.props.callbacks.getSuggestionValue}
          onSuggestionsFetchRequested={this.props.callbacks.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.props.callbacks.onSuggestionsClearRequested}
          inputProps={inputProps}
          theme={theme}
          renderSuggestion={this.renderSuggestion} />
        <span className="input-group-append">
          <button className="btn btn-outline-primary my-2 my-sm-0" type="submit">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </span>
      </div>
    </form>

  }
}

export { QuickNavPresent }
