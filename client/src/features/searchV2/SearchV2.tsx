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
import { useEffect, useRef, useState } from "react";
import { Button, InputGroup } from "reactstrap";

export default function SearchV2() {
  const [doSearch, setDoSearch] = useState(false);

  return (
    <>
      <h2>Search v2</h2>
      <SearchV2Bar search={() => setDoSearch(true)} />
      {doSearch && <SearchV2Results />}
    </>
  );
}

interface SearchV2BarProps {
  search: () => void;
}
function SearchV2Bar({ search }: SearchV2BarProps) {
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
      search();
    }
  };

  return (
    <InputGroup>
      <input
        className={cx("form-control", "rounded-0", "rounded-start")}
        data-cy="search-input"
        id="search-input"
        placeholder="Search..."
        ref={inputRef}
        tabIndex={-1}
        type="text"
        onKeyDown={handleKeyDown}
      />
      <Button
        className="rounded-end"
        color="secondary"
        data-cy="search-button"
        id="search-button"
        onClick={search}
      >
        Search
      </Button>
    </InputGroup>
  );
}

function SearchV2Results() {
  return <div>Search results -- WIP</div>;
}
