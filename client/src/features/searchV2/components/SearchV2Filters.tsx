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
import { useCallback, useMemo } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import type { Role } from "../../projectsV2/api/projectsV2.api";
import {
  FILTER_KEY_LABELS,
  FILTER_VALUE_LABELS,
  ROLE_FILTER_ALLOWED_VALUES,
  TYPE_FILTER_ALLOWED_VALUES,
  VISIBILITY_FILTER_ALLOWED_VALUES,
} from "../searchV2.constants";
import {
  toggleRoleFilterValue,
  toggleTypeFilterValue,
  toggleVisibilityFilterValue,
} from "../searchV2.slice";
import type {
  SearchEntityType,
  SearchEntityVisibility,
  SearchFilter,
} from "../searchV2.types";
import { filtersAsArray } from "../searchV2.utils";
import SearchV2DateFilters from "./SearchV2DateFilters";

export default function SearchV2Filters() {
  const { filters } = useAppSelector(({ searchV2 }) => searchV2);

  const filtersArray = useMemo(() => filtersAsArray(filters), [filters]);

  return (
    <>
      <Row className="mb-3" data-cy="search-filters">
        <Col className="d-sm-none" xs={12}>
          <h3>Filters</h3>
        </Col>
        <Col className={cx("d-flex", "flex-column", "gap-3")}>
          {filtersArray.map((filter) => (
            <SearchV2Filter key={filter.key} filter={filter} />
          ))}
          <SearchV2DateFilters />
        </Col>
      </Row>
    </>
  );
}

interface SearchV2FilterProps {
  filter: SearchFilter;
}

function SearchV2Filter({ filter }: SearchV2FilterProps) {
  const { key } = filter;

  const { label } = FILTER_KEY_LABELS[key];

  const options =
    key === "role"
      ? ROLE_FILTER_ALLOWED_VALUES
      : key === "type"
      ? TYPE_FILTER_ALLOWED_VALUES
      : key === "visibility"
      ? VISIBILITY_FILTER_ALLOWED_VALUES
      : [];

  return (
    <Card className={cx("border", "rounded")} data-cy={`search-filter-${key}`}>
      <CardHeader>
        <h6 className="mb-0">{label}</h6>
      </CardHeader>
      <CardBody>
        {options.map((option) => (
          <SearchV2FilterOption key={option} filter={filter} option={option} />
        ))}
      </CardBody>
    </Card>
  );
}

interface SearchV2FilterOptionProps {
  filter: SearchFilter;
  option: SearchFilter["values"][number];
}

function SearchV2FilterOption({ filter, option }: SearchV2FilterOptionProps) {
  const { key, values } = filter;

  const isChecked = useMemo(
    () => !!values.find((value) => value === option),
    [option, values]
  );

  const dispatch = useAppDispatch();

  const onToggle = useCallback(() => {
    if (key === "role") {
      dispatch(toggleRoleFilterValue(option as Role));
      return;
    }
    if (key === "type") {
      dispatch(toggleTypeFilterValue({ value: option as SearchEntityType }));
      return;
    }
    if (key === "visibility") {
      dispatch(toggleVisibilityFilterValue(option as SearchEntityVisibility));
    }
  }, [dispatch, key, option]);

  const id = `search-filter-${key}-${option}`;

  const { label } = FILTER_VALUE_LABELS[option];

  return (
    <div className={cx("d-flex", "gap-2")}>
      <input
        checked={isChecked}
        className="form-check-input"
        data-cy={id}
        id={id}
        onChange={onToggle}
        type="checkbox"
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
