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
import { CheckLg, XLg } from "react-bootstrap-icons";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Table,
} from "reactstrap";

import { Loader } from "../../../components/Loader";

import {
  useDeleteProjectsByProjectIdMutation,
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
  useGetProjectsByProjectIdMembersQuery,
  usePatchProjectsByProjectIdMutation,
} from "../api/projectV2.enhanced-api";
import type { Member, Project, ProjectPatch } from "../api/projectV2.api";
import type { Repository } from "../projectV2.types";

import AddProjectMemberModal from "../fields/AddProjectMemberModal";
import ProjectDescriptionFormField from "../fields/ProjectDescriptionFormField";
import ProjectNameFormField from "../fields/ProjectNameFormField";
import ProjectRepositoryFormField from "../fields/ProjectRepositoryFormField";
import ProjectVisibilityFormField from "../fields/ProjectVisibilityFormField";

import { SettingEditOption } from "./projectV2Show.types";

type ProjectV2Metadata = Omit<ProjectPatch, "repositories">;

interface ProjectDeleteConfirmationProps {
  isOpen: boolean;
  toggle: () => void;
  project: Project;
}

function ProjectDeleteConfirmation({
  isOpen,
  toggle,
  project,
}: ProjectDeleteConfirmationProps) {
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
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalBody>
        <h3 className={cx("fs-6", "lh-base", "text-danger", "fw-bold")}>
          Are you absolutely sure?
        </h3>
        <p className="mb-0">
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
        <Button className="ms-2" color="outline-rk-green" onClick={toggle}>
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
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete project
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
      <Button disabled={isUpdating} onClick={onCancel}>
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
      visibility: project.visibility,
    },
  });

  const [updateProject, { isLoading, isError }] =
    usePatchProjectsByProjectIdMutation();

  const isUpdating = isLoading;
  const onCancel = useCallback(() => {
    setSettingEdit(null);
  }, [setSettingEdit]);

  const onSubmit = useCallback(
    (data: ProjectV2Metadata) => {
      updateProject({ projectId: project.id, projectPatch: data })
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
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ProjectNameFormField name="name" control={control} errors={errors} />
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
        {isError && <div>There was an error</div>}
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
    (member: Member) => {
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
              <tr key={d.member.id}>
                <td>{d.member.email ?? d.member.id}</td>
                <td>{d.role}</td>
                <td>
                  <Button
                    color="outline-danger"
                    data-cy={`delete-member-${i}`}
                    onClick={() => onDelete(d.member)}
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
      updateProject({ projectId: project.id, projectPatch: { repositories } })
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
