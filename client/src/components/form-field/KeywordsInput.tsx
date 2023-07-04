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
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import FormGeneratorKeywordsInput from "../formgenerator/fields/KeywordsInput";

type KeywordsInputProps = {
  error?: FieldError;
  help?: string | React.ReactNode;
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  value: string[];
};

function KeywordsInput(props: KeywordsInputProps) {
  const setInputs = (value: React.ChangeEvent<HTMLInputElement>) => {
    props.register.onChange(value);
  };
  return (
    <FormGeneratorKeywordsInput
      alert={props.error?.message}
      help={props.help}
      label={props.label}
      name={props.name}
      setInputs={setInputs}
      value={props.value}
    />
  );
}

export default KeywordsInput;
