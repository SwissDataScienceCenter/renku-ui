/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { setSearch } from "./searchV2.slice";
import searchV2Api from "./searchV2.api";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { buildSearchQuery } from "./searchV2.utils";

const useStartNewSearch = () => {
  const dispatch = useDispatch();
  const searchState = useAppSelector((state) => state.searchV2);
  const [startSearch, searchResult] =
    searchV2Api.useLazyGetSearchResultsQuery();

  const startNewSearch = useCallback(() => {
    const searchQuery = buildSearchQuery(searchState);

    if (
      searchResult.fulfilledTimeStamp &&
      searchQuery === searchState.search.lastSearch &&
      +new Date() - searchResult.fulfilledTimeStamp < 1000
    )
      return;

    dispatch(setSearch(searchQuery));
    startSearch(searchQuery);
  }, [dispatch, searchState, startSearch, searchResult.fulfilledTimeStamp]);

  return { startNewSearch, searchResult };
};

export default useStartNewSearch;
