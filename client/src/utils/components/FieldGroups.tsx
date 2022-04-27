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
 *  FieldGroup.tsx
 *  FieldGroup component.
 */

import React from "react";
import { FormGroup, FormText, Input, Label
} from "reactstrap/lib";
import { ErrorLabel, InputLabel } from "./formlabels/FormLabels";

interface FieldGroupProps {
  id: string;
  label: string;
  value: string;
  type?: "text" | "textarea";
  help?: string | React.ReactNode;
  feedback?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  valid?: boolean;
  invalid?: boolean;
  isRequired?: boolean;
  isOptional?: boolean;
}

const FieldGroup = (
  { id, label, help, feedback, value, onChange, invalid,
    isRequired = false, isOptional = false, type = "text" }: FieldGroupProps) => {
  return <FormGroup className="field-group">
    <Label>
      <InputLabel text={label} isRequired={isRequired} isOptional={isOptional} />
    </Label>
    <Input id={id} data-cy={`field-group-${id}`} invalid={invalid} type={type} value={value} onChange={onChange} />
    {feedback && invalid && <ErrorLabel text={feedback}/> }

    {help && <FormText color="muted">{help}</FormText>}
  </FormGroup>;
};

export default FieldGroup;
