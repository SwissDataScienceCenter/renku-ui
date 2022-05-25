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
 *  FormValidation.tsx
 *  FormValidation components.
 */
import { capitalize } from "../../../utils/components/formgenerator/FormGenerator.present";
import { ErrorLabel, HelperLabel } from "../../../utils/components/formlabels/FormLabels";
import React from "react";
import { NewProjectInputs, NewProjectMeta } from "./newProject.d";

interface FormWarningsProps {
  meta: NewProjectMeta | any;
}

const FormWarnings = ({ meta }: FormWarningsProps) => {
  const warnings = Object.keys(meta.validation.warnings);

  if (!warnings.length)
    return null;

  let message = "";
  for (const warningsKey of warnings)
    message += `${meta.validation.warnings[warningsKey]}\n`;

  return (
    <div className="mt-1 d-flex justify-content-end">
      <HelperLabel text={message} />
    </div>
  );
};


interface FormErrorsProps {
  meta: NewProjectMeta | any;
  input: NewProjectInputs | any;
}
const FormErrors = ({ meta, input }: FormErrorsProps) => {
  const errorFields = meta.validation.errors ?
    Object.keys(meta.validation.errors)
      .filter(field => !input[`${field}Pristine`]) // don't consider pristine fields
      .map(field => capitalize(field)) :
    [];

  if (!errorFields.length)
    return null;

  return <FormErrorFields errorFields={errorFields} />;
};

interface FormErrorFieldsProps {
  errorFields: string[];
}
const FormErrorFields = ({ errorFields }: FormErrorFieldsProps) => {
  const plural = errorFields.length > 1 ? "s" : "";
  return (<div className="mt-1 text-end">
    <ErrorLabel text={""}>
      Please fix problems in the following field{plural}:{" "}
      <span className="fw-bold">{errorFields.join(", ")}</span>
    </ErrorLabel>
  </div>);
};

export { FormErrors, FormWarnings, FormErrorFields };
