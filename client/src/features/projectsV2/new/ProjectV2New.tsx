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
import { ChevronDown, InfoCircle } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import { Button, Collapse, Form, FormGroup, FormText, Label } from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import { usePostProjectsMutation } from "../api/projectV2.enhanced-api";
import ProjectDescriptionFormField from "../fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../fields/ProjectNamespaceFormField";
import ProjectSlugFormField from "../fields/ProjectSlugFormField";
import ProjectVisibilityFormField from "../fields/ProjectVisibilityFormField";
import { INITIAL_PROJECT_STATE } from "./projectV2New.constants";
import { NewProjectForm } from "./projectV2New.types";

export default function ProjectV2New() {
  const user = useLegacySelector((state) => state.stateModel.user);
  return (
    <div data-cy="create-new-project-page">
      <h2>Create a new project</h2>
      <p>
        A Renku project groups together data, code, and compute resources for
        you and your collaborators.
      </p>
      {user.logged ? (
        <ProjectV2CreationDetails />
      ) : (
        <LoginAlert
          logged={user.logged}
          textIntro="Only authenticated users can create new projects."
          textPost="to create a new project."
        />
      )}
    </div>
  );
}

function ProjectV2CreationDetails() {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleCollapse = () => setIsCollapseOpen(!isCollapseOpen);

  const [createProject, result] = usePostProjectsMutation();
  const navigate = useNavigate();

  // Form initialization
  const {
    control,
    formState: { errors, touchedFields },
    handleSubmit,
    setValue,
    watch,
  } = useForm<NewProjectForm>({
    mode: "onChange",
    defaultValues: INITIAL_PROJECT_STATE,
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
        namespace: currentNamespace,
        slug: currentSlug,
      });
      navigate(projectUrl);
    }
  }, [currentNamespace, currentSlug, result, navigate]);

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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup disabled={result.isLoading}>
          <div className="mb-3">
            <ProjectNameFormField
              control={control}
              errors={errors}
              name="name"
            />
          </div>

          <div className="mb-1">
            <ProjectNamespaceFormField
              control={control}
              entityName="project"
              errors={errors}
              helpText={ownerHelpText}
              name="namespace"
            />
          </div>

          <div className="mb-3">
            <button
              className={cx("btn", "btn-link", "p-0", "text-decoration-none")}
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
                  name="slug"
                />
              </div>
            </Collapse>

            {errors.slug && touchedFields.slug && (
              <div className={cx("d-block", "invalid-feedback")}>
                <p className="mb-1">
                  You can customize the slug only with lowercase letters,
                  numbers, and hyphens.
                </p>

                {currentName ? (
                  <Button color="danger" size="sm" onClick={resetUrl}>
                    Reset URL
                  </Button>
                ) : (
                  <p className="mb-0">
                    Mind the URL will be updated once you provide a name.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="mb-1">
              <ProjectVisibilityFormField
                name="visibility"
                control={control}
                errors={errors}
              />
            </div>
            <Label className="mb-0" for="projectV2NewForm-users">
              <InfoCircle className="bi" /> You can add members after creating
              the project.
            </Label>
          </div>

          <div className="mb-3">
            <ProjectDescriptionFormField
              control={control}
              errors={errors}
              name="description"
            />
          </div>

          {result.error && (
            <div className="mb-3">
              <RtkOrNotebooksError error={result.error} />
            </div>
          )}

          <Button color="primary" data-cy="project-create-button" type="submit">
            Create
          </Button>
        </FormGroup>
      </Form>
    </>
  );
}
