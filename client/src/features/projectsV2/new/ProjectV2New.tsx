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

import { FormEvent, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom-v5-compat";
import { Form, Label } from "reactstrap";

import FormSchema from "../../../components/formschema/FormSchema";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../utils/helpers/url";

import type { ProjectPost } from "../api/projectV2.api";
import { usePostProjectsMutation } from "../api/projectV2.enhanced-api";

import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import WipBadge from "../shared/WipBadge";
import { ProjectV2DescriptionAndRepositories } from "../show/ProjectV2DescriptionAndRepositories";
import ProjectFormSubmitGroup from "./ProjectV2FormSubmitGroup";
import ProjectV2NewForm from "./ProjectV2NewForm";
import type { NewProjectV2State } from "./projectV2New.slice";
import { setCurrentStep } from "./projectV2New.slice";

function projectToProjectPost(
  project: NewProjectV2State["project"]
): ProjectPost {
  return {
    name: project.metadata.name,
    namespace: project.metadata.namespace,
    slug: project.metadata.slug,
    description: project.metadata.description,
    visibility: project.access.visibility,
    repositories: project.content.repositories
      .map((r) => r.url.trim())
      .filter((r) => r.length > 0),
  };
}

function ProjectV2NewAccessStepHeader() {
  return (
    <>
      <b>Set up visibility and access</b>
      <p>Decide who can see your project and who is allowed to work in it.</p>
    </>
  );
}

function ProjectV2NewHeader({
  currentStep,
}: Pick<NewProjectV2State, "currentStep">) {
  return (
    <>
      <div className="mb-2">
        V2 Projects let you group together related resources and control who can
        access them. {"  "} <WipBadge />
      </div>
      {currentStep === 0 && <ProjectV2NewMetadataStepHeader />}
      {currentStep === 1 && <ProjectV2NewAccessStepHeader />}
      {currentStep === 2 && <ProjectV2NewRepositoryStepHeader />}
      {currentStep === 3 && <ProjectV2NewProjectCreatingStepHeader />}
    </>
  );
}

function ProjectV2NewMetadataStepHeader() {
  return (
    <>
      <b>Describe your project</b>
      <p>Provide some information to explain what your project is about.</p>
    </>
  );
}

function ProjectV2NewProjectCreatingStepHeader() {
  return (
    <>
      <b>Review and create</b>
      <p>Review what has been entered and, if ready, create the project.</p>
    </>
  );
}

function ProjectV2NewRepositoryStepHeader() {
  return (
    <>
      <b>Associate some repositories (optional)</b>
      <p>
        You can associate one or more repositories with the project now if you
        want. This can also be done later at any time.
      </p>
    </>
  );
}

function ProjectV2NewReviewCreateStep({
  currentStep,
}: Pick<NewProjectV2State, "currentStep">) {
  const { project } = useAppSelector((state) => state.newProjectV2);
  const [createProject, result] = usePostProjectsMutation();
  const newProject = projectToProjectPost(project);
  const navigate = useNavigate();
  const onSubmit = useCallback(
    (e: FormEvent<HTMLElement>) => {
      e.preventDefault();
      createProject({ projectPost: newProject });
    },
    [createProject, newProject]
  );

  useEffect(() => {
    if (
      result.isSuccess &&
      project.metadata.namespace &&
      project.metadata.slug
    ) {
      const projectUrl = Url.get(Url.pages.projectV2.show, {
        namespace: project.metadata.namespace,
        slug: project.metadata.slug,
      });
      navigate(projectUrl);
    }
  }, [result, project, navigate]);

  const errorAlert = result.error && <RtkErrorAlert error={result.error} />;

  return (
    <Form className="form-rk-green" noValidate onSubmit={onSubmit}>
      {errorAlert}
      <h4>Review</h4>
      <div className="mb-3">
        <Label>Name</Label>
        <div className="fs-5">{newProject.name}</div>
      </div>
      <div className="mb-3">
        <Label>Namespace</Label>
        <div className="fs-5">{newProject.namespace}</div>
      </div>
      <div className="mb-3">
        <Label>Slug</Label>
        <div className="fs-5">{newProject.slug}</div>
      </div>
      <div className="mb-3">
        <Label>Visibility</Label>
        <div className="fs-5">{newProject.visibility}</div>
      </div>
      <ProjectV2DescriptionAndRepositories project={newProject} />
      <ProjectFormSubmitGroup currentStep={currentStep} />
    </Form>
  );
}

export default function ProjectV2New() {
  const user = useLegacySelector((state) => state.stateModel.user);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCurrentStep(0));
  }, [dispatch]);
  const { currentStep } = useAppSelector((state) => state.newProjectV2);
  if (!user.logged) {
    return <h2>Please log in to create a project.</h2>;
  }
  return (
    <FormSchema
      showHeader={true}
      title="New Project (V2)"
      description={<ProjectV2NewHeader currentStep={currentStep} />}
    >
      {currentStep < 3 && <ProjectV2NewForm currentStep={currentStep} />}
      {currentStep == 3 && (
        <ProjectV2NewReviewCreateStep currentStep={currentStep} />
      )}
    </FormSchema>
  );
}
