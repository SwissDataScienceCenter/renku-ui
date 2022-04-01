import * as React from "react";
import { FormText, FormFeedback, Label } from "reactstrap/lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import "./FormLabels.css";
import { Loader } from "../Loader";

interface LabelProps {
  text: string;
}

interface InputLabelProps extends LabelProps {
  isRequired: boolean;
  isOptional?: boolean;
}


const InputLabel = ({ text, isRequired = false, isOptional = false }: InputLabelProps) => {
  const requiredLabel = isRequired ? (<span className="required-label">*</span>) : null;
  const optionalLabel = isOptional ? (<span> (Optional)</span>) : null;
  return (
    <Label>{ text } {requiredLabel} {optionalLabel}</Label>
  );
};

const LoadingLabel = ({ text }: LabelProps) => {
  return (
    <FormText className="loading-label">
      <span>{text}</span>
      <Loader inline={true} size={16} />
    </FormText>
  );
};

const HelperLabel = ({ text }: LabelProps) => {
  return (
    <FormText className="helper-label">
      { text }
    </FormText>
  );
};

const InputHintLabel = ({ text }: LabelProps) => {
  return (
    <FormText className="input-hint">{ text }</FormText>
  );
};

const ErrorLabel = ({ text }: LabelProps) => {
  return (
    <FormFeedback className="error-feedback">
      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}{ text }
    </FormFeedback>);
};

export { InputLabel, LoadingLabel, HelperLabel, InputHintLabel, ErrorLabel } ;
