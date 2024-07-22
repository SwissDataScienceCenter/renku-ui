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
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Card, CardBody, Col, Row } from "reactstrap";
import { startCase } from "lodash-es";

// import { setCreated, setCreatedBy, toggleFilter } from "../searchV2.slice";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import {
  DateFilter,
  SearchV2FilterOptions,
  SearchV2State,
} from "../searchV2.types";
import {
  ANONYMOUS_USERS_EXCLUDE_FILTERS,
  AVAILABLE_FILTERS,
} from "../searchV2.utils";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { User } from "../../../model/renkuModels.types";
import { SearchV2DateFilter } from "./SearchV2DateFilter.tsx";
import { SearchV2UserFilter } from "./SearchV2UserFilter.tsx";

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

  return (
    <>
      <Row className="mb-3" data-cy="search-filters">
        <Col className="d-sm-none" xs={12}>
          <h3>Filters</h3>
        </Col>
        <Col className={cx("d-flex", "flex-column", "gap-3")}>
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

interface SearchV2FilterContainerProps {
  children: React.ReactNode;
  name: string;
  title: string;
}
export function SearchV2FilterContainer({
  children,
  name,
  title,
}: SearchV2FilterContainerProps) {
  return (
    <Card className={cx("border", "rounded")}>
      <div data-cy={`search-filter-${name}`}>
        <CardBody>
          <p className={cx("form-text", "mb-1", "mt-0")}>{title}</p>
          {children}
        </CardBody>
      </div>
    </Card>
  );
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
    <SearchV2FilterContainer name={name} title={title}>
      {options.map(({ checked, key, value }) => {
        const id = `search-filter-${name}-${key}`;

        return (
          <div
            className={cx("form-rk-green", "d-flex", "align-items-center")}
            key={id}
          >
            <input
              checked={checked}
              className="form-check-input"
              data-cy={id}
              id={id}
              onChange={() => toggleOption(key)}
              type="checkbox"
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
