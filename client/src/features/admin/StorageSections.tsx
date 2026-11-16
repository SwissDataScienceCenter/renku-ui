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
import {
  Archive,
  CheckLg,
  CupHot,
  Pencil,
  PlusLg,
  Tags,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
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

import { InfoAlert, WarnAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ExternalLink from "~/components/ExternalLink";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";
import { Loader } from "~/components/Loader";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
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
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { NEW_DOCS_USER_PROJECT_STORAGE } from "~/utils/constants/NewDocs";
import {
  PROJECT_STORAGE_MAX_GB,
  PROJECT_STORAGE_MIN_GB,
  PROJECT_STORAGE_STEP_GB,
} from "../ProjectPageV2/ProjectPageContent/ProjectStorage/projectStorage.constants";
import {
  computeResourcesApi,
  useGetResourcePoolsQuery,
  useGetStorageFlavorsQuery,
  useGetStorageQuotasQuery,
  type ResourcePoolWithId,
  type StorageFlavor,
  type StorageQuota,
} from "../sessionsV2/api/computeResources.api";
import AdminListFilter from "./AdminListFilter";
import AdminSectionHeader from "./AdminSectionHeader";
import StorageFlavorValues from "./StorageFlavorValues";
import StorageQuotaValues from "./StorageQuotaValues";

export default function StorageSections() {
  return (
    <>
      <StorageQuotasSection />
      <StorageFlavorsSection />
      <ProjectStorageAllowSection />
    </>
  );
}

function StorageQuotasSection() {
  const { data, error, isLoading } = useGetStorageQuotasQuery();

  return (
    <section>
      <AdminSectionHeader
        action={undefined /*<AddResourceFlavorButton />*/}
        count={!isLoading && !error ? data?.length : undefined}
        icon={Archive}
        title="Storage quotas"
      />

      <p>
        Storage quotas allow you to manage and allocate storage resources for
        different groups and users. Storage quotas are attached to a parent
        resource pool.
      </p>

      <StorageQuotasList />
    </section>
  );
}

function StorageQuotasList() {
  const {
    data: storageQuotas,
    isLoading: isLoadingStorageQuotas,
    error: storageQuotasError,
  } = computeResourcesApi.endpoints.getStorageQuotas.useQueryState();
  const {
    data: resourcePools,
    isLoading: isLoadingResourcePools,
    error: resourcePoolsError,
  } = useGetResourcePoolsQuery({});

  const isLoading = isLoadingStorageQuotas || isLoadingResourcePools;
  const error = storageQuotasError ?? resourcePoolsError;

  const sortedStorageQuotas = useMemo(
    () =>
      storageQuotas
        ? [...storageQuotas].sort(
            (sqA, sqB) => sqA.resource_pool_id - sqB.resource_pool_id,
          )
        : undefined,
    [storageQuotas],
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrDataServicesError dismissible={false} error={error} />;
  }

  if (!resourcePools || resourcePools.length == 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No resource pool has been defined yet. Please check the{" "}
        <Link to={ABSOLUTE_ROUTES.v2.admin.computeResources}>
          compute section
        </Link>
        .
      </InfoAlert>
    );
  }

  if (!sortedStorageQuotas || sortedStorageQuotas.length == 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No storage quota has been defined yet.
      </InfoAlert>
    );
  }

  return (
    <div className={cx("d-flex", "flex-column", "gap-2", "mb-3")}>
      {sortedStorageQuotas.map((storageQuota) => (
        <StorageQuotaItem
          key={storageQuota.id}
          storageQuota={storageQuota}
          resourcePools={resourcePools}
        />
      ))}
    </div>
  );
}

interface StorageQuotaItemProps {
  storageQuota: StorageQuota;
  resourcePools: ResourcePoolWithId[];
}

function StorageQuotaItem({
  storageQuota,
  resourcePools,
}: StorageQuotaItemProps) {
  const { resource_pool_id } = storageQuota;

  const resourcePool = useMemo(
    () => resourcePools.find(({ id }) => id === resource_pool_id),
    [resourcePools, resource_pool_id],
  );

  const name = useMemo(
    () =>
      resourcePool
        ? `${resourcePool.name} | ${storageQuota.storage_flavor_display_name}`
        : storageQuota.id,
    [resourcePool, storageQuota.id, storageQuota.storage_flavor_display_name],
  );

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Card>
      <CardHeader
        className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
        tag="h4"
      >
        <button
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "w-100",
            "p-3",
            "bg-transparent",
            "border-0",
            "fw-bold",
          )}
          onClick={toggle}
          type="button"
        >
          {name}
          <div
            className={cx("align-items-center", "d-flex", "gap-3", "ms-auto")}
          >
            <StorageQuotaValues
              className={cx(
                "d-none",
                "d-lg-inline-flex",
                "fw-normal",
                "small",
                "text-muted",
              )}
              compact
              storageQuota={storageQuota}
            />
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-0">
          <div className={cx("border-bottom", "border-top", "py-2")}>
            {resourcePool ? (
              <>Resource pool: {resourcePool?.name}</>
            ) : (
              <>
                Error: could not load resource pool with ID{" "}
                {storageQuota.resource_pool_id}
              </>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            Storage flavor: {storageQuota.storage_flavor_display_name}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <StorageQuotaValues storageQuota={storageQuota} />
          </div>
        </CardBody>
        <CardBody
          className={cx(
            "d-flex",
            "flex-row",
            "gap-2",
            "justify-content-end",
            "pt-0",
          )}
        >
          {/* <UpdateResourceFlavorButton resourceFlavor={resourceFlavor} />
          <DeleteResourceFlavorButton resourceFlavor={resourceFlavor} /> */}
          TODO: Buttons
        </CardBody>
      </Collapse>
    </Card>
  );
}

function StorageFlavorsSection() {
  const { data, error, isLoading } = useGetStorageFlavorsQuery();

  return (
    <section>
      <AdminSectionHeader
        action={undefined /*<AddResourceFlavorButton />*/}
        count={!isLoading && !error ? data?.length : undefined}
        headerTag="h3"
        icon={CupHot}
        title="Storage flavors"
      />

      <p>Storage flavors are re-usable shapes used by storage quotas.</p>

      <StorageFlavorsList />
    </section>
  );
}

function StorageFlavorsList() {
  const {
    data: storageFlavors,
    error,
    isLoading,
  } = computeResourcesApi.endpoints.getStorageFlavors.useQueryState();

  const [filter, setFilter] = useState("");

  const filteredFlavors = useMemo(() => {
    if (!storageFlavors || !filter) {
      return storageFlavors;
    }
    const lowerCaseFilter = filter.toLowerCase();
    return storageFlavors.filter(({ display_name }) =>
      display_name.toLowerCase().includes(lowerCaseFilter),
    );
  }, [filter, storageFlavors]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrDataServicesError dismissible={false} error={error} />;
  }

  if (!storageFlavors || !filteredFlavors || storageFlavors.length == 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No storage flavor has been defined yet.
      </InfoAlert>
    );
  }

  return (
    <>
      <AdminListFilter filter={filter} onFilterChange={setFilter} />

      {filteredFlavors.length === 0 ? (
        <p className="fst-italic">
          No resource flavor matches the filter <code>{filter}</code>.
        </p>
      ) : (
        <div className={cx("d-flex", "flex-column", "gap-2", "mb-3")}>
          {filteredFlavors.map((storageFlavor) => (
            <StorageFlavorItem
              key={storageFlavor.id}
              storageFlavor={storageFlavor}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface StorageFlavorItemProps {
  storageFlavor: StorageFlavor;
}

function StorageFlavorItem({ storageFlavor }: StorageFlavorItemProps) {
  const {
    display_name,
    k8s_storage_class_name,
    admin_documentation,
    documentation,
  } = storageFlavor;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Card>
      <CardHeader
        className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
        tag="h4"
      >
        <button
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "w-100",
            "p-3",
            "bg-transparent",
            "border-0",
            "fw-bold",
          )}
          onClick={toggle}
          type="button"
        >
          <Tags className={cx("bi", "flex-shrink-0")} />
          {display_name}
          <div
            className={cx("align-items-center", "d-flex", "gap-3", "ms-auto")}
          >
            <StorageFlavorValues
              className={cx(
                "d-none",
                "d-lg-inline-flex",
                "fw-normal",
                "small",
                "text-muted",
              )}
              compact
              storageFlavor={storageFlavor}
            />
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-0">
          <div className={cx("border-bottom", "border-top", "py-2")}>
            Kubernetes storage class name: <code>{k8s_storage_class_name}</code>
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {documentation ? (
              <>
                <h4>User documentation</h4>
                <LazyMarkdown fallback={<>Loading documentation...</>}>
                  {documentation}
                </LazyMarkdown>
              </>
            ) : (
              <p className={cx("mb-0", "text-muted")}>No user documentation</p>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {admin_documentation ? (
              <>
                <h4>Admin documentation</h4>
                <LazyMarkdown fallback={<>Loading admin documentation...</>}>
                  {admin_documentation}
                </LazyMarkdown>
              </>
            ) : (
              <p className={cx("mb-0", "text-muted")}>No admin documentation</p>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <StorageFlavorValues storageFlavor={storageFlavor} />
          </div>
        </CardBody>
        <CardBody
          className={cx(
            "d-flex",
            "flex-row",
            "gap-2",
            "justify-content-end",
            "pt-0",
          )}
        >
          {/* <UpdateResourceFlavorButton resourceFlavor={resourceFlavor} />
          <DeleteResourceFlavorButton resourceFlavor={resourceFlavor} /> */}
          TODO: Buttons
        </CardBody>
      </Collapse>
    </Card>
  );
}

function ProjectStorageAllowSection() {
  const { data, error, isLoading } = useGetStorageAllowQuery({});

  const [filter, setFilter] = useState("");
  const filteredProjects = useMemo(() => {
    if (!data || !filter) return data;
    const lowerCaseFilter = filter.toLowerCase();
    return data.filter(
      ({ name, namespace }) =>
        name.toLowerCase().includes(lowerCaseFilter) ||
        namespace.toLowerCase().includes(lowerCaseFilter),
    );
  }, [data, filter]);

  return (
    <section>
      <AdminSectionHeader
        action={<AddProjectStorageAllowButton />}
        count={!isLoading && !error ? data?.length : undefined}
        icon={Archive}
        title="Project storage"
      />

      <WarnAlert dismissible={false}>
        <h3>Deprecated section</h3>
        The section is deprecated.
      </WarnAlert>

      <p className="mb-2">
        Provide persistent storage for white-listed projects. Mind that only
        projects listed here are allowed to use local storage on the platform.
      </p>
      <p className="mb-4">
        Check out the{" "}
        <ExternalLink href={NEW_DOCS_USER_PROJECT_STORAGE}>
          documentation for project storage
        </ExternalLink>
        .
      </p>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <RtkOrDataServicesError error={error} dismissible={false} />
      ) : !data || !filteredProjects || data.length === 0 ? (
        <InfoAlert dismissible={false} timeout={0}>
          No projects have been white-listed for storage yet.
        </InfoAlert>
      ) : (
        <>
          <AdminListFilter filter={filter} onFilterChange={setFilter} />

          {filteredProjects.length === 0 ? (
            <p className="fst-italic">
              No project matches the filter <code>{filter}</code>.
            </p>
          ) : (
            <ListGroup>
              {filteredProjects.map((project) => (
                <ListGroupItem
                  key={project.project_id}
                  className={cx(
                    "align-items-center",
                    "d-flex",
                    "justify-content-between",
                  )}
                >
                  <div>
                    <strong>{project.namespace}</strong> (max {project.max_size}{" "}
                    GB)
                  </div>
                  <div className={cx("align-items-center", "d-flex", "gap-2")}>
                    <EditProjectStorageAllowButton project={project} />
                    <DeleteProjectStorageAllowButton project={project} />
                  </div>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
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
      <Button color="outline-primary" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        White-list project for storage
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
      <Button color="outline-primary" onClick={toggle} size="sm">
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
      <Button color="outline-danger" onClick={toggle} size="sm">
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
