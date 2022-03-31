import * as React from "react";
import { Label } from "reactstrap/lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import "./FormLabels.css";
import { Loader } from "../Loader";

interface LabelProps {
  text: string;
}

interface InputLabelProps extends LabelProps {
  isRequired: boolean;
}


const InputLabel = ({ text, isRequired }: InputLabelProps) => {
  const requiredLabel = isRequired ? (<span className="required-label">*</span>) : null;
  return (
    <Label>{ text } {requiredLabel}</Label>
  );
};

const LoadingLabel = ({ text }: LabelProps) => {
  return (
    <div className="loading-label">
      <span>{text}</span>
      <Loader inline={true} size={16} />
    </div>
  );
};

const HelperLabel = ({ text }: LabelProps) => {
  return (
    <div className="helper-label"><Label>{ text }</Label></div>
  );
};

const InputHintLabel = ({ text }: LabelProps) => {
  return (
    <Label className="input-hint">{ text }</Label>
  );
};

const ErrorLabel = ({ text }: LabelProps) => {
  return (
    <div className="error-feedback">
      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}{ text }
    </div>);
};

export { InputLabel, LoadingLabel, HelperLabel, InputHintLabel, ErrorLabel } ;
