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

import React, { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { NewProjectFormFields } from "../projectKg.types";
import { NewProjectFormState, ProjectDisplayProps } from "./NewProject.types";

import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import TextInput from "../../../components/form-field/TextInput";
import TextAreaInput from "../../../components/form-field/TextAreaInput";
import { ExternalLink } from "../../../components/ExternalLinks";
import useGetNamespaces from "../../../utils/customHooks/UseGetNamespaces";
import Visibility from "../../../project/new/components/Visibility";
import { Visibilities } from "../../../components/visibility/Visibility";
import TemplateSource from "../../../project/new/components/TemplateSource";
import { Template } from "../../../project/new/components/Template";
import SubmitFormButton from "../../../project/new/components/SubmitFormButton";
import useGetUserProjects from "../../../utils/customHooks/UseGetProjects";
import NamespaceInput from "../components/form/NamespaceInput";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import AppContext from "../../../utils/context/appContext";
import { RepositoriesParams } from "../../templates/templates.types";
import TemplateVariablesInput from "../components/form/TemplateVariablesInput";
import UserTemplateInput from "../components/form/UserTemplateInput";
import {
  getDefaultTemplateVariables,
  validateNewProjectName,
} from "./NewProject.utils";
import AvatarInput from "../components/form/AvatarInput";

interface NewProjectFormProps extends ProjectDisplayProps {
  formState: NewProjectFormState;
  location: unknown;
  onSubmit: SubmitHandler<NewProjectFormFields>;
  importingDataset: boolean;
}

export function NewProjectForm(props: NewProjectFormProps) {
  const {
    control,
    formState,
    handleSubmit,
    getValues,
    getFieldState,
    register,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm<NewProjectFormFields>({
    defaultValues: props.formState.form,
  });
  const { params } = useContext(AppContext);
  const { onSubmit, importingDataset } = props;
  const [userRepositories, setUserRepositories] = useState<
    RepositoriesParams[] | null
  >(null);

  const { fetched: fetchedNamespace } = useGetNamespaces(true);
  const { isFetchingProjects, projectsMember } = useGetUserProjects();
  const createDataAvailable = !isFetchingProjects && fetchedNamespace;
  const renkuLabRepositories =
    params?.TEMPLATES?.repositories ??
    DEFAULT_APP_PARAMS.TEMPLATES.repositories;
  const name = watch("name");
  const namespace = watch("namespace");
  const template = watch("template");
  const templateVariables = watch("templateVariables");
  const isCustomTemplate = watch("isCustomTemplate");
  const userTemplate = watch("userTemplate");

  React.useEffect(() => {
    if (template?.variables) {
      setValue(
        "templateVariables",
        getDefaultTemplateVariables(template.variables || {})
      );
    } else {
      setValue("templateVariables", {});
    }
  }, [template, setValue]);

  React.useEffect(() => {
    setValue("template", undefined);
  }, [setValue, isCustomTemplate]);

  React.useEffect(() => {
    const nameState = getFieldState("name");
    if (nameState.isDirty || nameState.isTouched) {
      clearErrors("name");
      validateNewProjectName(
        name,
        namespace?.full_path || "",
        projectsMember,
        setError
      );
    }
  }, [
    setError,
    clearErrors,
    name,
    namespace?.full_path,
    projectsMember,
    getFieldState,
  ]);

  React.useEffect(() => {
    setValue(
      "slug",
      `${namespace?.full_path}/${
        name ? slugFromTitle(name, true) : "<no title>"
      }`
    );
  }, [setValue, name, namespace]);

  // registers
  register("avatar");

  const isAutomated = false; // TODO

  return (
    <form className="form-rk-green" onSubmit={handleSubmit(props.onSubmit)}>
      <TextInput
        error={formState.errors.name}
        dataCy="input-name"
        help={
          <span>
            A brief name to identify the project. There are a few{" "}
            <ExternalLink
              url="https://docs.gitlab.com/ce/user/reserved_names.html#reserved-project-names"
              title="reserved names"
              role="link"
            />{" "}
            you cannot use
          </span>
        }
        label="Name"
        name="name"
        required={true}
        register={register("name", { required: "A name is required" })}
      />
      <NamespaceInput
        control={control}
        namespaceValue={getValues("namespace")}
        isAutomated={isAutomated}
        register={register("namespace", {
          required: "A namespace is required",
        })}
      />
      <TextInput
        error={formState.errors.slug}
        help="This is automatically derived from Namespace and Title"
        label="Slug"
        name="slug"
        required={true}
        readOnly={true}
        register={register("slug", {
          required:
            "A slug is required; a default is derived from the name, but it can be modified",
        })}
      />
      <TextAreaInput<NewProjectFormFields>
        control={control}
        help="Let people know what the project is about"
        getValue={() => getValues("description")}
        label="Description"
        name="description"
        register={register("description")}
      />
      <Visibility
        namespace={namespace}
        isInvalid={getFieldState("visibility").invalid}
        customVisibility={undefined} // TODO ANDREA get this from params
        register={register("visibility")}
        control={control}
        visibilityValue={getValues("visibility") as Visibilities}
      />
      <AvatarInput register={register("avatar")} control={control} />
      <TemplateSource
        register={register("isCustomTemplate")}
        value={getValues("isCustomTemplate")}
        isRequired={true}
        control={control}
      />
      {isCustomTemplate ? (
        <UserTemplateInput
          register={register("userTemplate")}
          userTemplate={userTemplate}
          control={control}
          setUserRepositories={setUserRepositories}
        />
      ) : null}
      <Template
        control={control}
        register={register("template")}
        template={template}
        isCustomTemplate={getValues("isCustomTemplate")}
        userRepositories={userRepositories}
        renkuLabRepositories={renkuLabRepositories}
      />
      <TemplateVariablesInput
        control={control}
        register={register("templateVariables")}
        template={template}
        templateVariables={templateVariables}
      />
      <SubmitFormButton
        createDataAvailable={createDataAvailable}
        onSubmit={onSubmit}
        importingDataset={importingDataset}
        getValues={getValues}
      />
      {/*<FormWarnings meta={meta} /> TODO: use formState.errors to get fields with errors  */}
      {/*<FormErrors meta={meta} input={input} /> TODO: use formState.errors to get fields with errors */}
    </form>
  );
}
