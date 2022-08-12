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

import { Input } from "../../ts-wrappers";
import "./TypeEntityFilter.css";
/**
 *  renku-ui
 *
 *  TypeEntityFilter.tsx
 *  Type Entity Filter component
 */
export interface TypeEntitySelection {
  project: boolean;
  dataset: boolean;
}

export interface TypeFilterProps {
  handler: Function;
  value: TypeEntitySelection
}

export const initialTypeValues: TypeEntitySelection = {
  project: false,
  dataset: false
};

const TypeEntityFilter = ({ handler, value }: TypeFilterProps) => {

  const changeType = (typeKey: string, type: boolean) => {
    if (!handler)
      return;

    if (typeKey === "project")
      handler({ ...value, project: type });
    else
      handler({ ...value, dataset: type });
  };

  const items = [
    { title: "Project", value: "project", pathIcon: "/project-icon.png" },
    { title: "Dataset", value: "dataset", pathIcon: "/dataset-icon.png" },
  ];

  const options = items.map(item => {
    const nameInput = `type-entity-${item.value}`;
    const itemValueAsKey = item.value as keyof TypeEntitySelection;
    return (
      <div className="d-flex align-items-center" key={nameInput}>
        <Input
          type="checkbox"
          name={nameInput}
          checked={value[itemValueAsKey]}
          onChange={(e: ChangeEvent<HTMLInputElement>) => changeType(item.value, e.target.checked)}
          className="type-entity-input"
          data-cy={nameInput}/>
        <label className="px-2 type-entity-label cursor-pointer"
          onClick={() => changeType(item.value, !value[itemValueAsKey])}>{item.title}</label>
        <img className="type-entity-icon cursor-pointer" src={item.pathIcon}
          onClick={() => changeType(item.value, !value[itemValueAsKey])}/>
      </div>
    );
  });
  return (
    <>
      <h3 className="filter-label">Type</h3>
      {options}
    </>
  );
};

export { TypeEntityFilter };
