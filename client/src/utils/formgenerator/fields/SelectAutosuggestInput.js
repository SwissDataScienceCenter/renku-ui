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
 *  SelectInput.js
 *  Presentational components.
 */

import * as React from "react";
import { useState } from "react";
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import FormLabel from "./FormLabel";
import { FormGroup } from "reactstrap";
import Autosuggest from "react-autosuggest";

function SelectautosuggestInput({ name, label, type, value, alert, options, initial,
  placeholder, setInputs, help, customHandlers, disabled = false, required = false }) {

  const [localValue, setLocalValue] = useState("");
  const [suggestions, setSuggestions ] = useState([]);

  const getSuggestions = (value, reason) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? options : options.filter(lang =>
      lang.name.toLowerCase().includes(inputValue)
    );
  };

  const getSuggestionValue = suggestion => suggestion;

  const renderSuggestion = suggestion => (
    <span>
      {suggestion.name}
    </span>
  );

  const onSuggestionSelected = (event, { method }) => {
    if (method === "enter")
      event.preventDefault();
  };

  const onChange = (event, { newValue, method }) => {
    if (method !== "type") {
      setLocalValue(newValue.name);
      const artifitialEvent = {
        target: { name: name, value: newValue !== undefined ? newValue.value : "" },
        isPersistent: () => false
      };
      setInputs(artifitialEvent);
    }
    else {
      // If the user typed, store it as local input, otherwise set the selection
      setLocalValue(newValue);
      const selectedOption = options.find(option => option.name === newValue );
      const artifitialEvent = {
        target: { name: name, value: selectedOption !== undefined ? selectedOption.value : "" },
        isPersistent: () => false
      };
      setInputs(artifitialEvent);
    }

  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  // TODO allow custom handlers for more events
  const onSuggestionsFetchRequested = ({ value, reason }) => {
    if (customHandlers.onSuggestionsFetchRequested)
      customHandlers.onSuggestionsFetchRequested(value, reason, setSuggestions);
    else
      setSuggestions( getSuggestions(value, reason));
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSectionSuggestions = (section)=>{
    return section.suggestions;
  };

  const renderSectionTitle = (section)=>{
    return <strong>{section.title}</strong>;
  };

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    placeholder: placeholder,
    value: localValue || "",
    onChange: onChange,
    disabled: disabled
  };

  // See https://github.com/moroshko/react-autosuggest#themeProp
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
  const theme = { ...defaultTheme, ...{ input: "form-control" } };

  /* TODO: allow grouped and non grouped field */
  return <FormGroup>
    <FormLabel htmlFor={name} label={label} required={required}/>
    <Autosuggest
      id={name}
      suggestions={suggestions}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
      theme={theme}
      shouldRenderSuggestions={(v) => true}
      onSuggestionSelected={onSuggestionSelected}
    />
    <HelpText content={help} />
    <ValidationAlert content={alert} />
  </FormGroup>;
}

export default SelectautosuggestInput;
