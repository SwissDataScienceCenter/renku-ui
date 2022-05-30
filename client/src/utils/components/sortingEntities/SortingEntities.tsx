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
  DescDate = "date:desc"
}
/* eslint-enable no-unused-vars */

interface SortingItems {
  AscTitle: string,
  DescTitle: string,
  AscDate: string,
  DescDate: string,
}

export interface SortingInputProps {
  sort: SortingOptions | null;
  setSort: Function;
  styleType: "mobile" | "desk"
}

type SortOptionsStrings = keyof typeof SortingOptions;

const SortingEntities = (
  { setSort, styleType, sort } : SortingInputProps) => {

  const changeSorting = (value: SortOptionsStrings) => {
    if (setSort)
      setSort(SortingOptions[value]);
  };

  const items: SortingItems = {
    AscTitle: "Title: A - Z",
    DescTitle: "Title: Z - A",
    AscDate: "Old - New",
    DescDate: "New - Old"
  };

  const options = [];
  for (const key in items)
    options.push(<option value={key} key={key}>{items[key as keyof SortingItems]}</option>);

  return (
    <>
      <div className={styleType === "desk" ?
        "align-items-center d-none d-sm-none d-md-flex d-lg-flex d-xl-flex d-xxl-flex"
        : "sorting--mobile"}>
        {styleType === "desk" ?
          <Label className="mx-2 sorting-label--desk">Sort By</Label> :
          <h3 className="sorting-label">Sort By</h3>}
        <Input
          type="select"
          className="sorting-input"
          name="sorting"
          onChange={(event: ChangeEvent<HTMLInputElement>) => changeSorting(event.target.value as SortOptionsStrings)}>
          {options}
        </Input>
      </div>
    </>
  );
};

export default SortingEntities;
