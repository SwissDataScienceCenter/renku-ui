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
import { withRouter } from "react-router";

import { ProjectsCoordinator } from "../../../project/shared";
import { QuickNavPresent } from "./QuickNav.present";
import { refreshIfNecessary } from "../../helpers/HelperFunctions";
import { Schema, StateKind, StateModel } from "../../../model/Model";
import { Url } from "../../helpers/url";


const suggestionSchema = new Schema({
  path: { mandatory: true },
  id: { mandatory: true }
});

const searchBarSchema = new Schema({
  value: { initial: "", mandatory: false },
  suggestions: { schema: [suggestionSchema], mandatory: true, initial: [] },
  selectedSuggestion: { schema: suggestionSchema, mandatory: false }
});

class SearchBarModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(searchBarSchema, stateBinding, stateHolder, initialState);
  }
}

export const defaultSuggestionQuickBar = {
  title: "",
  type: "fixed",
  suggestions: [
    { type: "fixed", path: "", id: "link-projects", url: "/projects", label: "My Projects", icon: "/project-icon.svg" },
    { type: "fixed", path: "", id: "link-datasets", url: "/datasets", label: "My datasets", icon: "/dataset-icon.svg" },
  ]
};

export const defaultAnonymousSuggestionQuickBar = {
  title: "",
  type: "fixed",
  suggestions: [
    { type: "fixed", path: "", id: "link-projects", url: "/projects", label: "Projects", icon: "/project-icon.svg" },
    { type: "fixed", path: "", id: "link-datasets", url: "/datasets", label: "Datasets", icon: "/dataset-icon.svg" },
  ]
};

class QuickNavContainerWithRouter extends Component {
  constructor(props) {
    super(props);
    this.bar = new SearchBarModel(StateKind.REACT, this);
    this.projectsCoordinator = new ProjectsCoordinator(props.client, props.model.subModel("projects"));
    if (this.props.user.logged) {
      const featured = this.projectsCoordinator.model.get("featured");
      refreshIfNecessary(featured.fetching, featured.fetched, () => this.projectsCoordinator.getFeatured(), 120);
    }

    this.callbacks = {
      onChange: this.onChange.bind(this),
      onSubmit: this.onSubmit.bind(this),
      onSuggestionsFetchRequested: this.onSuggestionsFetchRequested.bind(this),
      onSuggestionsClearRequested: this.onSuggestionsClearRequested.bind(this),
      onSuggestionSelected: this.onSuggestionSelected.bind(this),
      onSuggestionHighlighted: this.onSuggestionHighlighted.bind(this),
      getSuggestionValue: (suggestion) => suggestion ? suggestion.path : "",
    };
    this.currentSearchValue = null;
  }

  onSubmit(e) {
    e.preventDefault();
    const suggestion = this.bar.get("selectedSuggestion");
    const value = this.bar.get("value");
    this.bar.set("value", "");
    this.bar.set("selectedSuggestion", null);

    let url = null;
    if (suggestion == null || suggestion.url == null)
      url = this.searchUrlForValue(value);
    else
      url = suggestion.url;

    if (url == null) return;
    this.props.history.push(url);
  }

  onSuggestionsFetchRequested({ value, reason }) {
    this.currentSearchValue = value;
    if (this.currentSearchValue !== value)
      return;

    // constants come from react-autosuggest
    if (reason === "suggestions-revealed")
      return;
    const featured = this.projectsCoordinator.model.get("featured");
    if (!featured.fetched || (!featured.starred.length && !featured.member.length))
      return;

    // Search member projects and starred project
    const regex = new RegExp(value, "i");
    const searchDomain = featured.starred.concat(featured.member);
    const hits = {};
    searchDomain.forEach(d => {
      if (regex.exec(d.path_with_namespace) != null)
        hits[d.path_with_namespace] = d;

    });
    const suggestions = [];
    if (value.length > 0) {
      suggestions.push({
        title: "Search in All Projects",
        type: "all",
        suggestions: [{ query: value, id: -1, path: value, url: this.searchUrlForValue(value) }]
      });
    }

    // add fixed suggestions
    suggestions.push(defaultSuggestionQuickBar);

    const hitKeys = Object.keys(hits);
    if (hitKeys.length > 0) {
      suggestions.push({
        title: "Your Projects",
        type: "own-projects",
        suggestions: hitKeys.sort().map(k => (
          { path: k, id: hits[k].id, url: `/projects/${hits[k].path_with_namespace}` }
        ))
      });
    }

    this.bar.set("suggestions", suggestions);
  }

  searchUrlForValue(value) {
    const searchUrl = Url.get(Url.pages.projects.all, { query: value });
    return (value != null) ? searchUrl : null;
  }

  onSuggestionsClearRequested() {
    this.bar.set("suggestions", []);
  }

  onChange(event, { newValue, method }) {
    this.bar.set("value", newValue);
  }

  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    if (this.bar.get("suggestions") == null || suggestion?.type === "fixed")
      return;

    const selectedSuggestion = this.bar.get("suggestions")[sectionIndex].suggestions[suggestionIndex];
    this.bar.set("selectedSuggestion", selectedSuggestion);
  }

  onSuggestionHighlighted({ suggestion }) {
    if (suggestion == null)
      return;

    if (suggestion.id > 0)
      this.bar.set("selectedSuggestion", suggestion);
  }

  render() {
    return <QuickNavPresent
      loggedIn={this.props.user ? this.props.user.logged : false}
      suggestions={this.bar.get("suggestions")}
      value={this.bar.get("value")}
      callbacks={this.callbacks}
    />;
  }
}

const QuickNavContainer = withRouter(QuickNavContainerWithRouter);

export { QuickNavContainer };
