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

import { ChangeEvent } from "react";
import { Input, Label } from "reactstrap";

import "./SortingEntities.css";

/**
 *  renku-ui
 *
 *  SortingEntities.js
 *  Sorting Entities input
 */

export enum SortingOptions {
  AscTitle = "name:asc",
  DescTitle = "name:desc",
  AscDate = "date:asc",
  DescDate = "date:desc",
  AscMatchingScore = "matchingScore:asc",
  DescMatchingScore = "matchingScore:desc",
}

export function stringToSortingOption(str: string) {
  return Object.values(SortingOptions).includes(str as SortingOptions)
    ? (str as SortingOptions)
    : undefined;
}

interface SortingItems {
  DescMatchingScore: string;
  AscMatchingScore: string;
  DescDate: string;
  AscDate: string;
  AscTitle: string;
  DescTitle: string;
}

export interface SortingInputProps {
  sort: SortingOptions | null;
  setSort: Function; // eslint-disable-line @typescript-eslint/ban-types
  styleType: "mobile" | "desk";
}

type SortOptionsStrings = keyof typeof SortingOptions;

const SortingEntities = ({ setSort, styleType, sort }: SortingInputProps) => {
  const changeSorting = (value: SortOptionsStrings) => {
    if (setSort) setSort(SortingOptions[value]);
  };

  const items: SortingItems = {
    DescMatchingScore: "Best match",
    DescDate: "Recently modified",
    AscDate: "Least recently modified",
    AscTitle: "Title: A to Z",
    DescTitle: "Title: Z to A",
    AscMatchingScore: "Lowest relevance",
  };

  const options = [];
  for (const key in items) {
    options.push(
      <option value={key} key={key}>
        {items[key as keyof SortingItems]}
      </option>
    );
  }
  const SortOptionByValue =
    Object.keys(SortingOptions)[
      Object.values(SortingOptions).indexOf(sort as SortingOptions)
    ];

  return (
    <>
      <div
        className={
          styleType === "desk"
            ? "align-items-center d-none d-sm-none d-md-none d-lg-flex d-xl-flex d-xxl-flex"
            : "sorting--mobile input-filter-box"
        }
      >
        {styleType === "desk" ? (
          <Label className="mx-2 sorting-label--desk">Sort by</Label>
        ) : (
          <Label className="mx-2 filter-label my-2">Sort by</Label>
        )}
        <Input
          type="select"
          className="sorting-input"
          name="sorting"
          value={SortOptionByValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            changeSorting(event.target.value as SortOptionsStrings)
          }
        >
          {options}
        </Input>
      </div>
    </>
  );
};

export default SortingEntities;
