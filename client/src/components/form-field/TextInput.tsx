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

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { FormGroup, FormText } from "reactstrap";
import FormLabel from "./FormLabel";
import { ErrorLabel } from "../formlabels/FormLabels";

type TextInputProps = {
  dataCy?: string;
  error?: FieldError;
  help?: string | React.ReactNode;
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  required: boolean;
};

function TextInput(props: TextInputProps) {
  return (
    <FormGroup className="field-group">
      <FormLabel
        name={props.name}
        label={props.label}
        required={props.required}
      />
      <input
        className="form-control"
        data-cy={props.dataCy}
        id={props.name}
        {...props.register}
      />
      {props.help && <FormText color="muted">{props.help}</FormText>}
      {props.error && <ErrorLabel text={props.error.message ?? ""} />}
    </FormGroup>
  );
}

export default TextInput;
