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
import { Input } from "reactstrap/lib";
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
  value?: TypeEntitySelection
}

const TypeEntityFilter = ({ handler, value }: TypeFilterProps) => {
  const [typeSelected, setTypeSelected] = useState({
    project: false,
    dataset: false
  });

  useEffect(() => {
    if (value)
      setTypeSelected(value);
  }, []);

  const changeType = (type: string, value: boolean) => {
    if (type === "project")
      setTypeSelected({...typeSelected, project: value});
    else
      setTypeSelected({...typeSelected, dataset: value});

    if (handler)
      handler(type, value);
  }

  const items = [
    { title: "Project", value: "project", pathIcon: "/project-icon.png" },
    { title: "Dataset", value: "dataset", pathIcon: "/dataset-icon.png" },
  ];

  const options = items.map(item => {
    const nameInput = `type-entity-${item.value}`;
    const itemValueAsKey = item.value as keyof TypeEntitySelection;
    return (
      <div className="d-flex align-items-center" key={nameInput}>
        <Input type="checkbox"
               name={nameInput}
               defaultChecked={value ? value[itemValueAsKey] : false}
               onChange={(e) => changeType(item.value, e.target.checked)}
               className="type-entity-input"
               data-cy={nameInput}/>
        <label className="px-2 type-entity-label">{item.title}</label>
        <img className="type-entity-icon" src={item.pathIcon} />
      </div>
    );
  });
  return (
    <>
      <h3 className="filter-label">By Type</h3>
      {options}
    </>
  )
}

export { TypeEntityFilter };
