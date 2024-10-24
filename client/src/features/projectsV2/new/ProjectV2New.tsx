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

import cx from "classnames";
import { FormEvent, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import { Form, Label } from "reactstrap";

import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import FormSchema from "../../../components/formschema/FormSchema";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";

import type { ProjectPost } from "../api/projectV2.api";
import { usePostProjectsMutation } from "../api/projectV2.enhanced-api";

import LoginAlert from "../../../components/loginAlert/LoginAlert";
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
      <p>
        V2 Projects let you group together related resources and control who can
        access them.
        <WipBadge className="ms-1" />
      </p>
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
      <h4>Describe your project</h4>
      <p>Provide some information to explain what your project is about.</p>
    </>
  );
}

function ProjectV2NewProjectCreatingStepHeader() {
  return (
    <>
      <h4>Review and create</h4>
      <p>Review what has been entered and, if ready, create the project.</p>
    </>
  );
}

function ProjectV2NewRepositoryStepHeader() {
  return (
    <>
      <h4>Associate some repositories (optional)</h4>
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
      const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: project.metadata.namespace,
        slug: project.metadata.slug,
      });
      navigate(projectUrl);
    }
  }, [result, project, navigate]);

  const errorAlert = result.error && <RtkErrorAlert error={result.error} />;

  return (
    <Form noValidate onSubmit={onSubmit}>
      {errorAlert}
      <h4>Review</h4>
      <div>
        <Label>Name</Label>
        <p className="fw-bold">{newProject.name}</p>
        <Label>Namespace</Label>
        <p className="fw-bold">{newProject.namespace}</p>
        <Label>Slug</Label>
        <p className="fw-bold">{newProject.slug}</p>
        <Label>Visibility</Label>
        <p className="fw-bold">{newProject.visibility}</p>
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
    const textIntro = "Only authenticated users can create new projects.";
    const textPost = "to create a new project.";
    return (
      <div className={cx("d-flex", "flex-column")}>
        <h2 className={cx("mb-0", "me-2")}>New project</h2>
        <LoginAlert
          logged={user.logged}
          textIntro={textIntro}
          textPost={textPost}
        />
      </div>
    );
  }
  return (
    <FormSchema
      showHeader={true}
      title="New Project"
      description={<ProjectV2NewHeader currentStep={currentStep} />}
    >
      {currentStep < 3 && <ProjectV2NewForm currentStep={currentStep} />}
      {currentStep == 3 && (
        <ProjectV2NewReviewCreateStep currentStep={currentStep} />
      )}
    </FormSchema>
  );
}
