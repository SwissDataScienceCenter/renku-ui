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
import { Briefcase, HddStack } from "react-bootstrap-icons";
import { Input } from "reactstrap";

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

export function arrayToTypeEntitySelection(value: string[]) {
  if (value.length < 1) return { project: true, dataset: true };
  const type: TypeEntitySelection = { project: false, dataset: false };
  if (value.includes("project")) type["project"] = true;
  if (value.includes("dataset")) type["dataset"] = true;
  return type;
}

export interface TypeFilterProps {
  handler: Function; // eslint-disable-line @typescript-eslint/ban-types
  value: TypeEntitySelection;
}

export const initialTypeValues: TypeEntitySelection = {
  project: true,
  dataset: true,
};

const TypeEntityFilter = ({ handler, value }: TypeFilterProps) => {
  const changeType = (typeKey: string, type: boolean) => {
    if (!handler) return;

    const newValues = { ...value };
    if (typeKey === "project") newValues.project = type;
    else newValues.dataset = type;

    const somethingSelected = Object.values(newValues).filter((val) => val);
    if (somethingSelected.length)
      // there must always be something selected
      handler(newValues);
  };

  const items = [
    {
      title: "Project",
      value: "project",
      color: "rk-green",
      icon: <Briefcase />,
    },
    {
      title: "Dataset",
      value: "dataset",
      color: "rk-pink",
      icon: <HddStack />,
    },
  ];

  const options = items.map((item) => {
    const nameInput = `type-entity-${item.value}`;
    const itemValueAsKey = item.value as keyof TypeEntitySelection;
    return (
      <div
        className={`d-flex align-items-center form-${item.color}`}
        key={nameInput}
      >
        <Input
          type="checkbox"
          name={nameInput}
          checked={value[itemValueAsKey]}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            changeType(item.value, e.target.checked)
          }
          className={`type-entity-input text-${item.color} ${item.color}`}
          data-cy={nameInput}
        />
        <label
          className={`px-2 type-entity-label cursor-pointer text-${item.color} d-flex gap-2 align-items-center`}
          onClick={() => changeType(item.value, !value[itemValueAsKey])}
        >
          {item.icon} {item.title}
        </label>
      </div>
    );
  });
  return (
    <div className="input-filter-box">
      <h3 className="filter-label">Content types</h3>
      {options}
    </div>
  );
};

export { TypeEntityFilter };
