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
import { skipToken } from "@reduxjs/toolkit/query";

import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { AVAILABLE_SORTING } from "../searchV2.utils";
import { SortingItem, SortingItems } from "../searchV2.types";
import searchV2Api from "../searchV2.api";

interface SearchV2ResultsHeaderProps {
  currentSorting: SortingItem;
  sortingItems?: SortingItems;
}
export default function SearchV2Header({
  currentSorting,
  sortingItems = AVAILABLE_SORTING,
}: SearchV2ResultsHeaderProps) {
  const { search } = useAppSelector((state) => state.searchV2);
  const searchResults = searchV2Api.endpoints.getSearchResults.useQueryState(
    search.lastSearch != null ? search.lastSearch : skipToken
  );

  const searchQuery = search.lastSearch;
  const total =
    searchResults.data?.length != null ? searchResults.data?.length : 0;

  const options = Object.values(sortingItems).map((value) => (
    <option key={value.sortingString} value={value.sortingString}>
      {value.friendlyName}
    </option>
  ));
  const resultsText = (
    <div className="rk-search-result-title">
      {total ? total : "No"} {total && total > 1 ? "results" : "result"}
      {searchQuery != null && (
        <span>
          {" "}
          for <span className="fw-bold">{`"${searchQuery}"`}</span>
        </span>
      )}
    </div>
  );

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div className="d-flex gap-4 align-items-center">{resultsText}</div>
      <div className="d-flex align-items-center">
        <label className="mx-2 sorting-label--desk">Sort by</label>
        <select
          className="form-select"
          data-cy="sorting-search-input"
          name="sorting"
          value={currentSorting.sortingString}
          onChange={() => {}}
        >
          {options}
        </select>
      </div>
    </div>
  );
}
