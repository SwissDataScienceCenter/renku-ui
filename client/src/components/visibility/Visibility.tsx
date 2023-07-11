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
import { Input, Label } from "../../utils/ts-wrappers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faGlobe,
  faLock,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";

import "./Visibility.css";
import { computeVisibilities } from "../../utils/helpers/HelperFunctions";
import {
  ErrorLabel,
  HelperLabel,
  InputHintLabel,
  InputLabel,
  LoadingLabel,
} from "../formlabels/FormLabels";
import { ExternalLink } from "../ExternalLinks";
import { GitlabLinks } from "../../utils/constants/Docs";
import { ThrottledTooltip } from "../Tooltip";

/**
 *  renku-ui
 *
 *  Visibility.js
 *  Visibility input
 */

export enum Visibilities {
  Public = "public",
  Private = "private",
  Internal = "internal",
}

const VISIBILITY_ITEMS = [
  {
    title: "Public",
    value: "public",
    icon: faGlobe,
    hint: "Access without authentication",
  },
  {
    title: "Internal",
    value: "internal",
    icon: faUserFriends,
    hint: "Access only for authenticated users",
  },
  {
    title: "Private",
    value: "private",
    icon: faLock,
    hint: "Access only for the creator or contributors",
  },
];

export interface VisibilityInputProps {
  /** It restrict the options to show */
  namespaceVisibility: Visibilities;

  /** Default value */
  value: Visibilities | null;

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
  onChange: Function; // eslint-disable-line @typescript-eslint/ban-types

  /** Input name
   * @default visibility
   */
  name?: string;

  isLoadingData: boolean;

  isForked?: boolean;
  isNamespaceGroup?: boolean;
  includeRequiredLabel?: boolean;
}

/**
 * Project Visibility functional component
 * @param {VisibilityInputProps} props - visibility options
 */
const VisibilityInput = ({
  namespaceVisibility,
  disabled,
  value,
  isInvalid,
  isRequired,
  onChange,
  name = "visibility",
  isLoadingData,
  isForked,
  includeRequiredLabel = true,
}: VisibilityInputProps) => {
  const [visibility, setVisibility] = useState<string | null>(null);
  useEffect(() => setVisibility(value), [value]);

  if (isLoadingData) {
    return (
      <>
        <InputLabel text="Visibility" isRequired={isRequired} />
        <div>
          <LoadingLabel text="Determining options... " />
        </div>
      </>
    );
  }

  if (!namespaceVisibility) {
    return (
      <>
        <InputLabel text="Visibility" isRequired={isRequired} />
        <div>
          <HelperLabel text="Please select a namespace first" />
        </div>
      </>
    );
  }

  const changeVisibility = (value: string, disabledInput?: boolean) => {
    if (disabledInput) return;

    setVisibility(value);

    if (onChange) onChange(value);
  };

  const visibilities = computeVisibilities([namespaceVisibility]);
  const markInvalid = !visibility && isInvalid && isRequired;

  const disableByNamespaceOptions = {
    public: "",
    private: `Public and Internal options are not available due to ${
      isForked ? "forked project or " : ""
    }group namespace restrictions. `,
    internal: `Public is not available due to ${
      isForked ? "forked project or " : ""
    }group namespace restrictions. `,
  };

  const feedbackByNamespace = (isTooltip: boolean) => {
    return (
      <>
        {disableByNamespaceOptions[namespaceVisibility]} If you need more
        information about visibility, please check the{" "}
        <ExternalLink
          url={GitlabLinks.PROJECT_VISIBILITY}
          role="text"
          title="documentation"
          className={isTooltip ? "link-rk-white" : ""}
        />
        .
      </>
    );
  };

  const options = VISIBILITY_ITEMS.map((item) => {
    const disabledByNamespace = visibilities.disabled.includes(item.value);
    const isDisabled = disabled || disabledByNamespace;

    return (
      <div
        className="visibility-box col-sm-12 col-md-4 col-lg-4 px-0"
        key={`visibility-${item.value}`}
      >
        <div id={`visibility-${item.value}`} className="d-flex">
          <div
            className={isDisabled ? "cursor-not-allowed d-inline" : "d-inline"}
          >
            <Input
              type="radio"
              name={name}
              value={item.value}
              disabled={isDisabled}
              checked={visibility === item.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                changeVisibility(e.target.value)
              }
              className={
                markInvalid && !isDisabled
                  ? "visibility-input--error"
                  : "visibility-input"
              }
              data-cy={`visibility-${item.value}`}
            />
          </div>
          <div
            className={
              isDisabled ? "cursor-not-allowed px-2" : "cursor-pointer px-2"
            }
            onClick={() => changeVisibility(item.value, isDisabled)}
          >
            <label
              className={
                isDisabled
                  ? "cursor-not-allowed label-disabled"
                  : "cursor-pointer"
              }
            >
              {item.title}
            </label>
            <FontAwesomeIcon
              icon={item.icon}
              className={isDisabled ? "icon-disabled" : ""}
            />
          </div>
        </div>
        {isDisabled ? (
          <ThrottledTooltip
            target={`visibility-${item.value}`}
            autoHide={false}
            tooltip={feedbackByNamespace(true)}
          />
        ) : null}
        <div onClick={() => changeVisibility(item.value, isDisabled)}>
          <InputHintLabel text={item.hint} />
        </div>
      </div>
    );
  });

  const errorFeedback = markInvalid ? (
    <ErrorLabel text="Please select visibility" />
  ) : null;

  return (
    <>
      {includeRequiredLabel ? (
        <InputLabel text="Visibility" isRequired={isRequired} />
      ) : (
        <Label> Visibility </Label>
      )}
      <div className="visibilities-box row">{options}</div>
      {errorFeedback}
      <div className="d-flex gap-1 align-items-baseline">
        <FontAwesomeIcon className="text-muted" icon={faExclamationCircle} />
        <InputHintLabel text="">{feedbackByNamespace(false)}</InputHintLabel>
      </div>
    </>
  );
};

export default VisibilityInput;
export { VISIBILITY_ITEMS };
