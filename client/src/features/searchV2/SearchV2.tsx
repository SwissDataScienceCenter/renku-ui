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
import { useEffect, useRef } from "react";
import { Button, Card, CardBody, Col, InputGroup, Row } from "reactstrap";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { useDispatch } from "react-redux";
import { setQuery, setSearch } from "./searchV2.slice";

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

  // focus search input when loading the component
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const startNewSearch = () => {
    dispatch(setSearch(search.query));
  };

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
  return (
    <>
      <Row className="mb-3">
        <Col className={cx("d-flex", "flex-column", "gap-3")}>
          <SearchV2Filter
            name="visibility"
            options={[
              { checked: true, key: "public", value: "Public" },
              { checked: false, key: "private", value: "Private" },
            ]}
            title="Visibility"
            toggleOption={() => {}}
          />

          <SearchV2Filter
            name="entity-type"
            options={[
              { checked: true, key: "project", value: "Project" },
              { checked: true, key: "user", value: "User" },
            ]}
            title="Type"
            toggleOption={() => {}}
          />

          <SearchV2Filter
            name="role"
            options={[
              { checked: false, key: "creator", value: "Creator" },
              { checked: false, key: "member", value: "Member" },
              { checked: false, key: "none", value: "None" },
            ]}
            title="Role"
            toggleOption={() => {}}
          />

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
      <Col>
        <SearchV2ResultsContent />
      </Col>
    </Row>
  );
}

function SearchV2ResultsContent() {
  const { search } = useAppSelector((state) => state.searchV2);

  if (!search.lastSearch) {
    return <p>Start searching by typing in the search bar above.</p>;
  }

  return (
    <>
      <p>
        Search results for{" "}
        <span className="fw-bold">{`"${search.lastSearch}"`}</span> should
        appear here.
      </p>
      <p className="fw-italics">Not implemented yet 😢</p>
    </>
  );
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
