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
import { Card, CardBody, Col, Row } from "reactstrap";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { useCallback, useMemo } from "react";
import type {
  SearchEntityType,
  SearchEntityVisibility,
  SearchFilter,
  SearchFilters,
} from "../searchV2.types";
import { filtersAsArray } from "../searchV2.utils";
import {
  FILTER_KEY_LABELS,
  FILTER_VALUE_LABELS,
  ROLE_FILTER_ALLOWED_VALUES,
  TYPE_FILTER_ALLOWED_VALUES,
  VISIBILITY_FILTER_ALLOWED_VALUES,
} from "../searchV2.constants";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import {
  toggleRoleFilterValue,
  toggleTypeFilterValue,
  toggleVisibilityFilterValue,
} from "../searchV2.slice";
import type { Role } from "../../projectsV2/api/projectV2.api";

// import cx from "classnames";
// import React, { useCallback } from "react";
// import { useDispatch } from "react-redux";
// import { Card, CardBody, Col, Row } from "reactstrap";
// import { startCase } from "lodash-es";

// // import { setCreated, setCreatedBy, toggleFilter } from "../searchV2.slice";
// import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
// import {
//   DateFilter,
//   SearchV2FilterOptions,
//   SearchV2State,
// } from "../searchV2.types";
// import {
//   ANONYMOUS_USERS_EXCLUDE_FILTERS,
//   AVAILABLE_FILTERS,
// } from "../searchV2.utils";
// import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
// import { User } from "../../../model/renkuModels.types";
// import { SearchV2DateFilter } from "./SearchV2DateFilter.tsx";
// import { SearchV2UserFilter } from "./SearchV2UserFilter.tsx";

export default function SearchV2Filters() {
  // const dispatch = useDispatch();
  // const searchState = useAppSelector((state) => state.searchV2);
  // const { filters } = searchState;
  // const userLogged = useLegacySelector<User["logged"]>(
  //   (state) => state.stateModel.user.logged
  // );

  // const handleToggleFilter = useCallback(
  //   (filter: keyof SearchV2State["filters"], value: string | DateFilter) => {
  //     if (filter === "created") dispatch(setCreated(value as DateFilter));
  //     else dispatch(toggleFilter({ filter, value: value as string }));
  //   },
  //   [dispatch]
  // );

  // const filtersList = Object.entries(AVAILABLE_FILTERS)
  //   .filter(([filterName]) => {
  //     if (!userLogged)
  //       return !ANONYMOUS_USERS_EXCLUDE_FILTERS.includes(
  //         filterName as keyof typeof AVAILABLE_FILTERS
  //       );
  //     return true;
  //   })
  //   .map(([filterName, options]) => (
  //     <SearchV2Filter
  //       key={filterName}
  //       name={filterName}
  //       options={Object.entries(options as Object).map(([key, value]) => ({
  //         checked: (
  //           filters[filterName as keyof SearchV2State["filters"]] as string[]
  //         ).includes(key),
  //         key,
  //         value,
  //       }))}
  //       title={filterName.charAt(0).toUpperCase() + filterName.slice(1)}
  //       toggleOption={(value: string) => {
  //         handleToggleFilter(
  //           filterName as keyof SearchV2State["filters"],
  //           value
  //         );
  //       }}
  //     />
  //   ));

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

          {/* <SearchV2UserFilter
            createdBy={filters["createdBy"]}
            removeUserFilter={() => dispatch(setCreatedBy(""))}
          />
          {filtersList}
          <SearchV2DateFilter
            name="CreationDate"
            title="Creation Date"
            checked={filters["created"]}
            toggleOption={(value: DateFilter) => {
              handleToggleFilter("created", value);
            }}
          /> */}
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
      <CardBody>
        <p className={cx("form-text", "mb-1", "mt-0")}>{label}</p>
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
    <div className={cx("form-rk-green", "d-flex", "align-items-center")}>
      <input
        checked={isChecked}
        className="form-check-input"
        data-cy={id}
        id={id}
        onChange={onToggle}
        type="checkbox"
      />
      <label className={cx("form-check-label", "ms-2", "mt-1")} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
