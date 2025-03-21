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
import { useCallback, useEffect } from "react";
import { CheckLg, Folder, InfoCircle, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useMatch, useNavigate } from "react-router";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import ModalHeader from "../../../components/modal/ModalHeader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import { useGetUserQuery } from "../../usersV2/api/users.api";
import { usePostProjectsMutation } from "../api/projectV2.enhanced-api";
import ProjectDescriptionFormField from "../fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../fields/ProjectNamespaceFormField";
import SlugPreviewFormField from "../fields/SlugPreviewFormField.tsx";
import ProjectVisibilityFormField from "../fields/ProjectVisibilityFormField";
import { NewProjectForm } from "./projectV2New.types";
import { PROJECT_CREATION_HASH } from "./createProjectV2.constants";

export default function ProjectV2New() {
  const { data: userInfo, isLoading: userLoading } = useGetUserQuery();

  const [hash, setHash] = useLocationHash();
  const showProjectCreationModal = hash === PROJECT_CREATION_HASH;
  const toggleModal = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === PROJECT_CREATION_HASH;
      return isOpen ? "" : PROJECT_CREATION_HASH;
    });
  }, [setHash]);

  return (
    <>
      <Modal
        backdrop="static"
        centered
        data-cy="new-project-modal"
        fullscreen="lg"
        isOpen={showProjectCreationModal}
        scrollable
        size="lg"
        unmountOnClose={true}
        toggle={toggleModal}
      >
        <ModalHeader
          toggle={toggleModal}
          modalTitle={
            <>
              <Folder className="bi" />
              Create a new project
            </>
          }
        >
          <p className={cx("fs-6", "fw-normal", "mb-0")}>
            A Renku project groups together data, code, and compute resources
            for you and your collaborators.
          </p>
        </ModalHeader>

        {userLoading ? (
          <ModalBody>
            <Loader />
          </ModalBody>
        ) : userInfo?.isLoggedIn ? (
          <ProjectV2CreationDetails />
        ) : (
          <ModalBody>
            <LoginAlert
              logged={userInfo?.isLoggedIn ?? false}
              textIntro="Only authenticated users can create new projects."
              textPost="to create a new project."
            />
          </ModalBody>
        )}
      </Modal>
    </>
  );
}

function ProjectV2CreationDetails() {
  const [createProject, result] = usePostProjectsMutation();
  const navigate = useNavigate();
  const groupMatch = useMatch(ABSOLUTE_ROUTES.v2.groups.show.root);

  const [, setHash] = useLocationHash();
  const closeModal = useCallback(() => {
    setHash();
  }, [setHash]);

  // Form initialization
  const {
    control,
    formState: { dirtyFields, errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<NewProjectForm>({
    mode: "onChange",
    defaultValues: {
      description: "",
      name: "",
      namespace: groupMatch?.params.slug ?? "",
      slug: "",
      visibility: "private",
    },
  });

  // We watch for changes in the name and derive the slug from it
  const currentName = watch("name");
  useEffect(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [currentName, setValue]);

  // Slug and namespace are use to show the projected URL
  const currentNamespace = watch("namespace");
  const currentSlug = watch("slug");

  // Project creation utilities
  const onSubmit = useCallback(
    (data: NewProjectForm) => {
      createProject({ projectPost: data });
    },
    [createProject]
  );

  useEffect(() => {
    if (result.isSuccess) {
      const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: result.data.namespace,
        slug: result.data.slug,
      });
      navigate(projectUrl);
    }
  }, [result, navigate]);

  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);

  const url = `renkulab.io/v2/projects/${currentNamespace ?? "<Owner>"}/`;

  const formId = "project-creation-form";

  return (
    <>
      <ModalBody>
        <Form
          data-cy="project-creation-form"
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormGroup className="d-inline" disabled={result.isLoading}>
            {/* //? FormGroup hard codes an additional mb-3. Adding "d-inline" makes it ineffective. */}
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <ProjectNameFormField
                control={control}
                errors={errors}
                formId={formId}
                name="name"
              />

              <div className="mb-1">
                <ProjectNamespaceFormField
                  control={control}
                  ensureNamespace={groupMatch?.params.slug}
                  entityName={`${formId}-project`}
                  errors={errors}
                  name="namespace"
                />
              </div>

              <SlugPreviewFormField
                compact={true}
                control={control}
                errors={errors}
                name="slug"
                resetFunction={resetUrl}
                url={url}
                slug={currentSlug}
                dirtyFields={dirtyFields}
                label="Project URL"
                entityName="project"
              />

              <div className="mb-1">
                <ProjectVisibilityFormField
                  formId={formId}
                  name="visibility"
                  control={control}
                  errors={errors}
                />
              </div>

              <ProjectDescriptionFormField
                control={control}
                errors={errors}
                formId={formId}
                name="description"
              />

              <div>
                <Label className="mb-0" for="projectV2NewForm-users">
                  <InfoCircle className="bi" /> You can add members after
                  creating the project.
                </Label>
              </div>

              {result.error && <RtkOrNotebooksError error={result.error} />}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="outline-primary" onClick={closeModal} type="button">
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="project-create-button"
          form="project-creation-form"
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Create
        </Button>
      </ModalFooter>
    </>
  );
}
