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

/**
 *  renku-ui
 *
 *  FormLabels.tsx
 *  FormLabels components.
 */
import * as React from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

import "./FormLabels.css";

import { FormText, FormFeedback, Label } from "../../utils/ts-wrappers";
import { Loader } from "../Loader";

interface LabelProps {
  className?: string;
  text: string;
  children?: React.ReactNode;
}

interface RequiredLabelProps {
  isRequired: boolean;
}
const RequiredLabel = ({ isRequired }: RequiredLabelProps) => {
  return isRequired ? (
    <span className="required-label">*</span>
  ) : (
    <span> (Optional)</span>
  );
};

interface InputLabelProps extends LabelProps {
  isRequired?: boolean;
}

const InputLabel = ({ text, isRequired = false }: InputLabelProps) => {
  return (
    <Label>
      {text} <RequiredLabel isRequired={isRequired} />
    </Label>
  );
};

const LoadingLabel = ({ className, text }: LabelProps) => {
  return (
    <FormText className={cx(className, "loading-label")}>
      <span>
        {text} <Loader inline size={16} />
      </span>
    </FormText>
  );
};

const HelperLabel = ({ text }: LabelProps) => {
  return <FormText className="helper-label">{text}</FormText>;
};

const InputHintLabel = ({ text }: LabelProps) => {
  // TODO: remove Non-Simplifying Components ref: #2696
  return <FormText className="input-hint">{text}</FormText>;
};

const ErrorLabel = ({ text, children }: LabelProps) => {
  return (
    <FormFeedback className="error-feedback">
      <FontAwesomeIcon icon={faExclamationTriangle} /> {text} {children}
    </FormFeedback>
  );
};

const SuccessLabel = ({ text, children }: LabelProps) => {
  if (!text) return null;
  if (text.length < 1) return null;
  return (
    <FormFeedback className="success-feedback">
      <FontAwesomeIcon icon={faCheck} /> {text} {children}
    </FormFeedback>
  );
};

export {
  InputLabel,
  LoadingLabel,
  HelperLabel,
  InputHintLabel,
  ErrorLabel,
  RequiredLabel,
  SuccessLabel,
};
