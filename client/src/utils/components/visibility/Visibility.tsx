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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faGlobe, faLock, faUserFriends } from "@fortawesome/free-solid-svg-icons";

import "./Visibility.css";
import { computeVisibilities } from "../../helpers/HelperFunctions";

export enum Visibilities {
  Public = "public",
  Private = "private",
  Internal = "internal"
}

export interface VisibilityInputProps {
  namespaceVisibility : Visibilities,
  value: Visibilities,
  isInvalid?: boolean,
  isRequired: boolean,
  disabled?: boolean,
  onChange: Function
}

/**
 *  renku-ui
 *
 *  Visibility.js
 *  Visibility input
 */

/**
 * Project Visibility
 * @param {Object} props - Visibility options
 * @param {string} props.namespaceVisibility - public | private | internal, it restrict the options to show
 * @param {boolean} props.disabled - to force the disabling of all the options
 * @param {text} props.value - default value public | private | internal
 * @param {boolean} props.isInvalid - to show error feedback and mark input as invalid if there is no selection
 * @param {boolean} props.isRequired - to indicate the input is required
 * @param {function} props.onChange - to be executed when a value change
 */
const VisibilityInput = ({ namespaceVisibility, disabled, value, isInvalid, isRequired, onChange }
                           : VisibilityInputProps) => {
  const [visibility, setVisibility] = useState<string | null>(null);
  useEffect(() => setVisibility(value), [value]);

  if (!namespaceVisibility)
    return <Label className="font-italic">Please select a namespace first.</Label>;

  const changeVisibility = (value: string) => {
    setVisibility(value);
    onChange(value);
  };

  const visibilities = computeVisibilities([namespaceVisibility]);
  const markInvalid = !visibility && isInvalid && isRequired;
  const items = [
    { title: "Public", value: "public", icon: faGlobe, hint: "Access to all users" },
    { title: "Internal", value: "internal", icon: faUserFriends, hint: "Access only for authenticated users" },
    { title: "Private", value: "private", icon: faLock, hint: "Access only for the creator or contributors" },
  ];

  const options = items.map(item => {
    const isDisabled = disabled || visibilities.disabled.includes(item.value);
    return (
      <div className="visibility-box" key={`visibility-${item.value}`}>
        <div>
          <div className={isDisabled ? "option-disabled d-inline" : "d-inline"}>
            <Input type="radio"
              name="visibility"
              value={item.value}
              disabled={isDisabled}
              checked={visibility === item.value}
              onChange={(e) => changeVisibility(e.target.value)}
              className={markInvalid && !isDisabled ?
                "visibility-input--error" : "visibility-input"}
              data-cy={`visibility-${item.value}`}
            /></div>
          <label className={isDisabled ? "option-disabled" : ""}>{item.title}</label>
          <FontAwesomeIcon icon={item.icon} className={isDisabled ? "icon-disabled" : ""} />
        </div>
        <div className="input-hint">{item.hint}</div>
      </div>
    );
  });

  const feedbackDisabledOptions = {
    public: "",
    private: "Public and Internal options are not available due to namespace restrictions",
    internal: "Public is not available due to namespace restrictions"
  };
  const visibilityFeedback = <span className="input-hint">{feedbackDisabledOptions[namespaceVisibility]}</span>;
  const requiredLabel = isRequired ? (<span className="required-label">*</span>) : null;
  const errorFeedback = markInvalid ?
    (<span className="error-feedback">
      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}Please select visibility</span>)
    : null;

  return (
    <>
      <Label>Visibility {requiredLabel}</Label>
      <div className="visibilities-box flex-sm-column flex-md-row flex-lg-row">
        {options}
      </div>
      {errorFeedback}
      {visibilityFeedback}
    </>
  );
};

export default VisibilityInput;
