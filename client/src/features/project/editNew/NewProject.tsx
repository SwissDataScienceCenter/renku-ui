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

import LoginAlert from "../../../components/loginAlert/LoginAlert";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { NewProjectForm } from "./NewProjectForm";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import { setFormValues } from "./projectForm.slice";
import React from "react";
import { useCreateProjectMutation } from "../projectKg.api";
import { SubmitHandler } from "react-hook-form";
import { NewProjectFormFields } from "../projectKg.types";
import { CreateProjectParams } from "../Project";
import FormSchema from "../../../components/formschema/FormSchema";
import { useLocation } from "react-router-dom";
import { redirectAfterSubmit } from "./NewProject.utils";
import { useHistory } from "react-router";

export function NewProject() {
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useAppDispatch();
  const [createProjectMutation] = useCreateProjectMutation();
  const formState = useAppSelector(({ projectForm }) => projectForm);
  const user = useLegacySelector((state) => state.stateModel.user);
  const location = useLocation();
  const history = useHistory();
  const onSubmit: SubmitHandler<NewProjectFormFields> = React.useCallback(
    async (data: NewProjectFormFields) => {
      setSubmitting(true);
      dispatch(setFormValues(data));
      const submitData = { ...data };

      try {
        // step 1: prepare the project
        const newProjectBody: CreateProjectParams = {
          project: {
            avatar: submitData.avatar,
            description: submitData.description,
            keywords: submitData.keywords,
            namespaceId: submitData.namespace?.id,
            templateId: submitData.template?.id || "",
            templateRepositoryUrl: submitData.userTemplate?.url || "",
            name: submitData.name,
            visibility: submitData.visibility,
          },
        };

        const response = await createProjectMutation(newProjectBody);
        // TODO: Use progress component and show success or error message
        setSubmitting(false);
        if ("data" in response && response.data.message === "Project created") {
          const projectPathWithNamespace = response.data.slug || "";
          redirectAfterSubmit(history, projectPathWithNamespace, undefined);
        } else {
          return;
        }
      } catch (error) {
        setSubmitting(false);
      }
    },
    [dispatch, setSubmitting, createProjectMutation, history]
  );

  if (!user.logged) {
    const textIntro = "Only authenticated users can create new projects.";
    const textPost = "to create a new project.";
    return (
      <LoginAlert
        logged={user.logged}
        textIntro={textIntro}
        textPost={textPost}
      />
    );
  }
  const desc =
    "Create a project to house your files, include datasets, " +
    "plan your work, and collaborate on code, among other things.";

  return (
    <FormSchema showHeader={!submitting} title="New Project" description={desc}>
      <NewProjectForm
        formState={formState}
        importingDataset={false}
        location={location}
        onSubmit={onSubmit}
        submitButtonText="Create Project"
        submitLoaderText="Creating Project"
      />
    </FormSchema>
  );
}
