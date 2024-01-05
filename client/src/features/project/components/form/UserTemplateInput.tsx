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
import UserTemplate from "../../../../project/new/components/UserTemplate";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { RepositoriesParams } from "../../../templates/templates.types";
import { CustomUserTemplate } from "../../editNew/NewProject.types";
import { ControllerRenderProps } from "react-hook-form/dist/types/controller";

interface UserTemplateInputProps {
  register: UseFormRegisterReturn;
  control: Control<NewProjectFormFields>;
  userTemplate?: CustomUserTemplate;
  templateVariables?: Record<string, unknown>;
  setUserRepositories: (repositories: RepositoriesParams[] | null) => void;
}

export default function UserTemplateInput({
  userTemplate,
  control,
  setUserRepositories,
}: UserTemplateInputProps) {
  const config = useLegacySelector(
    (state) => state.stateModel.newProject.config
  );
  const getUserTemplates = () => {
    if (userTemplate && userTemplate?.url && userTemplate?.reference) {
      setUserRepositories([
        {
          url: userTemplate.url,
          ref: userTemplate.reference,
          name: "Custom",
        },
      ]);
    }
  };

  const setTemplateProperty = (
    property: string,
    value: string,
    field: ControllerRenderProps<NewProjectFormFields, "userTemplate">
  ) => {
    setUserRepositories(null);
    if (property === "ref") {
      field.onChange({ url: field.value?.url || "", reference: value });
    } else if (property === "url") {
      field.onChange({ url: value, reference: field.value?.reference || "" });
    }
  };

  return (
    <Controller
      control={control}
      name="userTemplate"
      render={({ field }) => (
        <UserTemplate
          userTemplate={userTemplate}
          getUserTemplates={getUserTemplates}
          config={config}
          setTemplateProperty={(property: string, value: string) =>
            setTemplateProperty(property, value, field)
          }
        />
      )}
    />
  );
}
