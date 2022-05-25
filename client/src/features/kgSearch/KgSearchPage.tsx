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
import { useDispatch } from "react-redux";

import { Col, Row } from "../../utils/ts-wrappers";
import { SortingOptions } from "../../utils/components/sortingEntities/SortingEntities";
import { FilterEntitySearch } from "../../utils/components/entitySearchFilter/EntitySearchFilter";
import { SearchResultsHeader } from "../../utils/components/searchResultsHeader/SearchResultsHeader";
import { SearchResultsContent } from "../../utils/components/searchResultsContent/SearchResultsContent";
import { useSearchEntitiesQuery } from "./KgSearchApi";
import { setPage, setSort, useKgSearchFormSelector } from "./KgSearchSlice";

const TOTAL_PER_PAGE = 20;

interface SearchPageProps {
  userName?: string;
}

function SearchPage({ userName }: SearchPageProps) {
  const { phrase, sort, page, type, author, visibility } =
    useKgSearchFormSelector((state) => state.kgSearchForm);

  const dispatch = useDispatch();
  const searchRequest = {
    phrase,
    sort,
    page,
    perPage: TOTAL_PER_PAGE,
    author,
    type,
    visibility,
    userName,
  };

  const { data, isFetching, isLoading } = useSearchEntitiesQuery(searchRequest);
  const filter = (
    <div className="bg-white p-4 rounded-2">
      <FilterEntitySearch authorDefaultValue={author} />
    </div>
  );
  return (
    <>
      <Row>
        <Col className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-2 pb-2">{filter}</Col>
        <Col className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-10">
          <SearchResultsHeader
            total={data?.total}
            phrase={phrase}
            sort={sort}
            handleSort={(value: SortingOptions) => dispatch(setSort(value))} />
          <SearchResultsContent
            data={data}
            isFetching={isFetching}
            isLoading={isLoading}
            onPageChange={(value: number) => dispatch(setPage(value))}
          />
        </Col>
      </Row>
    </>
  );
}

export default SearchPage;
