import { DateFilter } from "../searchV2.types.ts";
import { DateFilterTypes } from "../../../components/dateFilter/DateFilter.tsx";
import { Input } from "../../../utils/ts-wrappers.jsx";
import { ChangeEvent } from "react";
import cx from "classnames";
import { DateTime } from "luxon";
import { SearchV2FilterContainer } from "./SearchV2Filters.tsx";
import { AVAILABLE_DATE_FILTERS } from "../searchV2.utils.ts";

interface SearchV2DateFilterProps {
  name: string;
  checked: DateFilter;
  title: string;
  toggleOption: (key: DateFilter) => void;
}
export function SearchV2DateFilter({
  name,
  title,
  checked,
  toggleOption,
}: SearchV2DateFilterProps) {
  const now = DateTime.utc();
  const datesInput = checked.option === DateFilterTypes.custom && (
    <>
      <div>
        <label className="px-2 author-label">From:</label>
        <Input
          type="date"
          name="start"
          max={now.toISODate()}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            toggleOption({ ...checked, from: e.target.value })
          }
          value={checked.from || ""}
        />
      </div>
      <div>
        <label className="px-2 author-label">To:</label>
        <Input
          type="date"
          name="end"
          max={now.toISODate()}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            toggleOption({ ...checked, to: e.target.value })
          }
          value={checked.to || ""}
        />
      </div>
    </>
  );

  const filterKeys = Object.keys(AVAILABLE_DATE_FILTERS) as string[];
  return (
    <SearchV2FilterContainer name={name} title={title}>
      {filterKeys.map((key) => {
        const label = AVAILABLE_DATE_FILTERS[key].friendlyName;
        const id = `search-filter-${name}-${key}`;
        const isChecked = key === checked.option;

        return (
          <div
            className={cx("form-rk-green", "d-flex", "align-items-center")}
            key={id}
          >
            <input
              checked={isChecked}
              className="form-check-input"
              data-cy={id}
              id={id}
              onChange={() => toggleOption({ option: key as DateFilterTypes })}
              type="radio"
            />
            <label
              className={cx("form-check-label", "ms-2", "mt-1")}
              htmlFor={id}
            >
              {label}
            </label>
          </div>
        );
      })}
      {datesInput}
    </SearchV2FilterContainer>
  );
}
