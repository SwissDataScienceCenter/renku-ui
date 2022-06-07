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

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, withRouter } from "react-router-dom";

import {
  setMyDatasets,
  setMyProjects,
  setPhrase,
  useKgSearchFormSelector
} from "../../../features/kgSearch/KgSearchSlice";
import { QuickNavPresent } from "./QuickNav.present";

export const defaultSuggestionQuickBar = {
  title: "",
  type: "fixed",
  suggestions: [
    { type: "fixed", path: "", id: "link-projects", url: "/search", label: "My Projects", icon: "/project-icon.svg" },
    { type: "fixed", path: "", id: "link-datasets", url: "/search", label: "My datasets", icon: "/dataset-icon.svg" },
  ]
};

export const defaultAnonymousSuggestionQuickBar = {
  title: "",
  type: "fixed",
  suggestions: [
    { type: "fixed", path: "", id: "link-projects", url: "/search", label: "Projects", icon: "/project-icon.svg" },
    { type: "fixed", path: "", id: "link-datasets", url: "/search", label: "Datasets", icon: "/dataset-icon.svg" },
  ]
};

const QuickNavContainerWithRouter = ({ user }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { phrase } = useKgSearchFormSelector((state) => state.kgSearchForm);
  const [currentPhrase, setCurrentPhrase] = useState("");

  useEffect(() => {
    setCurrentPhrase(phrase);
  }, [phrase]);

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(setPhrase(currentPhrase));
    if (history.location.pathname === "/search")
      return;
    history.push("/search");
  };

  const onSuggestionsFetchRequested = () => {};

  const onSuggestionsClearRequested = () => {};

  const onChange = (event, { newValue }) => {
    setCurrentPhrase(newValue);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    if (suggestion && suggestion?.type === "fixed") {
      if (suggestion.id === "link-datasets")
        dispatch(setMyDatasets());

      if (suggestion.id === "link-projects")
        dispatch(setMyProjects());
    }
  };

  const onSuggestionHighlighted = () => {};

  const callbacks = {
    onChange,
    onSubmit,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    onSuggestionSelected,
    onSuggestionHighlighted,
    getSuggestionValue: (suggestion) => suggestion ? suggestion.path : "",
  };

  return <QuickNavPresent
    loggedIn={user ? user.logged : false}
    value={currentPhrase}
    callbacks={callbacks}
  />;
};

const QuickNavContainer = withRouter(QuickNavContainerWithRouter);
export { QuickNavContainer };
