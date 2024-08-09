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
 * limitations under the License.
 */

import cx from "classnames";
import { DateTime } from "luxon";
import { useCallback, useMemo, useState } from "react";
import { Col } from "reactstrap";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import {
  CREATION_DATE_FILTER_PREDEFINED_FILTERS,
  DATE_FILTER_AFTER_VALUE_LABELS,
  DATE_FILTER_BEFORE_VALUE_LABELS,
  FILTER_KEY_LABELS,
} from "../searchV2.constants";
import { selectCreationDateFilter } from "../searchV2.slice";
import type { SearchDateFilter } from "../searchV2.types";
import { SearchV2Visualization } from "./SearchV2Filters.types";
import { SearchV2FilterContainer } from "./SearchV2Filters";

interface SearchV2DateFilterProps {
  dateFilter: SearchDateFilter;
  index: number;
  visualization: SearchV2Visualization;
}
export default function SearchV2DateFilter({
  dateFilter,
  index,
  visualization,
}: SearchV2DateFilterProps) {
  const { key } = dateFilter;
  const { label } = FILTER_KEY_LABELS[key];

  const predefinedOptions =
    key === "created" ? CREATION_DATE_FILTER_PREDEFINED_FILTERS : [];

  return (
    <SearchV2FilterContainer
      filterKey={key}
      filterName={label}
      index={index}
      visualization={visualization}
    >
      {predefinedOptions.map((option) => (
        <Col xs={6} sm={12} key={option.optionKey}>
          <SearchV2DateFilterOption
            dateFilter={dateFilter}
            option={option.filter}
            optionKey={option.optionKey}
            visualization={visualization}
          />
        </Col>
      ))}
      <Col xs={6} sm={12}>
        <SearchV2DateFilterCustomOption
          dateFilter={dateFilter}
          visualization={visualization}
        />
      </Col>
    </SearchV2FilterContainer>
  );
}

interface SearchV2DateFilterOptionProps {
  dateFilter: SearchDateFilter;
  option: SearchDateFilter;
  optionKey: string;
  visualization: SearchV2Visualization;
}

function SearchV2DateFilterOption({
  dateFilter,
  option,
  optionKey,
  visualization,
}: SearchV2DateFilterOptionProps) {
  const { value } = option;
  const { after, before } = value;

  const isChecked = useMemo(
    () =>
      option.value.after === dateFilter.value.after &&
      option.value.before === dateFilter.value.before,
    [dateFilter.value, option.value]
  );

  const dispatch = useAppDispatch();

  const onChange = useCallback(() => {
    if (dateFilter.key === "created") {
      dispatch(selectCreationDateFilter(option));
    }
  }, [dateFilter.key, dispatch, option]);

  const { label } =
    typeof after === "string"
      ? DATE_FILTER_AFTER_VALUE_LABELS[after]
      : typeof before === "string"
      ? DATE_FILTER_BEFORE_VALUE_LABELS[before]
      : { label: "All" };

  const id = `search-filter-${dateFilter.key}-${optionKey}`;

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
        onChange={onChange}
        type="radio"
      />
      <label
        className={cx(
          visualization === "accordion"
            ? ["btn", "btn-outline-primary", "text-nowrap", "w-100"]
            : "form-check-label"
        )}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
}

interface SearchV2DateFilterCustomOptionProps {
  dateFilter: SearchDateFilter;
  visualization: SearchV2Visualization;
}

function SearchV2DateFilterCustomOption({
  dateFilter,
  visualization,
}: SearchV2DateFilterCustomOptionProps) {
  const [today] = useState(DateTime.now().startOf("day"));

  const id = `search-filter-${dateFilter.key}-custom`;

  const isChecked = useMemo(
    () =>
      (dateFilter.value.after != null &&
        typeof dateFilter.value.after !== "string") ||
      (dateFilter.value.before != null &&
        typeof dateFilter.value.before !== "string"),
    [dateFilter.value.after, dateFilter.value.before]
  );

  const afterDate = useMemo(
    () =>
      typeof dateFilter.value.after === "object"
        ? dateFilter.value.after.date
        : null,
    [dateFilter.value.after]
  );
  const beforeDate = useMemo(
    () =>
      typeof dateFilter.value.before === "object"
        ? dateFilter.value.before.date
        : null,
    [dateFilter.value.before]
  );

  const dispatch = useAppDispatch();

  const onChange = useCallback(() => {
    if (dateFilter.key === "created" && !isChecked) {
      dispatch(
        selectCreationDateFilter({
          key: "created",
          value: { before: { date: today } },
        })
      );
    }
  }, [dateFilter.key, dispatch, isChecked, today]);

  const onChangeAfter = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value == "") {
        dispatch(
          selectCreationDateFilter({
            ...dateFilter,
            value: { ...dateFilter.value, after: undefined },
          })
        );
        return;
      }

      const newAfter = DateTime.fromISO(event.target.value, { zone: "utc" });
      if (newAfter.isValid) {
        dispatch(
          selectCreationDateFilter({
            ...dateFilter,
            value: { ...dateFilter.value, after: { date: newAfter } },
          })
        );
      }
    },
    [dateFilter, dispatch]
  );

  const onChangeBefore = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value == "") {
        dispatch(
          selectCreationDateFilter({
            ...dateFilter,
            value: { ...dateFilter.value, before: undefined },
          })
        );
        return;
      }

      const newBefore = DateTime.fromISO(event.target.value, { zone: "utc" });
      if (newBefore.isValid) {
        dispatch(
          selectCreationDateFilter({
            ...dateFilter,
            value: { ...dateFilter.value, before: { date: newBefore } },
          })
        );
      }
    },
    [dateFilter, dispatch]
  );

  return (
    <>
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
          onChange={onChange}
          type="radio"
        />
        <label
          className={cx(
            visualization === "accordion"
              ? ["btn", "btn-outline-primary", "text-nowrap", "w-100"]
              : "form-check-label"
          )}
          htmlFor={id}
        >
          Custom
        </label>
      </div>
      {isChecked && (
        <>
          <div>
            <label>From:</label>
            <input
              className="form-control"
              type="date"
              name="after"
              max={today.toISODate()}
              onChange={onChangeAfter}
              value={afterDate?.toISODate() ?? ""}
            />
          </div>
          <div>
            <label>To:</label>
            <input
              className="form-control"
              type="date"
              name="before"
              max={today.toISODate()}
              onChange={onChangeBefore}
              value={beforeDate?.toISODate() ?? ""}
            />
          </div>
        </>
      )}
    </>
  );
}
