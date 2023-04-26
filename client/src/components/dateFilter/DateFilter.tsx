/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import React, { ChangeEvent } from "react";
import { Input } from "../../utils/ts-wrappers";
import Time from "../../utils/helpers/Time";

/**
 *  renku-ui
 *
 *  DateFilter.tsx
 *  Date filter component
 */

export interface DateFilterProps {
  dates: DatesFilter;
  onDatesChange: (dates: DatesFilter) => void;
}

/* eslint-disable no-unused-vars */
export enum DateFilterTypes {
  all = "all",
  custom = "custom",
  last90days = "last90days",
  lastMonth = "lastMonth",
  lastWeek = "lastWeek",
  older = "older", // before 90 days
}
/* eslint-enable no-unused-vars */

export function stringToDateFilter(str: string) {
  return Object.values(DateFilterTypes).includes(str as DateFilterTypes)
    ? (str as DateFilterTypes)
    : undefined;
}

export function dateFilterTypeToSinceAndUntil(typeDate: DateFilterTypes) {
  let from, to;
  const today = new Date();
  switch (typeDate) {
    case DateFilterTypes.last90days:
      to = today;
      from = new Date(new Date().setDate(to.getDate() - 90));
      break;
    case DateFilterTypes.lastMonth:
      to = today;
      from = new Date(new Date().setDate(to.getDate() - 30));
      break;
    case DateFilterTypes.lastWeek:
      to = today;
      from = new Date(new Date().setDate(to.getDate() - 7));
      break;
    case DateFilterTypes.older:
      to = new Date(new Date().setDate(today.getDate() - 90));
      break;
    default:
      from = "";
      to = "";
      break;
  }
  const since = from ? Time.toIsoTimezoneString(from, "date") : "";
  const until = to ? Time.toIsoTimezoneString(to, "date") : "";
  return { since, until };
}

export interface DatesFilter {
  since?: string;
  until?: string;
  type?: DateFilterTypes;
}

const DateFilter = ({ onDatesChange, dates }: DateFilterProps) => {
  const changeDateType = React.useCallback(
    (typeDate: DateFilterTypes) => {
      const { since, until } = dateFilterTypeToSinceAndUntil(typeDate);
      onDatesChange({ since, until, type: typeDate });
    },
    [onDatesChange]
  );

  const items = [
    { title: "All", value: DateFilterTypes.all },
    { title: "Last Week", value: DateFilterTypes.lastWeek },
    { title: "Last Month", value: DateFilterTypes.lastMonth },
    { title: "Last 90 days", value: DateFilterTypes.last90days },
    { title: "Older", value: DateFilterTypes.older },
    { title: "Custom", value: DateFilterTypes.custom },
  ];
  const datesInput =
    dates.type === DateFilterTypes.custom ? (
      <>
        <div>
          <label className="px-2 author-label">From:</label>
          <Input
            type="date"
            name="start"
            max={Time.toIsoTimezoneString(new Date(), "date")}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onDatesChange({ ...dates, since: e.target.value })
            }
            value={dates.since}
          />
        </div>
        <div>
          <label className="px-2 author-label">To:</label>
          <Input
            type="date"
            name="end"
            max={Time.toIsoTimezoneString(new Date(), "date")}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onDatesChange({ ...dates, until: e.target.value })
            }
            value={dates.until}
          />
        </div>
      </>
    ) : null;

  const options = items.map((item) => {
    const nameInput = `author-${item.value}`;
    return (
      <div className="form-rk-green d-flex align-items-center" key={nameInput}>
        <Input
          type="radio"
          name="date-filter"
          value={item.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            changeDateType(e.target.value as DateFilterTypes)
          }
          className="author-input"
          checked={dates.type === item.value}
          data-cy={nameInput}
        />
        <label
          className="px-2 author-label cursor-pointer"
          onClick={() => changeDateType(item.value)}
        >
          {item.title}
        </label>
      </div>
    );
  });
  return (
    <div className="input-filter-box">
      <h3 className="filter-label">Creation Date</h3>
      {options}
      {datesInput}
    </div>
  );
};

export { DateFilter };
