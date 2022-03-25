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

/**
 *  renku-ui
 *
 *  Visibility.js
 *  Visibility input
 */

export enum Visibilities {
  Public = "public",
  Private = "private",
  Internal = "internal"
}

export interface VisibilityInputProps {
  /** It restrict the options to show */
  namespaceVisibility : Visibilities;

  /** Default value */
  value: Visibilities;

  /**
   * To show error feedback and mark input as invalid if there is no selection
   * @default false;
   */
  isInvalid?: boolean;

  /**
   * To indicate the input is required
   * @default false
   */
  isRequired: boolean;

  /** To force the disabling of all the options
   * @default false
   */
  disabled?: boolean;

  /** To be executed when a value change */
  onChange: Function;

  /** Input name
   * @default visibility
   */
  name?: string;
}

/**
 * Project Visibility functional component
 * @param {VisibilityInputProps} props - visibility options
 */
const VisibilityInput = ({ namespaceVisibility, disabled, value, isInvalid, isRequired, onChange, name = "visibility" }
                           : VisibilityInputProps) => {
  const [visibility, setVisibility] = useState<string | null>(null);
  useEffect(() => setVisibility(value), [value]);

  if (!namespaceVisibility)
    return <Label className="font-italic">Please select a namespace first.</Label>;

  const changeVisibility = (value: string, disabledInput?: boolean) => {
    if (disabledInput)
      return;

    setVisibility(value);

    if (onChange)
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
    const disabledByNamespace = visibilities.disabled.includes(item.value);
    const isDisabled = disabled || disabledByNamespace;

    return (
      <div className="visibility-box col-sm-12 col-md-4 col-lg-4 px-0" key={`visibility-${item.value}`}>
        <div className="d-flex">
          <div className={isDisabled ? "cursor-not-allowed d-inline" : "d-inline"}>
            <Input type="radio"
              name={name}
              value={item.value}
              disabled={isDisabled}
              checked={visibility === item.value}
              onChange={(e) => changeVisibility(e.target.value)}
              className={markInvalid && !isDisabled ?
                "visibility-input--error" : "visibility-input"}
              data-cy={`visibility-${item.value}`}/>
          </div>
          <div className={isDisabled ? "cursor-not-allowed px-2" : "cursor-pointer px-2"}
            onClick={()=> changeVisibility(item.value, isDisabled)}>
            <label className={isDisabled ? "cursor-not-allowed label-disabled" : "cursor-pointer"}>{item.title}</label>
            <FontAwesomeIcon icon={item.icon} className={isDisabled ? "icon-disabled" : ""} />
          </div>
        </div>
        <div className="input-hint" onClick={()=> changeVisibility(item.value, isDisabled)}>{item.hint}</div>
      </div>
    );
  });

  const disableByNamespaceOptions = {
    public: "",
    private: "Public and Internal options are not available due to namespace restrictions",
    internal: "Public is not available due to namespace restrictions"
  };
  const disabledByNamespace = <span className="input-hint">{disableByNamespaceOptions[namespaceVisibility]}</span>;
  const requiredLabel = isRequired ? (<span className="required-label">*</span>) : null;
  const errorFeedback = markInvalid ?
    (<div className="error-feedback">
      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}Please select visibility</div>)
    : null;

  return (
    <div className="py-3">
      <Label>Visibility {requiredLabel}</Label>
      <div className="visibilities-box row">
        {options}
      </div>
      {errorFeedback}
      {disabledByNamespace}
    </div>
  );
};

export default VisibilityInput;
