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
import { useCallback, useContext, useEffect, useState } from "react";
import { Trash, XLg } from "react-bootstrap-icons";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";

import { Loader } from "../../../components/Loader";

import type {
  Project,
  ProjectMemberResponse,
  ProjectPatch,
} from "../api/projectV2.api";
import {
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
  useDeleteProjectsByProjectIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMutation,
} from "../api/projectV2.enhanced-api";
import type { Repository } from "../projectV2.types";

import AddProjectMemberModal from "../fields/AddProjectMemberModal";
import ProjectDescriptionFormField from "../fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../fields/ProjectNameFormField";
import ProjectNamespaceFormField from "../fields/ProjectNamespaceFormField";
import ProjectRepositoryFormField from "../fields/ProjectRepositoryFormField";
import ProjectVisibilityFormField from "../fields/ProjectVisibilityFormField";

import { useNavigate } from "react-router-dom-v5-compat";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import AppContext from "../../../utils/context/appContext.ts";
import { Url } from "../../../utils/helpers/url";
import { notificationProjectDeleted } from "../../ProjectPageV2/ProjectPageContent/Settings/ProjectDelete.tsx";
import { SettingEditOption } from "./projectV2Show.types";

export type ProjectV2Metadata = Omit<ProjectPatch, "repositories">;

interface ProjectDeleteConfirmationProps {
  isOpen: boolean;
  toggle: () => void;
  project: Project;
}

export function ProjectDeleteConfirmation({
  isOpen,
  toggle,
  project,
}: ProjectDeleteConfirmationProps) {
  const navigate = useNavigate();
  const { notifications } = useContext(AppContext);
  const [deleteProject, result] = useDeleteProjectsByProjectIdMutation();
  const onDelete = useCallback(() => {
    deleteProject({ projectId: project.id });
  }, [deleteProject, project.id]);
  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  useEffect(() => {
    if (result.isSuccess) {
      navigate(Url.get(Url.pages.projectV2.list));
      if (notifications)
        notificationProjectDeleted(notifications, project.name);
    }
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [
    result.isError,
    result.isSuccess,
    toggle,
    navigate,
    notifications,
    project.name,
  ]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader className={cx("text-danger", "fw-bold")}>
        Delete project
      </ModalHeader>
      <ModalBody className="pt-0">
        <p className={cx("mb-0", "pb-3")}>
          Deleted projects cannot be restored. Please type{" "}
          <strong>{project.slug}</strong>, the slug of the project, to confirm.
        </p>
        <Input
          data-cy="delete-confirmation-input"
          value={typedName}
          onChange={onChange}
        />
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button className="ms-2" color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          className="ms-2"
          color="danger"
          disabled={typedName !== project.slug?.trim()}
          onClick={onDelete}
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Trash className={cx("bi", "me-1")} />
          )}
          Delete project
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ProjectEditSubmitGroupProps {
  isUpdating: boolean;
  onCancel: () => void;
}
function ProjectEditSubmitGroup({
  isUpdating,
  onCancel,
}: ProjectEditSubmitGroupProps) {
  return (
    <div className={cx("d-flex", "justify-content-between")}>
      <Button disabled={isUpdating} color="outline-rk-green" onClick={onCancel}>
        Cancel
      </Button>
      <div>
        <Button disabled={isUpdating} className="me-1" type="submit">
          {isUpdating && <Loader inline={true} size={16} />} Update
        </Button>
      </div>
    </div>
  );
}

interface ProjectV2MetadataFormProps {
  project: Project;
  setSettingEdit: (option: SettingEditOption) => void;
}
export function ProjectV2MetadataForm({
  project,
  setSettingEdit,
}: ProjectV2MetadataFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProjectV2Metadata>({
    defaultValues: {
      description: project.description,
      name: project.name,
      namespace: project.namespace,
      visibility: project.visibility,
    },
  });

  const [updateProject, { isLoading, error }] =
    usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;
  const onCancel = useCallback(() => {
    setSettingEdit(null);
  }, [setSettingEdit]);

  const onSubmit = useCallback(
    (data: ProjectV2Metadata) => {
      updateProject({
        "If-Match": project.etag ?? "",
        projectId: project.id,
        projectPatch: data,
      })
        .unwrap()
        .then(() => setSettingEdit(null));
    },
    [project, updateProject, setSettingEdit]
  );

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <div>
      <div className="text-end">
        <Button color="outline-danger" onClick={toggle}>
          Delete
        </Button>
      </div>
      <ProjectDeleteConfirmation
        isOpen={isOpen}
        project={project}
        toggle={toggle}
      />

      {error && <RtkErrorAlert error={error} />}

      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ProjectNameFormField name="name" control={control} errors={errors} />
        <ProjectNamespaceFormField
          name="namespace"
          control={control}
          entityName="project"
          errors={errors}
        />
        <ProjectDescriptionFormField
          name="description"
          control={control}
          errors={errors}
        />
        <ProjectVisibilityFormField
          name="visibility"
          control={control}
          errors={errors}
        />
        <ProjectEditSubmitGroup isUpdating={isUpdating} onCancel={onCancel} />
      </Form>
    </div>
  );
}

export function ProjectV2MembersForm({
  project,
  setSettingEdit,
}: ProjectV2MetadataFormProps) {
  const { data, isLoading } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const toggleAddMemberModalOpen = useCallback(() => {
    setIsAddMemberModalOpen((open) => !open);
  }, []);

  const [deleteMember] =
    useDeleteProjectsByProjectIdMembersAndMemberIdMutation();
  const onCancel = useCallback(() => {
    setSettingEdit(null);
  }, [setSettingEdit]);

  const onDelete = useCallback(
    (member: ProjectMemberResponse) => {
      deleteMember({ projectId: project.id, memberId: member.id });
    },
    [deleteMember, project.id]
  );

  if (isLoading) return <Loader />;
  if (data == null)
    return (
      <>
        <h4>Project Members</h4>
        <div className="mb-3">Could not load members</div>
        <div>
          <Button onClick={onCancel}>Close</Button>
        </div>
      </>
    );
  return (
    <>
      <div className={cx("d-flex", "justify-content-between")}>
        <h4>Project Members</h4>
        <div>
          <Button
            data-cy="project-add-member"
            onClick={toggleAddMemberModalOpen}
          >
            Add
          </Button>
        </div>
      </div>
      <Table>
        <tbody>
          {data.map((d, i) => {
            return (
              <tr key={d.id}>
                <td>{d.email ?? d.id}</td>
                <td>{d.role}</td>
                <td>
                  <Button
                    color="outline-danger"
                    data-cy={`delete-member-${i}`}
                    onClick={() => onDelete(d)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        members={data}
        projectId={project.id}
        toggle={toggleAddMemberModalOpen}
      />
      <div className={cx("d-flex", "justify-content-end")}>
        <Button disabled={isLoading} onClick={onCancel}>
          Close
        </Button>
      </div>
    </>
  );
}

type ProjectV2Repositories = { repositories: Repository[] };

export function ProjectV2RepositoryForm({
  project,
  setSettingEdit,
}: ProjectV2MetadataFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProjectV2Repositories>({
    defaultValues: {
      repositories: project.repositories
        ? project.repositories.map((s) => ({
            url: s,
          }))
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray<ProjectV2Repositories>({
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

  const [updateProject, { isLoading, isError }] =
    usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;
  const onCancel = useCallback(() => {
    setSettingEdit(null);
  }, [setSettingEdit]);

  const onSubmit = useCallback(
    (data: ProjectV2Repositories) => {
      const repositories = data.repositories.map((r) => r.url);
      updateProject({
        "If-Match": project.etag ?? "",
        projectId: project.id,
        projectPatch: { repositories },
      })
        .unwrap()
        .then(() => setSettingEdit(null));
    },
    [project, updateProject, setSettingEdit]
  );

  return (
    <>
      <div className={cx("d-flex", "justify-content-between")}>
        <h4>Update repositories</h4>
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
        <ProjectEditSubmitGroup isUpdating={isUpdating} onCancel={onCancel} />
        {isError && <div>There was an error</div>}
      </Form>
    </>
  );
}
