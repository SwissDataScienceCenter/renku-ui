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

import React from "react";
import Masonry from "react-masonry-css";
import { useHistory } from "react-router-dom";

import { KgSearchResult, ListResponse } from "../../../features/kgSearch/KgSearch";
import { mapSearchResultToEntity } from "../../helpers/KgSearchFunctions";
import { Loader } from "../Loader";
import ListCard from "../list/ListCard";
import { Pagination } from "../Pagination";

interface SearchResultProps {
  data?: ListResponse<KgSearchResult>;
  isFetching: boolean;
  isLoading: boolean;
  onPageChange: Function;
}

const SearchResultsContent = (
  { data, isFetching, isLoading, onPageChange }: SearchResultProps) => {
  const history = useHistory();
  if (isLoading) return <Loader />;
  if (isFetching) return <Loader />;
  if (data == null) return <Loader />;

  if (!data || data.total === 0)
    return (<p>We could not find any matching</p>);


  const rows = data.results
    .map((result, index) => {
      const entityProps = mapSearchResultToEntity(result, history);
      return <ListCard key={`entity-${index}`} {...entityProps} />;
    });

  const breakPointColumns = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1
  };

  const changePage = (value: number) => {
    if (onPageChange)
      onPageChange(value);
  };

  return (
    <>
      <Masonry
        className="rk-search-result-grid mb-4"
        breakpointCols= {breakPointColumns}>
        {rows}
      </Masonry>
      <Pagination
        currentPage={data.page}
        perPage={data.perPage}
        totalItems={data.total}
        onPageChange={changePage}
        className="d-flex justify-content-center rk-search-pagination" />
    </>
  );
};

export { SearchResultsContent };
