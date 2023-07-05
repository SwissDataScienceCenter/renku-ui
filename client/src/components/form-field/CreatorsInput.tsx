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

import React from "react";
import type {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegisterReturn,
} from "react-hook-form";

import FormGeneratorCreatorsInput from "../formgenerator/fields/CreatorsInput";
import type {
  Creator,
  CreatorInputProps,
} from "../formgenerator/fields/CreatorsInput";

function validateCreators(creators: Creator[]) {
  const invalidCreators = creators.find(
    (creator) =>
      creator.email && (creator.name.length <= 0 || creator.email.length <= 0)
  );
  return invalidCreators === undefined;
}

type CreatorsInputProps = Omit<CreatorInputProps, "alert" | "setInputs"> & {
  error?:
    | Merge<
        FieldError,
        (Merge<FieldError, FieldErrorsImpl<Creator>> | undefined)[]
      >
    | undefined;
  register: UseFormRegisterReturn;
  value: Creator[];
};

function CreatorsInput(props: CreatorsInputProps) {
  const setInputs = (value: React.ChangeEvent<HTMLInputElement>) => {
    props.register.onChange(value);
  };
  return (
    <FormGeneratorCreatorsInput
      alert={props.error?.message}
      help={props.help}
      label={props.label}
      name={props.name}
      setInputs={setInputs}
      value={props.value}
    />
  );
}

export default CreatorsInput;
export { validateCreators };

export type { Creator };
