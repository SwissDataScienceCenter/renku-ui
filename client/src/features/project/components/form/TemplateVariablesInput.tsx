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

import { Control, Controller, UseFormRegisterReturn } from "react-hook-form";
import { NewProjectFormFields } from "../../projectKg.types";
import TemplateVariables from "../../../../project/new/components/TemplateVariables";
import { Templates } from "../../../templates/templates.api";

interface TemplateVariablesInputProps {
  register: UseFormRegisterReturn;
  control: Control<NewProjectFormFields>;
  template?: Templates;
  templateVariables?: Record<string, unknown>;
}

export default function TemplateVariablesInput({
  template,
  templateVariables,
  control,
}: TemplateVariablesInputProps) {
  if (!template) return null;

  return (
    <Controller
      control={control}
      name="templateVariables"
      render={({ field }) => (
        <TemplateVariables
          template={template}
          templateVariables={templateVariables}
          setVariable={field.onChange}
        />
      )}
      rules={{ required: true }}
    />
  );
}
