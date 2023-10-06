/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { Card, CardBody, FormText, Input, Label } from "reactstrap";
import React from "react";
import { Loader } from "../Loader";
import { InlineSubmitButton } from "../buttons/Button";

interface InlineInputProps {
  classNameSubmitButton: string;
  dataCyCard: string;
  dataCyInput: string;
  disabled: boolean;
  doneText: string;
  errorToDisplay: React.ReactNode;
  id: string;
  inputHint: string;
  isDone: boolean;
  isSubmitting: boolean;
  label: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  pristine: boolean;
  readOnly: boolean;
  submittingText: string;
  text: string;
  tooltipPristine: string;
  value: string;
}
export default function InlineSubmitInput({
  classNameSubmitButton,
  dataCyCard,
  dataCyInput,
  disabled,
  doneText,
  errorToDisplay,
  id,
  inputHint,
  isDone,
  isSubmitting,
  label,
  loading,
  onChange,
  onSubmit,
  pristine,
  readOnly,
  submittingText,
  text,
  tooltipPristine,
  value,
}: InlineInputProps) {
  if (loading)
    return (
      <InputCard label={label} id={id}>
        <Loader className="ms-1" inline size={16} />
      </InputCard>
    );

  const inputField = (
    <Input
      data-cy={dataCyInput}
      disabled={disabled}
      id={id}
      onChange={onChange}
      readOnly={readOnly}
      value={value}
    />
  );

  const submitButton = readOnly ? null : (
    <InlineSubmitButton
      className={classNameSubmitButton}
      doneText={doneText}
      id={id}
      isDone={isDone}
      isReadOnly={readOnly || pristine}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      pristine={pristine}
      submittingText={submittingText}
      text={text}
      tooltipPristine={tooltipPristine}
    />
  );

  return (
    <InputCard label={label} id={id}>
      <div className="d-flex" data-cy={dataCyCard}>
        {inputField}
        {submitButton}
      </div>
      <FormText>{inputHint}</FormText>
      {errorToDisplay}
    </InputCard>
  );
}
interface InputCardProps {
  children: React.ReactNode;
  label: string;
  id: string;
}
export function InputCard({ children, label, id }: InputCardProps) {
  return (
    <Card className="mb-4">
      <CardBody>
        <Label className="me-2" for={id}>
          {label}
        </Label>
        {children}
      </CardBody>
    </Card>
  );
}
