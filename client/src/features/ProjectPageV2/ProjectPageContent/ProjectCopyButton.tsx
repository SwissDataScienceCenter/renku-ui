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
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { ArrowRightShort } from "react-bootstrap-icons";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";

import { type Visibility } from "../../projectsV2/api/projectV2.api";
import { usePostProjectsByProjectIdCopiesMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import { useGetUserQuery } from "../../usersV2/api/users.api";
import ProjectNameFormField from "../../projectsV2/fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../../projectsV2/fields/ProjectNamespaceFormField";
import ProjectOwnerSlugFormField from "../../projectsV2/fields/ProjectOwnerSlugFormField";
import ProjectVisibilityFormField from "../../projectsV2/fields/ProjectVisibilityFormField";

import { useProject } from "../ProjectPageContainer/ProjectPageContainer";

interface ProjectCopyModalProps {
  currentUser: ReturnType<typeof useGetUserQuery>["data"];
  isOpen: boolean;
  project: ReturnType<typeof useProject>["project"];
  toggle: () => void;
}

interface ProjectCopyFormValues {
  name: string;
  namespace: string;
  slug: string;
  visibility: Visibility;
}

function ProjectCopyModal({
  currentUser,
  isOpen,
  project,
  toggle,
}: ProjectCopyModalProps) {
  const navigate = useNavigate();
  const [copyProject, copyProjectResult] =
    usePostProjectsByProjectIdCopiesMutation();
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
  useEffect(() => {
    const namespace = copyProjectResult.data?.namespace;
    const slug = copyProjectResult.data?.slug;
    if (copyProjectResult.isSuccess && namespace && slug) {
      toggle();
      const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace,
        slug,
      });
      navigate(projectUrl);
    }
  }, [copyProjectResult, navigate, toggle]);
  return (
    <Modal backdrop="static" isOpen={isOpen} toggle={toggle} size="lg" centered>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggle}>
          Make a copy of{" "}
          <span className="fst-italic">
            {project.namespace}/{project.slug}
          </span>
        </ModalHeader>
        <ModalBody>
          <ProjectNameFormField control={control} errors={errors} name="name" />
          <ProjectNamespaceFormField
            control={control}
            entityName="project"
            errors={errors}
            name="namespace"
          />
          <ProjectOwnerSlugFormField
            control={control}
            errors={errors}
            getValues={getValues}
            name="slug"
            namespaceName="namespace"
            watch={watch}
          />
          <ProjectVisibilityFormField
            name="visibility"
            control={control}
            errors={errors}
          />
        </ModalBody>
        <ModalFooter>
          {copyProjectResult.error != null && (
            <div className="w-100">
              <RtkOrNotebooksError error={copyProjectResult.error} />
            </div>
          )}
          <Button
            disabled={copyProjectResult.isLoading}
            color="outline-secondary"
            onClick={toggle}
          >
            Cancel
          </Button>
          <Button
            disabled={
              copyProjectResult.isLoading || copyProjectResult.error != null
            }
            color="primary"
            type="submit"
          >
            Copy project
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

export default function ProjectCopyButton() {
  const { project } = useProject();
  const { data: currentUser } = useGetUserQuery();

  const [isModalOpen, setModalOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setModalOpen((open) => !open);
  }, []);
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Button
        color="outline-secondary"
        className={cx("d-flex", "align-items-center")}
        data-cy="copy-project-button"
        onClick={toggleOpen}
      >
        <ArrowRightShort className={cx("bi")} />
        <span className={cx("ms-2")}>Copy this project</span>
      </Button>
      <ProjectCopyModal
        currentUser={currentUser}
        isOpen={isModalOpen}
        project={project}
        toggle={toggleOpen}
      />
    </div>
  );
}
