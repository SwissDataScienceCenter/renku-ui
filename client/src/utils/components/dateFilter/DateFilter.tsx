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
import * as React from "react";
import { Input } from "../../ts-wrappers";
import { ChangeEvent, useEffect, useState } from "react";
import Time from "../../helpers/Time";

/**
 *  renku-ui
 *
 *  DateFilter.tsx
 *  Date filter component
 */

export interface DateFilterProps {
  handler: Function;
  values: DatesFilter;
}

/* eslint-disable no-unused-vars */
export enum dateFilterTypes {
  all = "all",
  custom = "custom",
  last90days = "last90days",
  lastMonth = "lastMonth",
  lastWeek = "lastWeek",
  older = "older" // before 90 days
}

export interface DatesFilter {
  since?: string;
  until?: string;
  type?: dateFilterTypes;
}
/* eslint-enable no-unused-vars */

const DateFilter = ({ handler, values }: DateFilterProps) => {
  const [dates, setDates] = useState<DatesFilter>({});

  useEffect(() => {
    setDates(values);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (handler)
      handler(dates);
  }, [dates]); // eslint-disable-line

  const changeDateType = (typeDate: dateFilterTypes) => {
    let from, to;
    const today = new Date();
    switch (typeDate) {
      case dateFilterTypes.last90days:
        to = today;
        from = new Date(new Date().setDate(to.getDate() - 90));
        break;
      case dateFilterTypes.lastMonth:
        to = today;
        from = new Date(new Date().setDate(to.getDate() - 30));
        break;
      case dateFilterTypes.lastWeek:
        to = today;
        from = new Date(new Date().setDate(to.getDate() - 7));
        break;
      case dateFilterTypes.older:
        to = new Date(new Date().setDate(today.getDate() - 90));
        break;
      default:
        from = "";
        to = "";
        break;
    }

    setDates({
      since: from ? Time.toIsoString(from, "date") : "",
      until: to ? Time.toIsoString(to, "date") : "",
      type: typeDate,
    });
  };

  const items = [
    { title: "All", value: dateFilterTypes.all },
    { title: "Last Week", value: dateFilterTypes.lastWeek },
    { title: "Last Month", value: dateFilterTypes.lastMonth },
    { title: "Last 90 days", value: dateFilterTypes.last90days },
    { title: "Older", value: dateFilterTypes.older },
    { title: "Custom", value: dateFilterTypes.custom },
  ];
  const datesInput = values.type === dateFilterTypes.custom ?
    <>
      <div>
        <label className="px-2 author-label">From:</label>
        <Input type="date" name="start"
          max={new Date().toISOString().split("T")[0]}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDates({ ...dates, since: e.target.value })}/>
      </div>
      <div>
        <label className="px-2 author-label">To:</label>
        <Input type="date" name="end"
          max={new Date().toISOString().split("T")[0]}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDates({ ...dates, until: e.target.value })}/>
      </div>
    </>
    : null;

  const options = items.map(item => {
    const nameInput = `author-${item.value}`;
    return (
      <div className="form-rk-green d-flex align-items-center" key={nameInput}>
        <Input
          type="radio"
          name="date-filter"
          value={item.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => changeDateType(e.target.value as dateFilterTypes)}
          className="author-input"
          checked={values.type === item.value}
          data-cy={nameInput}/>
        <label className="px-2 author-label cursor-pointer"
          onClick={() => changeDateType(item.value)}>{item.title}</label>
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
