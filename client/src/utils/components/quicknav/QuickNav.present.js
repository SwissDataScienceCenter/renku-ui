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

import React, { Component } from "react";
import { Link } from "react-router-dom";
import Autosuggest from "react-autosuggest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import "./QuickNav.style.css";
import { Label } from "reactstrap";
import { defaultAnonymousSuggestionQuickBar, defaultSuggestionQuickBar } from "./QuickNav.container";

class QuickNavPresent extends Component {

  constructor(props) {
    super(props);
    this.onRenderSuggestion = this.doRenderSuggestion.bind(this);
    this.onSectionTitle = this.doSectionTitle.bind(this);
  }

  doRenderSuggestion(suggestion, { query, isHighlighted }) {
    const style = { padding: "5px 0", borderBottom: "1px solid #e1e4e8" };

    if (suggestion.type === "fixed") {
      return (
        <div style={style}>
          <Link id={suggestion.id} to={suggestion.url} style={{ textDecoration: "none", display: "block" }}>
            <img src={suggestion.icon} className="suggestion-icon" width="27" alt={suggestion.label} />
            {suggestion.label}
          </Link>
        </div>
      );
    }

    // If the suggestion is actually a query, make an appropriate link
    const link = (suggestion.query == null) ?
      <Link to={suggestion.url}>{suggestion.path}</Link> :
      <Link to={suggestion.url}>{suggestion.query}</Link>;

    return (isHighlighted) ?
      <div style={style} className="bg-light">{link}</div> :
      <div style={style}>{link}</div>;
  }

  doSectionTitle(section) {
    return <strong>{section.title}</strong>;
  }

  getTheme() {
    const defaultTheme = {
      container: "react-autosuggest__container",
      containerOpen: "react-autosuggest__container--open",
      input: "react-autosuggest__input",
      inputOpen: "react-autosuggest__input--open",
      inputFocused: "react-autosuggest__input--focused",
      suggestionsContainer: "react-autosuggest__suggestions-container searchBarSuggestionsContainer",
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
    return { ...defaultTheme, ...{ input: "form-control-sm form-control" } };
  }


  render () {
    const theme = this.getTheme();

    const inputProps = {
      placeholder: "Search or jump to...",
      type: "search",
      value: this.props.value,
      onChange: this.props.callbacks.onChange,
      onKeyDown: (e) => {
        if (e.key === "Enter")
          return this.props.callbacks.onSubmit(e);
      }
    };

    let suggestionList = [defaultAnonymousSuggestionQuickBar];
    if (this.props.loggedIn)
      suggestionList = this.props.suggestions.length ? this.props.suggestions : [defaultSuggestionQuickBar];

    return (
      <div className="search-box flex-nowrap justify-content-center">
        <div id="quick-nav" className="input-group flex-nowrap input-group-sm justify-content-center">
          <Autosuggest
            suggestions={suggestionList}
            getSuggestionValue={this.props.callbacks.getSuggestionValue}
            onSuggestionsFetchRequested={this.props.callbacks.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.props.callbacks.onSuggestionsClearRequested}
            onSuggestionSelected={this.props.callbacks.onSuggestionSelected}
            onSuggestionHighlighted={this.props.callbacks.onSuggestionHighlighted}
            multiSection={true}
            renderSectionTitle={this.onSectionTitle}
            getSectionSuggestions={(section) => section.suggestions}
            inputProps={inputProps}
            theme={theme}
            shouldRenderSuggestions={() => true}
            focusInputOnSuggestionClick={false}
            renderSuggestion={this.onRenderSuggestion} />
          <span className="input-group-text search-button" id="addon-wrapping" onClick={this.props.callbacks.onSubmit}>
            <FontAwesomeIcon size="lg" icon={faSearch} />
          </span>
        </div>
        <Label className="search-input-label">Search for Project, Dataset ...</Label>
      </div>
    );
  }
}

export { QuickNavPresent };
