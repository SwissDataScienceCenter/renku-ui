// /*!
//  * Copyright 2024 - Swiss Data Science Center (SDSC)
//  * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
//  * Eidgenössische Technische Hochschule Zürich (ETHZ).
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *      http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// import cx from "classnames";
// import { DateTime } from "luxon";
// import { ChangeEvent } from "react";
// import { Input } from "reactstrap";

// import { DateFilter } from "../searchV2.types.ts";
// import { DateFilterTypes } from "../../../components/dateFilter/DateFilter.tsx";
// import { SearchV2FilterContainer } from "./SearchV2Filters.tsx";
// import { AVAILABLE_DATE_FILTERS } from "../searchV2.utils.ts";

// interface SearchV2DateFilterProps {
//   name: string;
//   checked: DateFilter;
//   title: string;
//   toggleOption: (key: DateFilter) => void;
// }
// export function SearchV2DateFilter({
//   name,
//   title,
//   checked,
//   toggleOption,
// }: SearchV2DateFilterProps) {
//   const now = DateTime.utc();
//   const datesInput = checked.option === DateFilterTypes.custom && (
//     <>
//       <div>
//         <label className="px-2 author-label">From:</label>
//         <Input
//           type="date"
//           name="start"
//           max={now.toISODate()}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             toggleOption({ ...checked, from: e.target.value })
//           }
//           value={checked.from || ""}
//         />
//       </div>
//       <div>
//         <label className="px-2 author-label">To:</label>
//         <Input
//           type="date"
//           name="end"
//           max={now.toISODate()}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             toggleOption({ ...checked, to: e.target.value })
//           }
//           value={checked.to || ""}
//         />
//       </div>
//     </>
//   );

//   const filterKeys = Object.keys(AVAILABLE_DATE_FILTERS) as string[];
//   return (
//     <SearchV2FilterContainer name={name} title={title}>
//       {filterKeys.map((key) => {
//         const label = AVAILABLE_DATE_FILTERS[key].friendlyName;
//         const id = `search-filter-${name}-${key}`;
//         const isChecked = key === checked.option;

//         return (
//           <div
//             className={cx("form-rk-green", "d-flex", "align-items-center")}
//             key={id}
//           >
//             <input
//               checked={isChecked}
//               className="form-check-input"
//               data-cy={id}
//               id={id}
//               onChange={() => toggleOption({ option: key as DateFilterTypes })}
//               type="radio"
//             />
//             <label
//               className={cx("form-check-label", "ms-2", "mt-1")}
//               htmlFor={id}
//             >
//               {label}
//             </label>
//           </div>
//         );
//       })}
//       {datesInput}
//     </SearchV2FilterContainer>
//   );
// }

export {};
