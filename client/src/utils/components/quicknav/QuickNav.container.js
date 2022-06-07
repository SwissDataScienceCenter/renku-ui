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
import { TOTAL_QUERIES, useSearchLastQueriesQuery } from "./KgLastQueriesApi";

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
  const { data, isFetching, isLoading, refetch } = useSearchLastQueriesQuery(TOTAL_QUERIES);

  useEffect(() => {
    setCurrentPhrase(phrase);
  }, [phrase]);

  const getLastQueries = (lastQueries) => {
    const suggestionLastQueries = [];
    if (lastQueries && lastQueries?.length) {
      for (const query of lastQueries) {
        suggestionLastQueries.push({
          type: "last-queries",
          path: "",
          id: "last-queries",
          url: "/search",
          label: query,
          query
        });
      }
    }

    if (suggestionLastQueries?.length) {
      return {
        title: "",
        type: "last-queries",
        suggestions: suggestionLastQueries
      };
    }
    return null;
  };

  const lastQueriesSuggestions = user.logged && !isFetching && !isLoading && data && !data.error ?
    getLastQueries(data?.queries) : null;

  const refetchLastQueries = (target) => {
    setTimeout(() => {
      // wait to retrieve the last queries after changing the phrase requesting a new entity search
      target.blur(); // so when refetch the last queries it will no open the suggestions list again
      refetch();
    }, 1000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(setPhrase(currentPhrase));
    refetchLastQueries(e.currentTarget);
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

    if (suggestion && suggestion?.type === "last-queries" && event.type === "click") {
      dispatch(setPhrase(suggestion.label));
      refetchLastQueries(event.currentTarget);
    }
  };

  const onSuggestionHighlighted = ({ suggestion }) => {
    if (suggestion && suggestion?.type === "last-queries")
      setCurrentPhrase(suggestion.query);
    else
      setCurrentPhrase("");
  };

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
    suggestions={lastQueriesSuggestions}
  />;
};

const QuickNavContainer = withRouter(QuickNavContainerWithRouter);
export { QuickNavContainer };
