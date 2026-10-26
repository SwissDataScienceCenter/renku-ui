/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { CheckLg, Pencil, PlusLg, TrashFill, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useDeleteStorageAllowByProjectIdMutation,
  useGetStorageAllowQuery,
  usePatchStorageAllowByProjectIdMutation,
  usePostStorageAllowMutation,
} from "~/features/cloudStorage/api/projectCloudStorage.api";
import {
  useGetStorageConfigQuery,
  type ProjectStorageAllow,
} from "~/features/cloudStorage/api/projectCloudStorage.generated-api";
import {
  PROJECT_STORAGE_MAX_GB,
  PROJECT_STORAGE_MIN_GB,
  PROJECT_STORAGE_STEP_GB,
} from "../ProjectPageV2/ProjectPageContent/ProjectStorage/projectStorage.constants";

export default function ProjectStorageAllowSection() {
  const { data, error, isLoading } = useGetStorageAllowQuery({});

  return (
    <section className="mt-4">
      <h2>Project Storage Allow List</h2>
      <AddProjectStorageAllowButton />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <RtkOrDataServicesError error={error} dismissible={false} />
      ) : data ? (
        <>
          <ListGroup>
            {data.map((e) => (
              <ListGroupItem
                key={e.project_id}
                className={cx(
                  "d-flex",
                  "justify-content-between",
                  "align-items-center",
                )}
              >
                <div>
                  <strong>{e.namespace}</strong> (max {e.max_size} GB)
                </div>
                <div className={cx("d-flex", "gap-2")}>
                  <EditProjectStorageAllowButton project={e} />
                  <DeleteProjectStorageAllowButton project={e} />
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        </>
      ) : null}
    </section>
  );
}

function AddProjectStorageAllowButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <div className="mb-2">
      <Button color="primary" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Project to Storage Allow List
      </Button>
      <AddOrEditProjectStorageAllowModal isOpen={isOpen} toggle={toggle} />
    </div>
  );
}

function EditProjectStorageAllowButton({
  project,
}: {
  project: ProjectStorageAllow;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="primary" onClick={toggle}>
        <Pencil className={cx("bi", "me-1")} />
        Edit
      </Button>
      <AddOrEditProjectStorageAllowModal
        isOpen={isOpen}
        toggle={toggle}
        project={project}
      />
    </>
  );
}

interface ProjectStorageAllowForm {
  project_slug: string;
  max_size: number;
}

interface AddOrEditProjectStorageAllowModalProps {
  isOpen: boolean;
  toggle: () => void;
  project?: ProjectStorageAllow;
}

function AddOrEditProjectStorageAllowModal({
  isOpen,
  toggle,
  project,
}: AddOrEditProjectStorageAllowModalProps) {
  const { data: storageConfig } = useGetStorageConfigQuery();
  const maxSize = storageConfig?.max_size ?? PROJECT_STORAGE_MAX_GB;

  const { control, handleSubmit, reset } = useForm<ProjectStorageAllowForm>({
    mode: "onChange",
    defaultValues: {
      project_slug: "",
      max_size: project?.max_size ?? maxSize,
    },
  });
  const [postStorageAllowMutation, result] = usePostStorageAllowMutation();

  const [patchStorageAllowByProjectIdMutation, patchResult] =
    usePatchStorageAllowByProjectIdMutation();

  const onSubmit = async (values: ProjectStorageAllowForm) => {
    if (project) {
      // Update existing project storage allow entry
      const result = await patchStorageAllowByProjectIdMutation({
        projectId: project.project_id,
        "If-Match": project.etag ?? "",
        projectStorageAllowPatch: {
          max_size: values.max_size,
        },
      });
      if (!result.error) {
        toggle();
      }
      return;
    }

    // Create new project storage allow entry
    const result = await postStorageAllowMutation({
      projectStorageAllowPost: {
        project_ref: { slug: values.project_slug },
        max_size: values.max_size,
      },
    });

    if (!result.error) {
      toggle();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      result.reset();
      patchResult.reset();
    }
  }, [isOpen, reset, result, patchResult]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        {project ? "Edit Project Storage" : "Add Project Storage"}
      </ModalHeader>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          {patchResult.error && (
            <RtkOrDataServicesError error={patchResult.error} />
          )}
          {project ? (
            <div className="mb-3">
              <Label for="project">Project</Label>
              <Input
                id="project"
                type="text"
                value={project.namespace}
                disabled
              />
            </div>
          ) : (
            <div className="mb-3">
              <Label for="project_slug">Project Slug</Label>
              <Controller
                control={control}
                name="project_slug"
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      id="project_slug"
                      className={cx(error && "is-invalid")}
                      type="text"
                      {...field}
                    />
                    <div className="invalid-feedback">
                      {error?.message || "Please enter a valid project slug."}
                    </div>
                  </>
                )}
                rules={{ required: true }}
              />
            </div>
          )}
          <div className="mb-3">
            <Label className="form-label" for="max_size">
              Max Size
            </Label>
            <Controller
              control={control}
              name="max_size"
              render={({ field, fieldState: { error } }) => (
                <>
                  <InputGroup className={cx(error && "is-invalid")}>
                    <Input
                      id="max_size"
                      type="number"
                      min={PROJECT_STORAGE_MIN_GB}
                      max={maxSize}
                      step={PROJECT_STORAGE_STEP_GB}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        if (isNaN(event.target.valueAsNumber)) {
                          field.onChange(event.target.value);
                        } else {
                          field.onChange(event.target.valueAsNumber);
                        }
                      }}
                    />
                    <InputGroupText id="configure-project-storage-addon">
                      GB
                    </InputGroupText>
                    <UncontrolledTooltip target="configure-project-storage-addon">
                      Gigabytes
                    </UncontrolledTooltip>
                  </InputGroup>
                  <div className="invalid-feedback">
                    {error?.message || "Please provide a valid value."}
                  </div>
                  <FormText>Max: {maxSize} GB</FormText>
                </>
              )}
              rules={{
                required: true,
                min: {
                  value: PROJECT_STORAGE_MIN_GB,
                  message: `Please select a value greater than or equal to ${PROJECT_STORAGE_MIN_GB}.`,
                },
                max: {
                  value: maxSize,
                  message: `Selected value exceeds maximum allowed value (${maxSize} GB).`,
                },
                validate: {
                  integer: (value: unknown) =>
                    Number.isInteger(Number(value)) ||
                    "Please provide an integer value.",
                },
              }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="outline-danger" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button color="primary" disabled={result.isLoading} type="submit">
            {project ? (
              <>
                <CheckLg className={cx("bi", "me-1")} />
                Update
              </>
            ) : (
              <>
                <PlusLg className={cx("bi", "me-1")} />
                Add
              </>
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface DeleteProjectStorageAllowButtonProps {
  project: ProjectStorageAllow;
}

function DeleteProjectStorageAllowButton({
  project,
}: DeleteProjectStorageAllowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-danger" onClick={toggle}>
        <TrashFill className={cx("bi", "me-1")} />
        Remove
      </Button>
      <DeleteProjectStorageAllowModal
        project={project}
        isOpen={isOpen}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteProjectStorageAllowModalProps {
  isOpen: boolean;
  project: ProjectStorageAllow;
  toggle: () => void;
}

function DeleteProjectStorageAllowModal({
  isOpen,
  project,
  toggle,
}: DeleteProjectStorageAllowModalProps) {
  const [deleteStorageAllow, result] =
    useDeleteStorageAllowByProjectIdMutation();
  const onDelete = useCallback(() => {
    deleteStorageAllow({ projectId: project.project_id });
  }, [deleteStorageAllow, project.project_id]);

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Are you sure?
      </ModalHeader>
      <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}
        <p className="mb-0">
          Please confirm that you want to remove project{" "}
          <strong>{project.namespace}</strong> from the storage allow list.
        </p>
        <WarnAlert className={cx("mt-3")} dismissible={false} color="danger">
          <p className="mb-0">
            This action cannot be undone. All data stored in the project storage
            will be permanently deleted.
          </p>
        </WarnAlert>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={result.isLoading}
          onClick={onDelete}
          type="button"
          role="button"
        >
          <TrashFill className={cx("bi", "me-1")} />
          Remove
        </Button>
      </ModalFooter>
    </Modal>
  );
}
