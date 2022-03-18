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
import React, { useEffect, useState } from "react";
import { Input } from "reactstrap/lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faLock, faUserFriends } from "@fortawesome/free-solid-svg-icons";

import "./Visibility.css";
import { computeVisibilities } from "../../helpers/HelperFunctions";

/**
 *  renku-ui
 *
 *  Visibility.js
 *  Visibility input
 */

/**
 * Project Visibility
 * @param {namespaceVisibility} text - public, private or internal
 * @param {disabled} boolean - to disable all options
 * @param {onChange} function - to be executed when a value change
 * @param {value} text - default value
 * @param {invalid} boolean - to shor error styles if there is no selection
 */
const VisibilityInput = ({ namespaceVisibility, disabled, onChange, value, invalid }) => {
  const [visibility, setVisibility] = useState(null);
  useEffect(() => setVisibility(value), [value]);

  if (!namespaceVisibility)
    return null;

  const changeVisibility = (value) => {
    setVisibility(value);
    onChange(value);
  };

  const visibilities = computeVisibilities(namespaceVisibility);
  const items = [
    { title: "Public", value: "public", icon: faGlobe, hint: "Access to all users" },
    { title: "Internal", value: "internal", icon: faUserFriends, hint: "Access only for authenticated users" },
    { title: "Private", value: "private", icon: faLock, hint: "Access only for the creator or contributors" },
  ];

  const options = items.map(item => {
    const isDisabled = visibilities.disabled.includes(item.value) || disabled;
    return (
      <div className="visibility-box" key={`visibility-${item.value}`}>
        <div>
          <Input type="radio" name="visibility" value={item.value}
            disabled={isDisabled}
            checked={visibility === item.value}
            onChange={(e) => changeVisibility(e.target.value)}
            className={invalid && !isDisabled && !visibility ? "visibility-input--error" : "visibility-input"}
          />
          <label>{item.title}</label>
          <FontAwesomeIcon icon={item.icon} className={isDisabled ? "icon-disabled" : ""} />
        </div>
        <div className="input-hint">{item.hint}</div>
      </div>
    );
  });


  const feedbackByVisibility = {
    public: "",
    private: "Public and Internal options are not available due to namespace restrictions",
    internal: "Public is not available due to namespace restrictions"
  };
  const visibilityFeedback = <span className="input-hint">{feedbackByVisibility[namespaceVisibility]}</span>;

  return (
    <>
      <div className="visibilities-box flex-sm-column flex-md-column flex-lg-row">
        {options}
      </div>
      {visibilityFeedback}
    </>
  );
};

export { VisibilityInput };
