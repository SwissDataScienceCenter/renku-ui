/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useCallback, useState } from "react";
import { Funnel, XCircleFill } from "react-bootstrap-icons";
import { Button, Form, Input, InputGroup } from "reactstrap";

interface AdminListFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  placeholder?: string;
}

export default function AdminListFilter({
  filter,
  onFilterChange,
  placeholder = "Filter by name...",
}: AdminListFilterProps) {
  const [filterInput, setFilterInput] = useState(filter);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onFilterChange(filterInput.trim());
    },
    [filterInput, onFilterChange],
  );
  const onClear = useCallback(() => {
    setFilterInput("");
    onFilterChange("");
  }, [onFilterChange]);

  return (
    <Form className="mb-3" onSubmit={onSubmit}>
      <InputGroup>
        <Input
          data-cy="filter-input"
          id="filter-input"
          onChange={(event) => setFilterInput(event.target.value)}
          placeholder={placeholder}
          value={filterInput}
        />
        <Button
          color="outline-secondary"
          className={cx(
            "border-0",
            "border-top",
            "border-bottom",
            "shadow-none",
          )}
          data-cy="filter-clear"
          disabled={!filterInput && !filter}
          onClick={onClear}
          id="filter-clear-button"
          type="button"
        >
          <XCircleFill />
        </Button>
        <Button
          color="primary"
          data-cy="filter-button"
          id="filter-button"
          type="submit"
        >
          <Funnel className="me-1" /> Filter
        </Button>
      </InputGroup>
    </Form>
  );
}
