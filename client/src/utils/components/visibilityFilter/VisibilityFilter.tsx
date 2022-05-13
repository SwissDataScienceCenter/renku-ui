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
import { ChangeEvent, useEffect, useState } from "react";
import "./VisibilityFilter.css";
import { faGlobe, faLock, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { Input } from "../../ts-wrappers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

export interface VisibilityFilterProps {
  handler: Function,
  value: VisibilitiesFilter
}

const VisibilityFilter = ({ handler, value }: VisibilityFilterProps) => {
  const [visibilities, setVisibilities] = useState({
    public: false,
    internal: false,
    private: false,
  });
  useEffect(() => {
    if (value)
      setVisibilities(value);
  }, []);

  const selectVisibility = (visibility: string, value: boolean) => {
    switch (visibility) {
      case "public": setVisibilities({...visibilities, public: value}); break;
      case "internal": setVisibilities({...visibilities, public: value}); break;
      case "private": setVisibilities({...visibilities, public: value}); break;
    }

    if (handler)
      handler(visibility, value);
  }
  const items = [
    { title: "Public", value: "public", icon: faGlobe },
    { title: "Internal", value: "internal", icon: faUserFriends },
    { title: "Private", value: "private", icon: faLock },
  ];

  const options = items.map(item => {
    const nameInput = `visibility-${item.value}`;
    const itemValueAsKey = item.value as keyof VisibilitiesFilter;
    return (
      <div className="d-flex align-items-center" key={nameInput}>
        <Input
          type="checkbox"
          name={nameInput}
          defaultChecked={value ? value[itemValueAsKey] : false}
          value={item.value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => selectVisibility(item.value, e.target.checked)}
          className="visibility-input"
          data-cy={nameInput}/>
        <label className="px-2 visibility-label">{item.title}</label>
        <FontAwesomeIcon className="visibility-icon" icon={item.icon} />
      </div>
    );
  });
  return (
    <>
      <h3 className="filter-label">By Visibility</h3>
      {options}
    </>
  )
}

export { VisibilityFilter };
