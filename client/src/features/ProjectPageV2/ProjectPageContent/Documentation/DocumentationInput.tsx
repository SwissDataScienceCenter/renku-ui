/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import cx from "classnames";
import { useCallback } from "react";

import type {
  Control,
  FieldError,
  FieldValues,
  UseFormRegisterReturn,
} from "react-hook-form";
import { FormGroup, FormText, Label } from "reactstrap";

import {
  ErrorLabel,
  InputLabel,
} from "../../../../components/formlabels/FormLabels";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import styles from "./Documentation.module.scss";

function MilkdownEditor<T extends FieldValues>(
  props: DocumentationInputProps<T>
) {
  const value = props.getValue();
  const onMarkdownUpdated = useCallback(
    (_ctx: unknown, markdown: string) => {
      props.register.onChange({
        target: { name: props.name, value: markdown },
      });
    },
    [props.register, props.name]
  );
  useEditor((root) => {
    const crepe = new Crepe({ root, defaultValue: value });
    crepe.on((listener) => {
      listener.markdownUpdated(onMarkdownUpdated);
    });
    return crepe;
  }, []);

  return <Milkdown />;
}

function MilkdownEditorWrapper<T extends FieldValues>(
  props: DocumentationInputProps<T>
) {
  return (
    <MilkdownProvider>
      <MilkdownEditor {...props} />
    </MilkdownProvider>
  );
  // <LazyCkEditor
  //   id={props.name}
  //   data={value || ""}
  //   disabled={false}
  //   invalid={props.error != null}
  //   name={props.name}
  //   setInputs={setInputs}
  // />
}

interface DocumentationInputProps<T extends FieldValues> {
  control: Control<T>;
  error?: FieldError;
  getValue: () => string;
  help?: string | React.ReactNode;
  label?: string;
  name: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}

function DocumentationInput<T extends FieldValues>(
  props: DocumentationInputProps<T>
) {
  return (
    <div>
      <FormGroup className="field-group">
        <div className={cx("pb-2", props.label == null && "mb-4")}>
          {props.label && (
            <Label htmlFor={props.name} required={props.required ?? false}>
              <InputLabel
                text={props.label}
                isRequired={props.required ?? false}
              />
            </Label>
          )}
        </div>
        <div
          data-cy={`markdown-editor-${props.name}`}
          className={cx(styles.documentationEditor)}
        >
          <MilkdownEditorWrapper {...props} />
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

export default DocumentationInput;
