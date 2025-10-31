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
import { Globe, Lock, People } from "react-bootstrap-icons";
import { Input } from "reactstrap";

import "./VisibilityFilter.css";

/**
 *  renku-ui
 *
 *  VisibilityFilter.tsx
 *  Visibility filter component
 */

export interface VisibilitiesFilter {
  public: boolean;
  internal: boolean;
  private: boolean;
}

export function arrayToVisibilitiesFilter(value: string[]) {
  if (value.length < 1) return { public: true, internal: true, private: true };
  const visibilities: VisibilitiesFilter = {
    public: false,
    internal: false,
    private: false,
  };
  if (value.includes("public")) visibilities["public"] = true;
  if (value.includes("internal")) visibilities["internal"] = true;
  if (value.includes("private")) visibilities["private"] = true;
  return visibilities;
}

export interface VisibilityFilterProps {
  handler: Function; // eslint-disable-line @typescript-eslint/ban-types
  value: VisibilitiesFilter;
}

const VisibilityFilter = ({ handler, value }: VisibilityFilterProps) => {
  const selectVisibility = (visibilityKey: string, visibility: boolean) => {
    if (!handler) return;
    const newValues = { ...value };
    switch (visibilityKey) {
      case "public":
        newValues.public = visibility;
        break;
      case "internal":
        newValues.internal = visibility;
        break;
      case "private":
        newValues.private = visibility;
        break;
    }
    const somethingSelected = Object.values(newValues).filter((val) => val);
    if (somethingSelected.length)
      // there must always be something selected
      handler(newValues);
  };

  const items = [
    { title: "Public", value: "public", icon: <Globe color="#3A3A3D" /> },
    { title: "Internal", value: "internal", icon: <People color="#3A3A3D" /> },
    { title: "Private", value: "private", icon: <Lock color="#3A3A3D" /> },
  ];

  const options = items.map((item) => {
    const nameInput = `visibility-${item.value}`;
    const itemValueAsKey = item.value as keyof VisibilitiesFilter;
    return (
      <div className="form-rk-green d-flex align-items-center" key={nameInput}>
        <Input
          type="checkbox"
          name={nameInput}
          checked={value ? value[itemValueAsKey] : false}
          value={item.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            selectVisibility(item.value, e.target.checked)
          }
          className="visibility-input"
          data-cy={nameInput}
        />
        <div
          className="px-2 visibility-label cursor-pointer d-flex align-items-center gap-2"
          onClick={() => selectVisibility(item.value, !value[itemValueAsKey])}
        >
          {item.icon}
          {item.title}
        </div>
      </div>
    );
  });
  return (
    <div className="input-filter-box">
      <h3 className="filter-label">Visibility</h3>
      {options}
    </div>
  );
};

export { VisibilityFilter };
