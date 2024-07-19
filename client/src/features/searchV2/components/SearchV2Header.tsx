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
import cx from "classnames";
import React, { useCallback } from "react";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { searchV2Api } from "../api/searchV2Api.api";
import { SORTING_OPTIONS } from "../searchV2.constants";
import { setSort } from "../searchV2.slice";

export default function SearchV2Header() {
  const dispatch = useAppDispatch();
  const { page, perPage, query, sort } = useAppSelector(
    ({ searchV2 }) => searchV2
  );

  const searchResults = searchV2Api.endpoints.getQuery.useQueryState(
    query != null ? { page, perPage, q: query } : skipToken
  );

  // const { search, sorting } = useAppSelector((state) => state.searchV2);
  // const dispatch = useDispatch();
  // const searchResults = searchV2Api.endpoints.$get.useQueryState(
  //   search.lastSearch != null
  //     ? {
  //         q: search.lastSearch,
  //         page: search.page,
  //         perPage: search.perPage,
  //       }
  //     : skipToken
  // );

  // const searchQuery = search.lastSearch;

  // const setNewSorting = useCallback(
  //   (newSorting: keyof typeof AVAILABLE_SORTING) => {
  //     for (const key of Object.keys(AVAILABLE_SORTING)) {
  //       if (AVAILABLE_SORTING[key].sortingString === newSorting) {
  //         dispatch(setSorting(AVAILABLE_SORTING[key]));
  //         break;
  //       }
  //     }
  //   },
  //   [dispatch]
  // );

  // const handleOnChange = (newSorting: keyof typeof AVAILABLE_SORTING) => {
  //   setNewSorting(newSorting);
  // };

  // const options = Object.values(AVAILABLE_SORTING).map((value) => (
  //   <option key={value.sortingString} value={value.sortingString}>
  //     {value.friendlyName}
  //   </option>
  // ));

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const sortingOption = SORTING_OPTIONS.find(
        (opt) => opt.key === event.target.value
      );
      if (sortingOption) {
        dispatch(setSort(sortingOption));
      }
    },
    []
  );

  const total =
    searchResults.data?.items?.length != null
      ? searchResults.data?.pagingInfo.totalResult
      : 0;

  const resultsText = (
    <div className="rk-search-result-title">
      {total ? total : "No"} {total && total > 1 ? "results" : "result"}
      {query != null && (
        <span>
          {" "}
          for <span className="fw-bold">{`"${query}"`}</span>
        </span>
      )}
    </div>
  );

  const options = Object.values(SORTING_OPTIONS).map(({ key, label }) => (
    <option key={key} value={key}>
      {label}
    </option>
  ));

  return (
    <div
      className={cx("align-items-center", "d-flex", "justify-content-between")}
      data-cy="search-header"
    >
      <div className={cx("align-items-center", "d-flex", "gap-4")}>
        {resultsText}
      </div>
      <div className={cx("align-items-center", "d-flex")}>
        <label className={cx("mx-2", "sorting-label--desk")}>Sort by</label>
        <select
          className="form-select"
          data-cy="search-sorting-select"
          name="sorting"
          onChange={onChange}
          value={sort.key}
        >
          {options}
        </select>
      </div>
    </div>
  );
}
