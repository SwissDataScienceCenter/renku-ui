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
import { Link } from "react-router-dom";
import { Button, Form, Label } from "reactstrap";

import { Loader } from "../../../components/Loader";
import FormSchema from "../../../components/formschema/FormSchema";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../utils/helpers/url";

import { usePostProjectsMutation } from "../api/projectV2.enhanced-api";
import type { ProjectPost } from "../api/projectV2.api";
import { ProjectV2DescriptionAndRepositories } from "../show/ProjectV2Show";

import type { NewProjectV2State } from "./projectV2New.slice";
import { projectWasCreated, setCurrentStep } from "./projectV2New.slice";
import ProjectFormSubmitGroup from "./ProjectV2FormSubmitGroup";
import ProjectV2NewForm from "./ProjectV2NewForm";
import WipBadge from "../shared/WipBadge";
import { ArrowLeft } from "react-bootstrap-icons";

function projectToProjectPost(
  project: NewProjectV2State["project"]
): ProjectPost {
  return {
    name: project.metadata.name,
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

function ProjectV2BeingCreatedLoader() {
  return (
    <div className={cx("d-flex", "justify-content-center", "w-100")}>
      <div className={cx("d-flex", "flex-column")}>
        <Loader className="me-2" />
        <div>Creating project...</div>
      </div>
    </div>
  );
}

function ProjectV2BeingCreated({
  result,
}: {
  result: ReturnType<typeof usePostProjectsMutation>[1];
}) {
  const dispatch = useDispatch();

  const previousStep = useCallback(() => {
    dispatch(setCurrentStep(2));
  }, [dispatch]);

  useEffect(() => {
    if (result.isSuccess) {
      dispatch(projectWasCreated());
    }
  }, [dispatch, result.isSuccess]);

  if (result.isLoading) {
    return <ProjectV2BeingCreatedLoader />;
  }

  if (result.isError || result.data == null) {
    return (
      <div>
        <p>Something went wrong.</p>
        <div className={cx("d-flex", "justify-content-between")}>
          <Button onClick={previousStep}>
            <ArrowLeft /> Back
          </Button>
        </div>
      </div>
    );
  }
  const projectList = Url.get(Url.pages.v2Projects.list);
  return (
    <>
      <div>Project created.</div>
      {"  "}
      <Link to={projectList}>Go to project list</Link>
    </>
  );
}

function ProjectV2NewReviewCreateStep({
  currentStep,
}: Pick<NewProjectV2State, "currentStep">) {
  const { project } = useAppSelector((state) => state.newProjectV2);
  const [createProject, result] = usePostProjectsMutation();
  const newProject = projectToProjectPost(project);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLElement>) => {
      e.preventDefault();
      createProject({ projectPost: newProject });
    },
    [createProject, newProject]
  );

  if (result != null && !result.isUninitialized) {
    return <ProjectV2BeingCreated result={result} />;
  }

  return (
    <Form className="form-rk-green" noValidate onSubmit={onSubmit}>
      <h4>Review</h4>
      <div className="mb-3">
        <Label>Name</Label>
        <div className="fs-5">{newProject.name}</div>
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
  }, []); // eslint-disable-line
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
