/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
 *  Namespace.js
 *  Namespace form group component.
 */

import React, { Component, Fragment } from "react";
import Autosuggest from "react-autosuggest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { Button, FormGroup, UncontrolledTooltip } from "reactstrap/lib";
import { InputHintLabel, InputLabel, LoadingLabel } from "../../../utils/components/formlabels/FormLabels";

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
      <Button
        key="button" className="ms-1 p-0" color="link" size="sm"
        id={id} onClick={() => refresh()} disabled={disabled} >
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={id}>{tip}</UncontrolledTooltip>
    </Fragment>
  );
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
    const { list } = namespaces;
    // show info about visibility only when group namespaces are available
    const info = namespaces.fetched && list.length && list.filter(n => n.kind === "group").length ?
      (<InputHintLabel text="Group namespaces may restrict the visibility options"/>) :
      null;
    // loading or autosuggest
    const main = namespaces.fetching ?
      (<div><LoadingLabel text="Refreshing..." /></div>) :
      (<>
        <NamespacesAutosuggest {...this.props} />
        {info}
      </>);

    return (
      <FormGroup className="field-group">
        <InputLabel text="Namespace" isRequired="true"/><span className="mx-2">{refreshButton}</span>
        {main}
      </FormGroup>
    );
  }
}

export default Namespaces;
