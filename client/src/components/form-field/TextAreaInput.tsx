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

// TODO: Upgrade to ckeditor5 v6.0.0 to get TS support
import React from "react";
import { Controller } from "react-hook-form";
import type {
  Control,
  FieldError,
  FieldValues,
  Path,
  UseFormRegisterReturn,
} from "react-hook-form";
import { Input, FormGroup, FormText, Label } from "reactstrap";

import FormLabel from "../formgenerator/fields/FormLabel";
import { ErrorLabel } from "../formlabels/FormLabels";

import CkEditor from "./CkEditor";

type EditMarkdownSwitchProps = {
  codeView: boolean;
  setCodeView: React.Dispatch<React.SetStateAction<boolean>>;
};

function EditMarkdownSwitch(props: EditMarkdownSwitchProps) {
  const outputType = "markdown";
  const switchLabel = outputType === "markdown" ? "Raw Markdown" : "Raw HTML";
  return (
    <div className="form-check form-switch float-end">
      <Input
        className="form-check-input rounded-pill"
        type="switch"
        id="CKEditorSwitch"
        name="customSwitch"
        checked={props.codeView}
        onChange={() => {
          props.setCodeView(!props.codeView);
        }}
      />
      <Label check htmlFor="exampleCustomSwitch" className="form-check-label">
        {switchLabel}
      </Label>
    </div>
  );
}

type MarkdownInputProps<T extends FieldValues> = TextAreaInputProps<T> &
  Omit<EditMarkdownSwitchProps, "setCodeView">;

function MarkdownInput<T extends FieldValues>(props: MarkdownInputProps<T>) {
  const setInputs = (value: { target: { name: string; value: unknown } }) => {
    props.register.onChange(value);
  };
  const outputType = "markdown";
  const value = props.getValue();
  if (props.codeView) {
    // User wants to input markdown directly
    return (
      <Controller
        control={props.control}
        name={props.name as Path<T>}
        render={({ field }) => (
          <Input
            id={`${props.name}text-area`}
            data-cy={`text-area-${props.name}`}
            type="textarea"
            disabled={false}
            rows={value ? value.split("\n").length + 2 : 4}
            {...field}
          />
        )}
      />
    );
  }
  // User wants to rich-text input
  return (
    <CkEditor
      id={props.name}
      data={value || ""}
      disabled={false}
      invalid={props.error != null}
      name={props.name}
      outputType={outputType}
      setInputs={setInputs}
    />
  );
}

type TextAreaInputProps<T extends FieldValues> = {
  control: Control<T>;
  error?: FieldError;
  getValue: () => string;
  help?: string | React.ReactNode;
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  required?: boolean;
};

function TextAreaInput<T extends FieldValues>(props: TextAreaInputProps<T>) {
  const [codeView, setCodeView] = React.useState(false);

  return (
    <div>
      <FormGroup className="field-group">
        <div className="pb-2">
          <FormLabel
            name={props.name}
            label={props.label}
            required={props.required ?? false}
          />
          <EditMarkdownSwitch codeView={codeView} setCodeView={setCodeView} />
        </div>
        <div data-cy={`ckeditor-${props.name}`}>
          <MarkdownInput {...props} codeView={codeView} />
        </div>
        {props.help && <FormText color="muted">{props.help}</FormText>}
        {props.error && (
          <ErrorLabel
            text={
              props.error.message ??
              "There is a problem with the text in this field."
            }
          />
        )}
      </FormGroup>
    </div>
  );
}

export default TextAreaInput;
