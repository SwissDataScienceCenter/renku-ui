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
import { useCallback, useEffect, useRef } from "react";
import { Button, Card, CardBody, Col, InputGroup, Row } from "reactstrap";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useDispatch } from "react-redux";
import {
  AVAILABLE_FILTERS,
  setQuery,
  setSearch,
  toggleFilter,
} from "./searchV2.slice";
import searchV2Api from "./searchV2.api";
import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { skipToken } from "@reduxjs/toolkit/query";

export default function SearchV2() {
  return (
    <>
      <Row className="mb-3">
        <Col>
          <h2>Search v2</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <SearchV2Bar />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <SearchV2Header currentSorting={availableSortingItems.scoreDesc} />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col xs={12} sm={4} lg={3}>
          <SearchV2Filters />
        </Col>
        <Col xs={12} sm={8} lg={9}>
          <SearchV2Results />
        </Col>
      </Row>
    </>
  );
}

function SearchV2Bar() {
  const dispatch = useDispatch();
  const { search } = useAppSelector((state) => state.searchV2);

  const [startSearch, searchResult] =
    searchV2Api.useLazyGetSearchResultsQuery();

  // focus search input when loading the component
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const startNewSearch = useCallback(() => {
    // this de-bounces the search by 1 second to prevent accidentally querying multiple times
    if (
      searchResult.fulfilledTimeStamp &&
      search.query === search.lastSearch &&
      +new Date() - searchResult.fulfilledTimeStamp < 1000
    )
      return;
    dispatch(setSearch(search.query));
    startSearch(search.query);
  }, [
    dispatch,
    search.lastSearch,
    search.query,
    searchResult.fulfilledTimeStamp,
    startSearch,
  ]);

  // handle pressing Enter to search
  // ? We could use react-hotkeys-hook if we wish to handle Enter also outside the input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      startNewSearch();
    }
  };

  // basic autocomplete for searched values, without duplicates
  const previousSearchEntries = Array.from(new Set(search.history)).map(
    (value) => <option key={value} value={value} />
  );

  return (
    <InputGroup>
      <input
        autoComplete="renku-search"
        className={cx("form-control", "rounded-0", "rounded-start")}
        data-cy="search-input"
        id="search-input"
        placeholder="Search..."
        ref={inputRef}
        tabIndex={-1}
        type="text"
        onChange={(e) => dispatch(setQuery(e.target.value))}
        onKeyDown={handleKeyDown}
        value={search.query}
        list="previous-searches"
      />
      {previousSearchEntries.length > 0 && (
        <datalist id="previous-searches">{previousSearchEntries}</datalist>
      )}
      <Button
        className="rounded-end"
        color="secondary"
        data-cy="search-button"
        id="search-button"
        onClick={startNewSearch}
      >
        Search
      </Button>
    </InputGroup>
  );
}

interface SearchV2FilterOptions {
  checked: boolean;
  key: string;
  value: string;
}
interface SearchV2FilterProps {
  name: string;
  options: SearchV2FilterOptions[];
  title: string;
  toggleOption: (key: string) => void;
}
function SearchV2Filter({
  name,
  options,
  title,
  toggleOption,
}: SearchV2FilterProps) {
  return (
    <SearchV2FilterContainer title={title}>
      {options.map(({ checked, key, value }) => {
        const id = `search-filter-${name}-${key}`;

        return (
          <div
            className={cx("form-rk-green", "d-flex", "align-items-center")}
            key={id}
          >
            <input
              className="form-check-input"
              id={id}
              type="checkbox"
              checked={checked}
              onChange={() => toggleOption(key)}
              data-cy={`user-role-${key}`}
            />
            <label
              className={cx("form-check-label", "ms-2", "mt-1")}
              htmlFor={id}
            >
              {value}
            </label>
          </div>
        );
      })}
    </SearchV2FilterContainer>
  );
}

interface SearchV2FilterContainerProps {
  children: React.ReactNode;
  title: string;
}
function SearchV2FilterContainer({
  children,
  title,
}: SearchV2FilterContainerProps) {
  return (
    <Card className={cx("border", "rounded")}>
      <CardBody>
        <p className={cx("form-text", "mb-1")}>{title}</p>
        {children}
      </CardBody>
    </Card>
  );
}

function SearchV2Filters() {
  const dispatch = useDispatch();
  const { filters } = useAppSelector((state) => state.searchV2);

  const filtersList = Object.entries(AVAILABLE_FILTERS).map(
    ([filterName, options]) => (
      <SearchV2Filter
        key={filterName}
        name={filterName}
        options={Object.entries(options).map(([key, value]) => ({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          checked: !!(filters as any)[filterName]?.includes(key),
          key,
          value,
        }))}
        title={filterName.charAt(0).toUpperCase() + filterName.slice(1)}
        toggleOption={(value) => {
          dispatch(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toggleFilter({ filter: filterName as any, value: value as any })
          );
        }}
      />
    )
  );

  return (
    <>
      <Row className="mb-3">
        <Col className="d-sm-none" xs={12}>
          <h3>Filters</h3>
        </Col>
        <Col className={cx("d-flex", "flex-column", "gap-3")}>
          {filtersList}

          <SearchV2FilterContainer title="Creation date">
            Not yet implemented
          </SearchV2FilterContainer>
        </Col>
      </Row>
    </>
  );
}

function SearchV2Results() {
  return (
    <Row>
      <Col className="d-sm-none" xs={12}>
        <h3>Results</h3>
      </Col>
      <Col>
        <SearchV2ResultsContent />
      </Col>
    </Row>
  );
}

function SearchV2ResultsContent() {
  // get the search state
  const { search } = useAppSelector((state) => state.searchV2);
  const searchResults = searchV2Api.endpoints.getSearchResults.useQueryState(
    search.lastSearch != null ? search.lastSearch : skipToken
  );

  if (searchResults.isFetching) {
    return <Loader />;
  }
  if (search.lastSearch == null) {
    return <p>Start searching by typing in the search bar above.</p>;
  }

  if (!searchResults.data?.length) {
    return (
      <>
        <p>
          No results for{" "}
          <span className="fw-bold">{`"${search.lastSearch}"`}</span>.
        </p>
        <p>You can try another search, or change some filters.</p>
      </>
    );
  }

  const resultsOutput = searchResults.data.map((entity) => {
    return (
      <Col key={entity.id} xs={12} lg={6}>
        <Card className={cx("border", "rounded")}>
          <CardBody>
            <h4 className="mb-0">{entity.name}</h4>
            <p className="form-text mb-0">
              {entity.slug} - {entity.visibility}
            </p>
            <p className="form-text text-rk-green">
              user-{entity.createdBy.id}
            </p>
            <p>{entity.description}</p>
            <p className="form-text mb-0">
              <TimeCaption datetime={entity.creationDate} prefix="Created" />
            </p>
          </CardBody>
        </Card>
      </Col>
    );
  });

  return <Row>{resultsOutput}</Row>;
}

interface SortingItem {
  friendlyName: string;
  sortingString: string;
}
interface SortingItems {
  [key: string]: SortingItem;
}
const availableSortingItems: SortingItems = {
  scoreDesc: {
    friendlyName: "Best match",
    sortingString: "matchingScore:desc",
  },
  dateDesc: {
    friendlyName: "Recently created",
    sortingString: "date:desc",
  },
  dateAsc: {
    friendlyName: "Older",
    sortingString: "date:asc",
  },
  titleAsc: {
    friendlyName: "Title: alphabetical",
    sortingString: "title:asc",
  },
  titleDesc: {
    friendlyName: "Title: reverse",
    sortingString: "title:desc",
  },
};

interface SearchV2ResultsHeaderProps {
  currentSorting: SortingItem;
  sortingItems?: SortingItems;
  total?: number;
}
const SearchV2Header = ({
  currentSorting,
  sortingItems = availableSortingItems,
  total,
}: SearchV2ResultsHeaderProps) => {
  const { search } = useAppSelector((state) => state.searchV2);
  const searchQuery = search.lastSearch;

  const options = Object.values(sortingItems).map((value) => (
    <option key={value.sortingString} value={value.sortingString}>
      {value.friendlyName}
    </option>
  ));
  const resultsText = (
    <div className="rk-search-result-title">
      {total ? total : "No"} {total && total > 1 ? "results" : "result"}
      {searchQuery && (
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
};
