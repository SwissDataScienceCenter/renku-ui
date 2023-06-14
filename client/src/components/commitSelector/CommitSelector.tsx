/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { useEffect, useRef, useState } from "react";
import Autosuggest, {
  ChangeEvent,
  ShouldRenderReasons,
  SuggestionSelectedEventData,
} from "react-autosuggest";

import { TimeCaption } from "../TimeCaptionV2";
import { ChevronDown, ChevronUp } from "../../utils/ts-wrappers";
import { Loader } from "../Loader";

import "./CommitSelector.scss";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CommitSelectorTheme = {
  container:
    "react-autosuggest__container rk-commit-selector__suggestions-container",
  containerOpen: "react-autosuggest__container--open",
  input: "react-autosuggest__input",
  inputOpen: "react-autosuggest__input--open",
  inputFocused: "react-autosuggest__input--focused",
  suggestionsContainer: "react-autosuggest__suggestions-container",
  suggestionsContainerOpen:
    "react-autosuggest__suggestions-container--open rk-commit-selector__suggestions-container--open",
  suggestionsList:
    "react-autosuggest__suggestions-list rk-commit-selector__suggestions-list",
  suggestion: "react-autosuggest__suggestion rk-commit-selector__suggestion",
  suggestionFirst: "react-autosuggest__suggestion--first",
  suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
  sectionContainer: "react-autosuggest__section-container",
  sectionContainerFirst: "react-autosuggest__section-container--first",
  sectionTitle: "react-autosuggest__section-title",
};

interface Commit {
  id: string;
  committed_date: string;
  author_name: string;
  message: string;
  short_id: string;
}
interface CommitSelectorProps {
  commits: Commit[];
  disabled: boolean;
  onChange: Function; // eslint-disable-line @typescript-eslint/ban-types
}
function CommitSelector({ commits, disabled, onChange }: CommitSelectorProps) {
  const [suggestionList, setSuggestionList] = useState<Commit[]>(commits);
  const [selectedCommit, setSelectedCommit] = useState<Commit | undefined>(
    suggestionList.length > 0 ? suggestionList[0] : undefined
  );
  const [selectedCommitId, setSelectedCommitId] = useState<string>("");
  const [isSelectorOpened, setIsSelectorOpened] = useState<boolean>(false);
  const inputRef = useRef(null);
  useEffect(() => {
    setSuggestionList(commits);
    setSelectedCommitId(commits.length ? commits[0].id : "");
  }, [commits]);

  const onSuggestionSelected = (
    event: React.FormEvent<any>,
    data: SuggestionSelectedEventData<Commit>
  ) => {
    setSelectedCommit(data.suggestion);
    setIsSelectorOpened(false);
  };

  const handleChange = (
    event: React.FormEvent<HTMLElement>,
    { newValue }: ChangeEvent
  ) => {
    setSelectedCommitId(newValue);
    onChange(newValue);
  };

  const onSuggestionsFetchRequested = () => {
    // eslint-disable-line @typescript-eslint/no-empty-function
  };
  const onSuggestionsClearRequested = () => {
    setIsSelectorOpened(false);
  };

  const getSuggestionValue = (suggestion: Commit) => suggestion.id;
  const renderSuggestion = (suggestion: Commit) => (
    <div className="commit-row">
      <div className="commit-row-id">{suggestion.short_id}</div>
      <div className="commit-row-author text-truncate">
        {suggestion.author_name}
      </div>
      <div className="commit-row-date">
        <TimeCaption
          className="text-truncate"
          datetime={suggestion.committed_date}
          prefix="authored"
        />
      </div>
      <div className="commit-row-message text-truncate">
        {suggestion.message}
      </div>
    </div>
  );

  const inputProps = {
    placeholder: "Select commit...",
    type: "click",
    value: selectedCommitId,
    onChange: handleChange,
  };

  const shouldRenderSuggestions = (
    value: string,
    reason: ShouldRenderReasons
  ) => {
    return reason === "input-focused" || isSelectorOpened;
  };

  const clickOnSelector = (isOpen: boolean) => {
    setIsSelectorOpened(!isOpen);
  };

  const renderInputComponent = (inputProps: Record<string, any>) => {
    return (
      <input
        {...inputProps}
        ref={inputRef}
        onClick={() => clickOnSelector(isSelectorOpened)}
        className="opacity-0 input-commit-selector"
      />
    );
  };

  const selector = selectedCommit ? (
    <div
      className={`selected-commit cursor-pointer ${
        isSelectorOpened ? "selected-commit--open" : ""
      }`}
    >
      <div>
        <div className="commit-row">
          <div className="commit-row-id">
            {selectedCommit.short_id}
            <div className="commit-row-icon">
              {!isSelectorOpened ? (
                <ChevronDown size="20" />
              ) : (
                <ChevronUp size="20" />
              )}
            </div>
          </div>
          <div className="commit-row-author text-truncate">
            {selectedCommit.author_name}
          </div>
          <div className="commit-row-date">
            <TimeCaption
              className="text-truncate"
              datetime={selectedCommit.committed_date}
              prefix="authored"
            />
          </div>
          <div className="commit-row-box-message text-truncate">
            <div className="commit-row-message text-truncate">
              {selectedCommit.message}
            </div>
            <div className="commit-row-icon">
              {!isSelectorOpened ? (
                <ChevronDown size="20" />
              ) : (
                <ChevronUp size="20" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (disabled) return <Loader />;

  return (
    <>
      {selector}
      <Autosuggest
        suggestions={suggestionList}
        getSuggestionValue={getSuggestionValue}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionSelected={onSuggestionSelected}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        multiSection={false}
        shouldRenderSuggestions={shouldRenderSuggestions}
        renderInputComponent={renderInputComponent}
        theme={CommitSelectorTheme}
        focusInputOnSuggestionClick={false}
      />
    </>
  );
}

export default CommitSelector;
