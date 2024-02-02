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

import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button, Form, Label } from "reactstrap";

import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";

import {
  ProjectDescriptionFormField,
  ProjectNameFormField,
  ProjectRepositoryFormField,
  ProjectSlugFormField,
  ProjectVisibilityFormField,
} from "../fields";

import ProjectFormSubmitGroup from "./ProjectV2FormSubmitGroup";
import type { NewProjectV2State } from "./projectV2New.slice";
import {
  setAccess,
  setContent,
  setCurrentStep,
  setMetadata,
} from "./projectV2New.slice";

interface ProjectV2NewFormProps {
  currentStep: NewProjectV2State["currentStep"];
}
export default function ProjectV2NewForm({
  currentStep,
}: ProjectV2NewFormProps) {
  return (
    <div className="form-rk-green mb-4 w-100">
      {currentStep === 0 && (
        <ProjectV2NewMetadataStepForm currentStep={currentStep} />
      )}
      {currentStep === 1 && (
        <ProjectV2NewAccessStepForm currentStep={currentStep} />
      )}
      {currentStep === 2 && (
        <ProjectV2NewRepositoryStepForm currentStep={currentStep} />
      )}
    </div>
  );
}

function ProjectV2NewAccessStepForm({ currentStep }: ProjectV2NewFormProps) {
  const dispatch = useDispatch();
  const { project } = useAppSelector((state) => state.newProjectV2);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<NewProjectV2State["project"]["access"]>({
    defaultValues: project.access,
  });

  const onSubmit = useCallback(
    (data: NewProjectV2State["project"]["access"]) => {
      dispatch(setAccess(data));
      const nextStep = (currentStep + 1) as typeof currentStep;
      dispatch(setCurrentStep(nextStep));
    },
    [currentStep, dispatch]
  );
  return (
    <>
      <h4>Define access</h4>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
        />
        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <Label className="form-label" for="projectV2NewForm-users">
              You can add members after creating the project.
            </Label>
          </div>
        </div>
        <ProjectFormSubmitGroup currentStep={currentStep} />
      </Form>
    </>
  );
}

function ProjectV2NewMetadataStepForm({ currentStep }: ProjectV2NewFormProps) {
  const dispatch = useDispatch();
  const { project } = useAppSelector((state) => state.newProjectV2);
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<NewProjectV2State["project"]["metadata"]>({
    defaultValues: project.metadata,
  });

  const name = watch("name");
  useEffect(() => {
    setValue("slug", slugFromTitle(name, true, true));
  }, [setValue, name]);

  const onSubmit = useCallback(
    (data: NewProjectV2State["project"]["metadata"]) => {
      dispatch(setMetadata(data));
      const nextStep = (currentStep + 1) as typeof currentStep;
      dispatch(setCurrentStep(nextStep));
    },
    [currentStep, dispatch]
  );

  return (
    <>
      <h4>Describe the project</h4>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ProjectNameFormField control={control} errors={errors} name="name" />
        <ProjectSlugFormField control={control} errors={errors} name="slug" />
        <ProjectDescriptionFormField
          control={control}
          errors={errors}
          name="description"
        />
        <ProjectFormSubmitGroup currentStep={currentStep} />
      </Form>
    </>
  );
}

function ProjectV2NewRepositoryStepForm({
  currentStep,
}: ProjectV2NewFormProps) {
  const dispatch = useDispatch();
  const { project } = useAppSelector((state) => state.newProjectV2);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<NewProjectV2State["project"]["content"]>({
    defaultValues: project.content,
  });
  const { fields, append, remove } = useFieldArray<
    NewProjectV2State["project"]["content"]
  >({
    control,
    name: "repositories",
  });

  const onAppend = useCallback(() => {
    append({ url: "" });
  }, [append]);
  const onDelete = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  const onSubmit = useCallback(
    (data: NewProjectV2State["project"]["content"]) => {
      dispatch(setContent(data));
      const nextStep = (currentStep + 1) as typeof currentStep;
      dispatch(setCurrentStep(nextStep));
    },
    [currentStep, dispatch]
  );
  return (
    <>
      <div className="d-flex justify-content-between">
        <h4>Add repositories</h4>
        <div>
          <Button data-cy="project-add-repository" onClick={onAppend}>
            Add
          </Button>
        </div>
      </div>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-3">
          {fields.map((f, i) => {
            return (
              <div key={f.id}>
                <ProjectRepositoryFormField
                  control={control}
                  errors={errors}
                  id={f.id}
                  index={i}
                  name={`repositories.${i}.url`}
                  onDelete={() => onDelete(i)}
                />
              </div>
            );
          })}
        </div>
        <ProjectFormSubmitGroup currentStep={currentStep} />
      </Form>
    </>
  );
}
