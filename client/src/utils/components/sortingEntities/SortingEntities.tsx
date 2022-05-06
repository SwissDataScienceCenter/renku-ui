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
import { useEffect, useState } from "react";
import { Input, Label } from "reactstrap/lib";

import "./SortingEntities.css";

/**
 *  renku-ui
 *
 *  SortingEntities.js
 *  Sorting Entities input
 */

export enum SortingOptions {
  AscTitle = "ascTitle",
  DescTitle = "descTitle",
  AscDate = "askDate",
  DescDate = "descDate"
}

interface SortingItems {
  AscTitle: string,
  DescTitle: string,
  AscDate: string,
  DescDate: string,
}

export interface SortingInputProps {
  value: SortingOptions | null;
  onChange: Function;
  styleType: "mobile" | "desk"
}

const SortingEntities = (
  { value, onChange, styleType } : SortingInputProps) => {
  const [sorting, setSorting] = useState<string | null>(SortingOptions.AscTitle);
  useEffect(() => setSorting(value), [value]);

  const changeSorting = (value: string) => {
    setSorting(value);

    if (onChange)
      onChange(value);
  };

  const items: SortingItems = {
    AscTitle: "Title: A - Z",
    DescTitle: "Title: Z - A",
    AscDate: "New - Old",
    DescDate: "Old - New"
  };

  const options = [];
  for (const key in items) {
    options.push(<option value={key} key={key}>{items[key as keyof SortingItems]}</option>)
  }

  return (
    <>
      <div className={styleType === "desk" ? "d-flex align-items-center" : ""}>
        {styleType === "desk" ? <Label className="mx-2">Sort By</Label> : <h3 className="sorting-label">Sort By</h3>}
        <Input type="select"
               className="sorting-input"
               name="sorting"
               value={sorting as string}
               onChange={(event) => { changeSorting(event.target.value); }}>
          {options}
        </Input>
      </div>
    </>
  );
};

export default SortingEntities;
