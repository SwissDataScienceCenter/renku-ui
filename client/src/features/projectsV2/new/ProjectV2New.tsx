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
import { useCallback, useEffect, useState } from "react";
import {
  CheckLg,
  ChevronDown,
  Folder,
  InfoCircle,
  XLg,
} from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import {
  Button,
  Collapse,
  Form,
  FormGroup,
  FormText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import { usePostProjectsMutation } from "../api/projectV2.enhanced-api";
import ProjectDescriptionFormField from "../fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../fields/ProjectNamespaceFormField";
import ProjectSlugFormField from "../fields/ProjectSlugFormField";
import ProjectVisibilityFormField from "../fields/ProjectVisibilityFormField";
import {
  setProjectCreationModal,
  toggleProjectCreationModal,
} from "./projectV2New.slice";
import { NewProjectForm } from "./projectV2New.types";
import { useGetUserQuery } from "../../usersV2/api/users.api";

export default function ProjectV2New() {
  const { data: userInfo, isLoading: userLoading } = useGetUserQuery();
  const { showProjectCreationModal } = useAppSelector(
    (state) => state.newProjectV2
  );
  const dispatch = useDispatch();
  const toggleModal = useCallback(() => {
    dispatch(toggleProjectCreationModal());
  }, [dispatch]);

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
          data-cy="new-project-modal-header"
          tag="div"
          toggle={toggleModal}
        >
          <h2>
            <Folder className="bi" /> Create a new project
          </h2>
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
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleCollapse = () => setIsCollapseOpen(!isCollapseOpen);

  const [createProject, result] = usePostProjectsMutation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const toggleModal = useCallback(() => {
    dispatch(toggleProjectCreationModal());
  }, [dispatch]);

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
      namespace: "",
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
      dispatch(setProjectCreationModal(false));
    }
  }, [dispatch, result, navigate]);

  const ownerHelpText = (
    <FormText className="input-hint">
      The URL for this project will be{" "}
      <span className="fw-bold">
        renkulab.io/v2/projects/{currentNamespace || "<Owner>"}/
        {currentSlug || "<Name>"}
      </span>
    </FormText>
  );

  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);

  return (
    <>
      <ModalBody data-cy="new-project-modal-body">
        <Form id="project-creation-form" onSubmit={handleSubmit(onSubmit)}>
          <FormGroup className="d-inline" disabled={result.isLoading}>
            {/* //? FormGroup hard codes an additional mb-3. Adding "d-inline" makes it ineffective. */}
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <div>
                <ProjectNameFormField
                  control={control}
                  errors={errors}
                  name="name"
                />
              </div>

              <div>
                <div className="mb-1">
                  <ProjectNamespaceFormField
                    control={control}
                    entityName="project"
                    errors={errors}
                    helpText={ownerHelpText}
                    name="namespace"
                  />
                </div>
                <button
                  className={cx(
                    "btn",
                    "btn-link",
                    "p-0",
                    "text-decoration-none"
                  )}
                  data-cy="project-slug-toggle"
                  onClick={toggleCollapse}
                  type="button"
                >
                  Customize project URL <ChevronDown className="bi" />
                </button>
                <Collapse isOpen={isCollapseOpen}>
                  <div
                    className={cx(
                      "align-items-center",
                      "d-flex",
                      "flex-wrap",
                      "mb-0"
                    )}
                  >
                    <span>
                      renkulab.io/v2/projects/{currentNamespace || "<Owner>"}/
                    </span>
                    <ProjectSlugFormField
                      compact={true}
                      control={control}
                      errors={errors}
                      countAsDirty={dirtyFields.slug && dirtyFields.name}
                      name="slug"
                      resetFunction={resetUrl}
                    />
                  </div>
                </Collapse>

                {dirtyFields.slug && !dirtyFields.name ? (
                  <div className={cx("d-block", "invalid-feedback")}>
                    <p className="mb-0">
                      Mind the URL will be updated once you provide a name.
                    </p>
                  </div>
                ) : (
                  errors.slug &&
                  dirtyFields.slug && (
                    <div className={cx("d-block", "invalid-feedback")}>
                      <p className="mb-1">{errors.slug.message}</p>
                    </div>
                  )
                )}
              </div>

              <div>
                <div className="mb-1">
                  <ProjectVisibilityFormField
                    name="visibility"
                    control={control}
                    errors={errors}
                  />
                </div>
                <Label className="mb-0" for="projectV2NewForm-users">
                  <InfoCircle className="bi" /> You can add members after
                  creating the project.
                </Label>
              </div>

              <ProjectDescriptionFormField
                control={control}
                errors={errors}
                name="description"
              />

              {result.error && <RtkOrNotebooksError error={result.error} />}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter data-cy="new-project-modal-footer">
        <Button color="outline-primary" onClick={toggleModal} type="button">
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
