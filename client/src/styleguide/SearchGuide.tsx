/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import React, { useState } from "react";

import { Loader } from "../utils/components/Loader";
import { Pagination } from "../utils/components/Pagination";
import { KgSearchResult, ListResponse } from "../features/kgSearch/KgSearch";
import { useSearchEntitiesQuery } from "../features/kgSearch/KgSearchApi";
import { SortingOptions } from "../utils/components/sortingEntities/SortingEntities";

function SearchResultRow(props: { index: number; row: {} }) {
  const { index, row } = props;
  return (
    <tr>
      <th scope="row">{index}</th>
      <td>{JSON.stringify(row)}</td>
    </tr>
  );
}

function SearchResultsTable(props: {
  data?: ListResponse<KgSearchResult>;
  isFetching: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  const { data, isFetching, isLoading, onPageChange } = props;
  if (isLoading) return <Loader />;
  if (isFetching) return <Loader />;
  if (data == null) return <Loader />;

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>Row</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data?.results.map((r, i) => (
            <SearchResultRow key={i} index={i} row={r} />
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={data.page}
        perPage={data.perPage}
        totalItems={data.total}
        onPageChange={onPageChange}
        className="d-flex justify-content-center rk-search-pagination"
      />
    </>
  );
}

function SearchGuide() {
  const [page, setPage] = useState(1);
  const { data, isFetching, isLoading } = useSearchEntitiesQuery({
    phrase: "*",
    sort: SortingOptions.AscTitle,
    page,
    perPage: 1,
    author: "all",
    userName: undefined,
    type: {
      project: true,
      dataset: true,
    },
  });
  return (
    <>
      <h2>Search</h2>
      <SearchResultsTable
        data={data}
        isFetching={isFetching}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </>
  );
}

export default SearchGuide;
