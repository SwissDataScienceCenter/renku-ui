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
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusLg, TrashFill, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import Select, { ClassNamesConfig, SingleValue } from "react-select";
import {
  Button,
  Form,
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

import { ErrorAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useDeleteDataConnectorsStorageAllowByProjectIdMutation,
  useGetDataConnectorsStorageAllowQuery,
  usePostDataConnectorsStorageAllowMutation,
} from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import {
  PROJECT_STORAGE_MAX_GB,
  PROJECT_STORAGE_MIN_GB,
  PROJECT_STORAGE_STEP_GB,
} from "../ProjectPageV2/ProjectPageContent/DataConnectors/projectDataConnectors.constants.ts";
import { type Project } from "../projectsV2/api/projectV2.api";
import { useGetProjectsQuery } from "../projectsV2/api/projectV2.enhanced-api";

import styles from "~/features/projectsV2/fields/ProjectNamespaceFormField.module.scss";

export default function ProjectStorageAllowSection() {
  const { data, error, isLoading } = useGetDataConnectorsStorageAllowQuery({});

  return (
    <section className="my-4">
      <h2>Project Storage Allow List</h2>
      <AddProjectStorageAllowButton />
      {isLoading && <Loader />}
      {error && (
        <ErrorAlert>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </ErrorAlert>
      )}
      {data && (
        <>
          <div>
            <ListGroup>
              {data.map((e) => (
                <ListGroupItem key={e.project_id}>
                  <div
                    className={cx(
                      "d-flex",
                      "justify-content-between",
                      "align-items-center",
                    )}
                  >
                    <div>
                      <strong>Project {e.project_id}</strong>
                    </div>
                    <div>max {e.max_size} GB</div>
                    <RemoveProjectStorageAllowButton projectId={e.project_id} />
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          </div>
        </>
      )}
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
      <AddProjectStorageAllowModal isOpen={isOpen} toggle={toggle} />
    </div>
  );
}

const selectClassNames: ClassNamesConfig<Project, false> = {
  control: ({ menuIsOpen }) =>
    cx(menuIsOpen ? "rounded-top" : "rounded", "border", styles.control),
  dropdownIndicator: () => cx("pe-3"),
  input: () => cx("px-3"),
  menu: () => cx("bg-white", "rounded-bottom", "border"),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-flex",
      "flex-column",
      "flex-sm-row",
      "column-gap-3",
      "px-3",
      "py-2",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected,
    ),
  placeholder: () => cx("px-3"),
  loadingMessage: () => cx("p-3"),
  singleValue: () =>
    cx("d-flex", "flex-column", "flex-sm-row", "column-gap-3", "px-3"),
};

interface ProjectSelectorProps {
  currentProject?: string;
  isFetchingMore?: boolean;
  projects?: Project[];
  onChange?: (newValue: SingleValue<Project>) => void;
  onSetQuery: (q: string) => void;
  query: string;
}

function ProjectSelector({
  currentProject,
  isFetchingMore,
  projects,
  onChange,
  onSetQuery,
  query,
}: ProjectSelectorProps) {
  const currentValue = useMemo(
    () => projects?.find(({ id }) => currentProject === id),
    [projects, currentProject],
  );

  // const components = useMemo(
  //   () => ({
  //     ...selectComponents,
  //     NoOptionsMessage: CustomNoOptionsMessage({ query }),
  //   }),
  //   [query],
  // );

  return (
    <Select
      options={projects}
      value={currentValue}
      unstyled
      getOptionValue={(option) => option.id}
      getOptionLabel={(option) => option.name}
      onChange={onChange}
      classNames={selectClassNames}
      classNamePrefix="namespace-select"
      // components={components}
      isClearable={true}
      isSearchable={true}
      isLoading={isFetchingMore}
      onInputChange={onSetQuery}
    />
  );
}

interface ProjectControlProps {
  className: string;
  "data-cy": string;
  id: string;
  onChange: (newValue: SingleValue<Project>) => void;
  value?: string;
}

export function ProjectControl(props: ProjectControlProps) {
  const [lookupQuery, setLookupQuery] = useState<string | undefined>(undefined);
  const { className, id, onChange, value } = props;
  const dataCy = props["data-cy"];

  // TODO: implement pagination and search for projects
  const { data, error, isLoading } = useGetProjectsQuery({
    params: {
      page: 1,
      per_page: 20,
      direct_member: false,
      namespace: "",
    },
  });

  if (error || data == null) {
    return <RtkOrDataServicesError error={error} dismissible={false} />;
  }

  return (
    <div className={className} data-cy={dataCy} id={id}>
      <ProjectSelector
        currentProject={value}
        isFetchingMore={isLoading}
        query={lookupQuery || ""}
        projects={data?.projects as Project[]}
        onChange={onChange}
        onSetQuery={(query: string) => setLookupQuery(query)}
      />
    </div>
  );
}

interface ProjectStorageAllowForm {
  project_id: string;
  max_size: number;
}

interface AddProjectStorageAllowModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddProjectStorageAllowModal({
  isOpen,
  toggle,
}: AddProjectStorageAllowModalProps) {
  const { control, handleSubmit } = useForm<ProjectStorageAllowForm>({
    mode: "onChange",
    defaultValues: {
      project_id: "",
      max_size: 10,
    },
  });
  const [postDataConnectorsStorageAllowMutation, result] =
    usePostDataConnectorsStorageAllowMutation();

  const onSubmit = async (values: ProjectStorageAllowForm) => {
    const result = await postDataConnectorsStorageAllowMutation({
      projectStorageAllowPost: {
        project_id: values.project_id,
        max_size: values.max_size,
      },
    });

    if (!result.error) {
      toggle();
    }
  };

  useEffect(() => {
    if (isOpen) {
      control._reset({
        project_id: "",
        max_size: 10,
      });
      result.reset();
    }
  }, [control, isOpen]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Add Project to Storage Allow List
      </ModalHeader>
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {result.error && <RtkOrDataServicesError error={result.error} />}
          <div className="mb-3">
            <Label for="project_id">Project</Label>
            <Controller
              control={control}
              name="project_id"
              render={({ field, fieldState: { error } }) => (
                <>
                  <ProjectControl
                    className={cx(error && "is-invalid")}
                    data-cy="project-select"
                    id="project_id"
                    onChange={(newValue: SingleValue<Project>) =>
                      field.onChange(newValue?.id)
                    }
                    value={field.value}
                  />
                  <div className="invalid-feedback">
                    {error?.message || "Please select a project."}
                  </div>
                </>
              )}
              rules={{ required: "Please select a project." }}
            />
          </div>
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
                      max={PROJECT_STORAGE_MAX_GB}
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
                </>
              )}
              rules={{
                required: true,
                min: {
                  value: PROJECT_STORAGE_MIN_GB,
                  message: `Please select a value greater than or equal to ${PROJECT_STORAGE_MIN_GB}.`,
                },
                max: {
                  value: PROJECT_STORAGE_MAX_GB,
                  message: `Selected value exceeds maximum allowed value (${PROJECT_STORAGE_MAX_GB} GB).`,
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
            <PlusLg className={cx("bi", "me-1")} />
            Add
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface RemoveProjectStorageAllowButtonProps {
  projectId: string;
}

function RemoveProjectStorageAllowButton({
  projectId,
}: RemoveProjectStorageAllowButtonProps) {
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
        projectId={projectId}
        isOpen={isOpen}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteProjectStorageAllowModalProps {
  isOpen: boolean;
  projectId: string;
  toggle: () => void;
}

function DeleteProjectStorageAllowModal({
  isOpen,
  projectId,
  toggle,
}: DeleteProjectStorageAllowModalProps) {
  const [deleteStorageAllow, result] =
    useDeleteDataConnectorsStorageAllowByProjectIdMutation();
  const onDelete = useCallback(() => {
    deleteStorageAllow({ projectId });
  }, [deleteStorageAllow, projectId]);

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2" toggle={toggle}>
        Are you sure?
      </ModalHeader>
      <ModalBody>
        {result.error && <RtkOrDataServicesError error={result.error} />}

        <p className="mb-0">
          Please confirm that you want to remove project{" "}
          <strong>{projectId}</strong> from the storage allow list.
        </p>
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
