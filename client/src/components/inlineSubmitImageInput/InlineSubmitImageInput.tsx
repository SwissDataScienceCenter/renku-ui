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

import { Button } from "reactstrap";
import { ChangeEvent, useState } from "react";
import { InlineSubmitButton } from "../buttons/Button";
import ImageInput, {
  ImageFieldPropertyName as Prop,
  ImageInputMode,
} from "../form-field/FormGeneratorImageInput";

interface OptionType {
  [key: string]: string | File; // You can specify the type you expect for the properties here
}
interface ImageValue {
  selected: number;
  options: OptionType[];
}
interface InputSubmitButtonsProps {
  currentImageName: string;
  doneText: string;
  isDone: boolean; //updated
  onCancel: () => void;
  onImageChange: (image: File) => void;
  pristine: boolean;
  readOnly: boolean;
  isSubmitting: boolean;
  submitId: string;
  textPristine: string;
  value: ImageValue;
}
function InputSubmitButtons({
  currentImageName,
  doneText,
  isDone,
  onCancel,
  onImageChange,
  pristine,
  readOnly,
  isSubmitting,
  submitId,
  textPristine,
  value,
}: InputSubmitButtonsProps) {
  if (readOnly || !value) return null;
  // No options, no submit button
  if (value?.options?.length < 1) return null;
  // The current image is selected, no submit button
  if (
    value.selected > -1 &&
    value.options[value.selected][Prop.NAME] === currentImageName
  )
    return null;

  const selectedFile = value.options[value.selected][Prop.FILE] as File;
  const submit = () => {
    onImageChange(selectedFile);
  };

  const submitButton = (
    <InlineSubmitButton
      className=""
      doneText={doneText}
      id={submitId}
      submittingText="Updating"
      text="Submit"
      isDone={isDone}
      isReadOnly={readOnly || pristine}
      isSubmitting={isSubmitting}
      onSubmit={submit}
      pristine={pristine}
      tooltipPristine={textPristine}
      isMainButton={true}
    />
  );

  return (
    <div className="d-flex flex-row-reverse">
      <div>{submitButton}</div>
      {!isDone ? (
        <div>
          <Button
            disabled={isSubmitting}
            className="btn-outline-rk-green"
            onClick={() => {
              onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}

interface InlineImageInputProps {
  alert: string | null;
  currentImageName: string;
  doneText: string;
  imageFormat?: string;
  imageMaxSize: number;
  includeRequiredLabel: boolean;
  isDisabled: boolean;
  isDone: boolean;
  isSubmitting: boolean;
  label: string;
  name: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSubmit: (value: File) => void;
  readOnly: boolean;
  submitButtonId: string;
  initialValue: ImageValue;
}
function InlineSubmitImageInput({
  alert,
  currentImageName,
  doneText,
  includeRequiredLabel,
  imageMaxSize,
  imageFormat,
  isDisabled,
  isDone,
  isSubmitting,
  label,
  name,
  onCancel,
  onChange,
  onSubmit,
  readOnly,
  submitButtonId,
  initialValue,
}: InlineImageInputProps) {
  const [value, setValue] = useState(initialValue);
  const [pristine, setPristine] = useState(true);

  const cancelValue = () => {
    setValue(initialValue);
    if (onCancel) onCancel();
  };

  const changeValue = (value: string) => {
    setValue(value as unknown as ImageValue);
    setPristine(false);
    if (onChange) onChange(value);
  };
  const defaultFormat = "image/png, image/jpeg, image/gif, image/tiff";

  return (
    <div>
      <ImageInput
        name={name}
        label={label}
        value={value}
        help={null}
        maxSize={imageMaxSize}
        alert={alert}
        modes={[ImageInputMode.FILE]}
        format={imageFormat ?? defaultFormat}
        disabled={isDisabled}
        submitting={isSubmitting}
        setInputs={(e: ChangeEvent<HTMLInputElement>) => {
          changeValue(e.target.value);
        }}
        includeRequiredLabel={includeRequiredLabel}
      />
      <InputSubmitButtons
        currentImageName={currentImageName}
        doneText={doneText}
        submitId={submitButtonId}
        textPristine={""}
        value={value}
        onCancel={cancelValue}
        readOnly={readOnly || pristine} //settingsReadOnly
        isDone={isDone}
        isSubmitting={isSubmitting}
        pristine={pristine}
        onImageChange={(f) => onSubmit(f)}
      />
    </div>
  );
}

export default InlineSubmitImageInput;
