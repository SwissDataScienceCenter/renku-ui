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
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledAccordion,
} from "reactstrap";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import type { Role } from "../../projectsV2/api/projectV2.api";
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
import { dateFiltersAsArray, filtersAsArray } from "../searchV2.utils";
import SearchV2DateFilter from "./SearchV2DateFilters";
import { SearchV2Visualization } from "./SearchV2Filters.types";

export default function SearchV2Filters() {
  const { filters } = useAppSelector(({ searchV2 }) => searchV2);
  const { dateFilters } = useAppSelector(({ searchV2 }) => searchV2);

  const filtersArray = useMemo(() => filtersAsArray(filters), [filters]);
  const dateFiltersArray = useMemo(
    () => dateFiltersAsArray(dateFilters),
    [dateFilters]
  );

  const content = useCallback(
    (visualization: SearchV2Visualization) => {
      return (
        <>
          {filtersArray.map((filter, index) => (
            <SearchV2Filter
              key={filter.key}
              filter={filter}
              index={index}
              visualization={visualization}
            />
          ))}
          {dateFiltersArray.map((dateFilter, index) => (
            <SearchV2DateFilter
              key={dateFilter.key}
              dateFilter={dateFilter}
              index={filtersArray.length + index}
              visualization={visualization}
            />
          ))}
        </>
      );
    },
    [dateFiltersArray, filtersArray]
  );

  return (
    <div className="mb-3">
      <h4 className="d-sm-none">Filters</h4>
      <UncontrolledAccordion
        className={cx("d-block", "d-sm-none")}
        defaultOpen={[]}
        toggle={() => {}}
      >
        {content("accordion")}
      </UncontrolledAccordion>
      <ListGroup flush className={cx("d-none", "d-sm-block")}>
        {content("list")}
      </ListGroup>
    </div>
  );
}

interface SearchV2FilterContainerProps {
  children: React.ReactNode;
  filterKey: string;
  filterName: string;
  index: number;
  visualization: SearchV2Visualization;
}
export function SearchV2FilterContainer({
  children,
  filterKey,
  filterName,
  index,
  visualization,
}: SearchV2FilterContainerProps) {
  const targetIndex = index.toString();
  return visualization === "accordion" ? (
    <AccordionItem data-cy={`search-filter-${filterKey}`}>
      <AccordionHeader targetId={targetIndex}>
        <h6 className={cx("fw-semibold", "mb-0")}>{filterName}</h6>
      </AccordionHeader>
      <AccordionBody accordionId={targetIndex}>
        <Row className={cx("g-3", "g-sm-0")}>{children}</Row>
      </AccordionBody>
    </AccordionItem>
  ) : (
    <ListGroupItem
      className={cx("mb-3", "px-0", "pt-0")}
      data-cy={`search-filter-${filterKey}`}
    >
      <h6 className="fw-semibold">{filterName}</h6>
      <div>{children}</div>
    </ListGroupItem>
  );
}

interface SearchV2FilterProps {
  filter: SearchFilter;
  index: number;
  visualization: SearchV2Visualization;
}
function SearchV2Filter({ filter, index, visualization }: SearchV2FilterProps) {
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
    <SearchV2FilterContainer
      filterKey={key}
      filterName={label}
      index={index}
      visualization={visualization}
    >
      {options.map((option) => (
        <Col xs={6} sm={12} key={option}>
          <SearchV2FilterOption
            filter={filter}
            option={option}
            visualization={visualization}
          />
        </Col>
      ))}
    </SearchV2FilterContainer>
  );
}

interface SearchV2FilterOptionProps {
  filter: SearchFilter;
  option: SearchFilter["values"][number];
  visualization: SearchV2Visualization;
}

function SearchV2FilterOption({
  filter,
  option,
  visualization,
}: SearchV2FilterOptionProps) {
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

  const { icon: Icon, label } = FILTER_VALUE_LABELS[option];

  return (
    <div
      className={cx(
        visualization === "accordion" ? "w-100" : ["d-flex", "gap-2"]
      )}
    >
      <input
        checked={isChecked}
        className={cx(
          visualization === "accordion" ? "btn-check" : "form-check-input"
        )}
        data-cy={id}
        id={id}
        onChange={onToggle}
        type="checkbox"
      />
      <label
        className={cx(
          visualization === "accordion"
            ? ["btn", "btn-outline-primary", "text-nowrap", "w-100"]
            : "form-check-label"
        )}
        htmlFor={id}
      >
        {Icon && <Icon className={cx("bi", "me-2")} />}
        {label}
      </label>
    </div>
  );
}
