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
import cx from "classnames";
import React, { useCallback } from "react";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { searchV2Api } from "../api/searchV2Api.api";
import { SORT_BY_ALLOWED_VALUES, SORT_BY_LABELS } from "../searchV2.constants";
import { setSortBy } from "../searchV2.slice";

export default function SearchV2Header() {
  const dispatch = useAppDispatch();
  const { page, perPage, query, sortBy } = useAppSelector(
    ({ searchV2 }) => searchV2
  );

  const searchResults = searchV2Api.endpoints.getSearchQuery.useQueryState({
    params: {
      page,
      per_page: perPage,
      q: query,
    },
  });

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const sortBy = SORT_BY_ALLOWED_VALUES.find(
        (opt) => opt === event.target.value
      );
      if (sortBy) {
        dispatch(setSortBy({ key: "sort", value: sortBy }));
      }
    },
    [dispatch]
  );

  const total =
    searchResults.data?.items?.length != null
      ? searchResults.data?.pagingInfo.totalResult
      : 0;

  const resultsText = (
    <div className="rk-search-result-title">
      {searchResults.isFetching ? (
        "Loading results"
      ) : (
        <>
          {total ? total : "No"} {total && total > 1 ? "results" : "result"}
        </>
      )}
      {query && (
        <span>
          {" "}
          for <span className="fw-bold">{`"${query}"`}</span>
        </span>
      )}
    </div>
  );

  const options = Object.entries(SORT_BY_LABELS).map(([key, { label }]) => (
    <option key={key} value={key}>
      {label}
    </option>
  ));

  return (
    <div
      className={cx(
        "align-items-md-center",
        "d-flex",
        "gap-3",
        "justify-content-between",
        "flex-column",
        "flex-md-row"
      )}
      data-cy="search-header"
    >
      <div className={cx("d-flex", "gap-3")}>{resultsText}</div>
      <div className={cx("align-items-center", "d-flex", "gap-2")}>
        <label className={cx("text-nowrap")}>Sort by</label>
        <select
          className={cx("form-select", "w-auto")}
          data-cy="search-sorting-select"
          name="sorting"
          onChange={onChange}
          value={sortBy.value}
        >
          {options}
        </select>
      </div>
    </div>
  );
}
