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
import cx from "classnames";
import React from "react";
import type {
  Control,
  FieldError,
  FieldValues,
  UseFormRegisterReturn,
} from "react-hook-form";
import { FormGroup, FormText } from "reactstrap";

import FormLabel from "./FormLabel";
import { ErrorLabel } from "../formlabels/FormLabels";

import LazyCkEditor from "./LazyCkEditor";

function MarkdownInput<T extends FieldValues>(props: TextAreaInputProps<T>) {
  const setInputs = async (value: {
    target: { name: string; value: unknown };
  }) => {
    await props.register.onChange(value);
  };
  return (
    <LazyCkEditor
      id={props.name}
      data={props.getValue() || ""}
      disabled={false}
      invalid={props.error != null}
      name={props.name}
      setInputs={setInputs}
      wordCount={props.wordCount}
    />
  );
}

interface TextAreaInputProps<T extends FieldValues> {
  control: Control<T>;
  error?: FieldError;
  getValue: () => string;
  help?: string | React.ReactNode;
  label?: string;
  name: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  wordCount?: (stats: {
    exact: boolean;
    characters: number;
    words: number;
  }) => void;
}

function TextAreaInput<T extends FieldValues>(props: TextAreaInputProps<T>) {
  return (
    <div>
      <FormGroup className="field-group">
        <div className="pb-2">
          {props.label ? (
            <FormLabel
              name={props.name}
              label={props.label}
              required={props.required ?? false}
            />
          ) : (
            <div className="pb-2" />
          )}
        </div>
        <div
          data-cy={`ckeditor-${props.name}`}
          className={cx("border-radius-8")}
          style={{
            background: "white",
            border: "1px solid var(--bs-rk-border-input)",
            padding: "5px 5px 5px",
          }}
        >
          <MarkdownInput {...props} />
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
