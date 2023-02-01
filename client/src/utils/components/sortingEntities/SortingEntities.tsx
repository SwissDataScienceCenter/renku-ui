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
import { ChangeEvent } from "react";
import { Input, Label } from "../../ts-wrappers";

import "./SortingEntities.css";

/**
 *  renku-ui
 *
 *  SortingEntities.js
 *  Sorting Entities input
 */

// These are used by the TS compiler does not realize it.
/* eslint-disable no-unused-vars */
export enum SortingOptions {
  AscTitle = "name:asc",
  DescTitle = "name:desc",
  AscDate = "date:asc",
  DescDate = "date:desc",
  AscMatchingScore = "matchingScore:asc",
  DescMatchingScore = "matchingScore:desc"
}
/* eslint-enable no-unused-vars */

export function stringToSortingOption(str: string) {
  switch (str) {
    case "name:asc": return SortingOptions.AscTitle;
    case "name:desc": return SortingOptions.DescTitle;
    case "date:asc": return SortingOptions.AscDate;
    case "date:desc": return SortingOptions.DescDate;
    case "matchingScore:asc": return SortingOptions.AscMatchingScore;
    case "matchingScore:desc": return SortingOptions.DescMatchingScore;
    default: return undefined;
  }
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
  setSort: Function;
  styleType: "mobile" | "desk"
}

type SortOptionsStrings = keyof typeof SortingOptions;

const SortingEntities = ({ setSort, styleType, sort } : SortingInputProps) => {

  const changeSorting = (value: SortOptionsStrings) => {
    if (setSort)
      setSort(SortingOptions[value]);
  };

  const items: SortingItems = {
    DescMatchingScore: "Best match",
    DescDate: "Recently modified",
    AscDate: "Least recently modified",
    AscTitle: "Title: A to Z",
    DescTitle: "Title: Z to A",
    AscMatchingScore: "Lowest relevance"
  };

  const options = [];
  for (const key in items) {
    options.push(<option
      value={key} key={key}>
      { items[key as keyof SortingItems] }</option>);
  }
  const SortOptionByValue = Object.keys(SortingOptions)[Object.values(SortingOptions).indexOf(sort as SortingOptions)];
  return (
    <>
      <div className={styleType === "desk" ?
        "align-items-center d-none d-sm-none d-md-none d-lg-flex d-xl-flex d-xxl-flex"
        : "sorting--mobile input-filter-box"}>
        {styleType === "desk" ?
          <Label className="mx-2 sorting-label--desk">Sort by</Label> :
          <Label className="mx-2 filter-label my-2">Sort by</Label>}
        <Input
          type="select"
          className="sorting-input"
          name="sorting"
          defaultValue={SortOptionByValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => changeSorting(event.target.value as SortOptionsStrings)}>
          {options}
        </Input>
      </div>
    </>
  );
};

export default SortingEntities;
