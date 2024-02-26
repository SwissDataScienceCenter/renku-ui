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
import { useDispatch } from "react-redux";
import { Button, InputGroup } from "reactstrap";

import { setQuery } from "../searchV2.slice";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useStartNewSearch from "../useStartSearch.hook";

export default function SearchV2Bar() {
  const dispatch = useDispatch();
  const { search } = useAppSelector((state) => state.searchV2);
  const { startNewSearch } = useStartNewSearch();

  // focus search input when loading the component
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // handle pressing Enter to search
  // ? We could use react-hotkeys-hook if we wish to handle Enter also outside the input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      startNewSearch();
    }
  };

  // basic autocomplete for searched values, without duplicates
  const previousSearchEntries = Array.from(
    new Set(search.history.map((entry) => entry.query))
  ).map((value) => <option key={value} value={value} />);

  return (
    <InputGroup data-cy="search-bar">
      <input
        autoComplete="renku-search"
        className={cx("form-control", "rounded-0", "rounded-start")}
        data-cy="search-input"
        id="search-input"
        list="previous-searches"
        onChange={(e) => dispatch(setQuery(e.target.value))}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        ref={inputRef}
        tabIndex={-1}
        type="text"
        value={search.query}
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
