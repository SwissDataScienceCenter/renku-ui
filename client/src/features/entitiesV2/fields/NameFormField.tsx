/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { useMemo } from "react";
import type { FieldValues } from "react-hook-form";

import { displayEntityType } from "../entities.utils";
import type { EntityFormFieldProps } from "./forms.types";
import GenericInputText from "./GenericInputText";

export default function NameFormField<T extends FieldValues>({
  entityType,
  defaultErrorMessage: defaultErrorMessage_,
  helpText: helpText_,
  inputId: inputId_,
  inputIdPrefix,
  label: label_,
  ...props
}: EntityFormFieldProps<T>) {
  const inputId = useMemo(
    () =>
      inputId_ ||
      (inputIdPrefix
        ? `${inputIdPrefix}-${entityType}-${props.name}`
        : `$${entityType}-${props.name}`),
    [entityType, inputIdPrefix, inputId_, props.name]
  );
  const defaultErrorMessage = useMemo(
    () => defaultErrorMessage_ ?? "Please provide a valid name.",
    [defaultErrorMessage_]
  );
  const helpText = useMemo(
    () =>
      helpText_ ??
      `The name you will use to refer to the ${displayEntityType(entityType)}.`,
    [entityType, helpText_]
  );
  const label = useMemo(() => label_ ?? "Name", [label_]);

  return (
    <GenericInputText
      defaultErrorMessage={defaultErrorMessage}
      helpText={helpText}
      inputId={inputId}
      label={label}
      {...props}
    />
  );
}
