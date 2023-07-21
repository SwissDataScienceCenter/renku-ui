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
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Input } from "reactstrap";
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
  InputLabel,
  LoadingLabel,
  RequiredLabel,
} from "../formlabels/FormLabels";
import { ExternalLink } from "../ExternalLinks";
import { GitlabLinks } from "../../utils/constants/Docs";
import { ThrottledTooltip } from "../Tooltip";
import { FormText } from "reactstrap";
import cx from "classnames";
import { IconDefinition } from "@fortawesome/free-brands-svg-icons";

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

interface VisibilityItem {
  title: string;
  value: string;
  icon: IconDefinition;
  hint: string;
}

export const VISIBILITY_ITEMS: VisibilityItem[] = [
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

export interface VisibilitiesInputProps {
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
const VisibilitiesInput = ({
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
}: VisibilitiesInputProps) => {
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
    private: `Public and Internal not available due to ${
      isForked ? "forked project or " : ""
    }group namespace restrictions. `,
    internal: `Public not available due to ${
      isForked ? "forked project or " : ""
    }group namespace restrictions. `,
  };

  const feedbackByNamespace = (isTooltip: boolean) => {
    return (
      <>
        {disableByNamespaceOptions[namespaceVisibility]} Check the{" "}
        <ExternalLink
          url={GitlabLinks.PROJECT_VISIBILITY}
          role="text"
          title="visibility documentation"
          className={cx(isTooltip && "link-rk-white")}
        />{" "}
        for more details.
      </>
    );
  };

  const options = VISIBILITY_ITEMS.map((item) => {
    const isDisabledByNamespace = visibilities.disabled.includes(item.value);
    return (
      <VisibilityInput
        key={item.value}
        item={item}
        name={name}
        isDisabled={disabled || isDisabledByNamespace}
        changeVisibility={changeVisibility}
        isChecked={visibility === item.value}
        markInvalid={markInvalid}
        tooltipContent={feedbackByNamespace(true)}
      />
    );
  });

  const errorFeedback = markInvalid ? (
    <ErrorLabel text="Please select visibility" />
  ) : null;

  return (
    <>
      <legend className="form-label fs-6">
        Visibility{" "}
        {includeRequiredLabel ? <RequiredLabel isRequired={isRequired} /> : ""}
      </legend>
      <div className="visibilities-box row">{options}</div>
      {errorFeedback}
      <div>
        <FormText className="input-hint py-1">
          <FontAwesomeIcon icon={faExclamationCircle} />{" "}
          {feedbackByNamespace(false)}
        </FormText>
      </div>
    </>
  );
};

interface VisibilityInputProps {
  item: VisibilityItem;
  name: string;
  isDisabled: boolean;
  changeVisibility: (value: string, disabledInput?: boolean) => void;
  isChecked: boolean;
  markInvalid?: boolean;
  tooltipContent: ReactNode;
}
const VisibilityInput = ({
  item,
  name,
  isDisabled,
  changeVisibility,
  isChecked,
  markInvalid,
  tooltipContent,
}: VisibilityInputProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className="visibility-box col-sm-12 col-md-4 col-lg-4 px-0"
      key={`visibility-${item.value}`}
    >
      <div className="d-flex">
        <div
          className={isDisabled ? "cursor-not-allowed d-inline" : "d-inline"}
        >
          <Input
            type="radio"
            name={name}
            value={item.value}
            disabled={isDisabled}
            checked={isChecked}
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
          ref={ref}
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
          target={ref}
          autoHide={false}
          tooltip={tooltipContent}
        />
      ) : null}
      <div onClick={() => changeVisibility(item.value, isDisabled)}>
        <FormText className="input-hint">{item.hint}</FormText>
      </div>
    </div>
  );
};

export default VisibilitiesInput;
