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
 * limitations under the License
 */

import cx from "classnames";
import { useCallback, useEffect } from "react";
import { XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { SuccessAlert } from "../../../components/Alert";
import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import BootstrapCopyIcon from "../../../components/icons/BootstrapCopyIcon";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import {
  type Project,
  type Visibility,
} from "../../projectsV2/api/projectV2.api";
import { usePostProjectsByProjectIdCopiesMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import ProjectNameFormField from "../../projectsV2/fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectOwnerSlugFormField from "../../projectsV2/fields/ProjectOwnerSlugFormField";
import ProjectVisibilityFormField from "../../projectsV2/fields/ProjectVisibilityFormField";
import { useGetUserQuery } from "../../usersV2/api/users.api";

interface ProjectCopyModalProps {
  currentUser: ReturnType<typeof useGetUserQuery>["data"];
  isOpen: boolean;
  project: Project;
  toggle: () => void;
}

interface ProjectCopyFormValues {
  name: string;
  namespace: string;
  slug: string;
  visibility: Visibility;
}

export default function ProjectCopyModal({
  currentUser,
  isOpen,
  project,
  toggle,
}: ProjectCopyModalProps) {
  const [copyProject, copyProjectResult] =
    usePostProjectsByProjectIdCopiesMutation();

  useEffect(() => {
    if (!isOpen) copyProjectResult.reset();
  }, [copyProjectResult, isOpen]);
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: project.name,
      namespace: currentUser ? currentUser.username : project.namespace,
      slug: project.slug,
      visibility: project.visibility,
    },
  });
  const name = watch("name");
  useEffect(() => {
    setValue("slug", slugFromTitle(name, true, true));
  }, [setValue, name]);
  const onSubmit = useCallback(
    (values: ProjectCopyFormValues) => {
      copyProject({
        projectId: project.id,
        projectPost: {
          name: values.name,
          namespace: values.namespace,
          slug: values.slug,
          visibility: values.visibility,
        },
      });
    },
    [copyProject, project.id]
  );

  const formId = "project-copy-form";
  return (
    <Modal
      data-cy="copy-modal"
      backdrop="static"
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
    >
      <Form id={formId} noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggle}>
          <span className="fw-normal">Make a copy of </span>
          {project.namespace}/{project.slug}
        </ModalHeader>
        <ModalBody>
          <div
            className={cx("fs-6", "fst-italic", "text-body-secondary", "mb-4")}
          >
            Copying a project will create a new project with the same data
            connectors, repositories, and launchers as the original.
          </div>
          {copyProjectResult.error != null && (
            <div className="w-100">
              <RtkOrDataServicesError error={copyProjectResult.error} />
            </div>
          )}
          <ProjectNameFormField
            control={control}
            errors={errors}
            formId={formId}
            name="name"
          />
          <ProjectNamespaceFormField
            control={control}
            entityName={`${formId}-project`}
            errors={errors}
            name="namespace"
          />
          <ProjectOwnerSlugFormField
            control={control}
            errors={errors}
            formId={formId}
            getValues={getValues}
            name="slug"
            namespaceName="namespace"
            watch={watch}
          />
          <ProjectVisibilityFormField
            formId={formId}
            name="visibility"
            control={control}
            errors={errors}
          />
          {copyProjectResult.data != null && (
            <div>
              <ProjectCopySuccessAlert
                project={copyProjectResult.data}
                hasError={copyProjectResult.error != null}
                toggle={toggle}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            disabled={copyProjectResult.isLoading}
            color="outline-primary"
            onClick={toggle}
          >
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button
            disabled={
              copyProjectResult.isLoading || copyProjectResult.isSuccess
            }
            color="primary"
            type="submit"
          >
            <BootstrapCopyIcon className={cx("bi", "me-1")} />
            Copy
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface ProjectCopySuccessAlertProps
  extends Pick<ProjectCopyModalProps, "toggle"> {
  project: Project;
  hasError: boolean;
}

function ProjectCopySuccessAlert({
  hasError,
  project,
  toggle,
}: ProjectCopySuccessAlertProps) {
  const navigate = useNavigate();
  const namespace = project.namespace;
  const slug = project.slug;
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace,
    slug,
  });
  return (
    <SuccessAlert dismissible={false} timeout={0}>
      <div className="d-flex align-items-baseline justify-content-between">
        <div>
          Your project has been copied.
          {hasError && (
            <span className={cx("fw-bold")}>
              Check the error message for limitations on the new project.
            </span>
          )}
        </div>
        <div>
          <Button
            color="outline-primary"
            onClick={() => {
              toggle();
              navigate(projectUrl);
            }}
          >
            Go to new project
          </Button>
        </div>
      </div>
    </SuccessAlert>
  );
}
