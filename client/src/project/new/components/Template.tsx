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

import { FormGroup } from "reactstrap";
import TemplateSelector from "../../../components/templateSelector/TemplateSelector";
import {
  Templates,
  useGetTemplatesRepositoriesQuery,
} from "../../../features/templates/templates.api";
import { RepositoriesParams } from "../../../features/templates/templates.types";
import { ErrorTemplateFeedback } from "./UserTemplate";
import { Control, Controller, UseFormRegisterReturn } from "react-hook-form";
import { NewProjectFormFields } from "../../../features/project/projectKg.types";

interface TemplateProps {
  control: Control<NewProjectFormFields>;
  template?: Templates; // TODO:  when is already selected a templates by custom url
  register: UseFormRegisterReturn;
  userRepositories: RepositoriesParams[] | null;
  isCustomTemplate: boolean;
  renkuLabRepositories: RepositoriesParams[];
}

/** Template field group component */
export const Template = ({
  control,
  template,
  isCustomTemplate,
  userRepositories,
  renkuLabRepositories,
}: TemplateProps) => {
  const {
    data: renkuLabTemplates,
    isFetching: renkuLabTemplatesFetching,
    isError: renkuLabTemplatesIsError,
    error: renkuLabTemplatesError,
  } = useGetTemplatesRepositoriesQuery({ repositories: renkuLabRepositories });
  const {
    data: customTemplates,
    isFetching: customTemplatesFetching,
    isError: customTemplatesIsError,
    error: customTemplatesError,
  } = useGetTemplatesRepositoriesQuery(
    { repositories: userRepositories !== null ? userRepositories : [] },
    { skip: userRepositories === null }
  );

  const noFetchedUserRepo = isCustomTemplate && userRepositories === null;
  const isFetching =
    (!isCustomTemplate && renkuLabTemplatesFetching) ||
    (isCustomTemplate && customTemplatesFetching);
  const invalid = renkuLabTemplatesIsError || customTemplatesIsError;
  const error = isCustomTemplate
    ? customTemplatesError
    : renkuLabTemplatesError;

  return (
    <>
      <FormGroup className="field-group">
        <Controller
          control={control}
          name="template"
          render={({ field }) => (
            <TemplateSelector
              repositories={
                isCustomTemplate
                  ? userRepositories !== null
                    ? userRepositories
                    : []
                  : renkuLabRepositories
              }
              select={(t: Templates) => field.onChange(t)}
              selected={template}
              templates={isCustomTemplate ? customTemplates : renkuLabTemplates}
              isRequired
              isInvalid={invalid}
              isFetching={isFetching}
              noFetchedUserRepo={noFetchedUserRepo}
            />
          )}
          rules={{ required: true }}
        />
      </FormGroup>
      <ErrorTemplateFeedback
        templates={isCustomTemplate ? customTemplates : renkuLabTemplates}
        isCustomTemplate={isCustomTemplate}
        error={error}
      />
    </>
  );
};
