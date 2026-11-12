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
 * limitations under the License
 */

import cx from "classnames";
import { useEffect, useMemo } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  ModalBody,
  ModalFooter,
  UncontrolledTooltip,
} from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useGetStorageAllowByProjectIdQuery,
  usePatchStorageByStorageIdMutation,
  usePostStorageMutation,
} from "~/features/cloudStorage/api/projectCloudStorage.api";
import type { ProjectStorageV2 } from "~/features/cloudStorage/api/projectCloudStorage.api";
import {
  ProjectConnectDataConnectorModeSwitch,
  type switchModeProps,
} from "~/features/ProjectPageV2/ProjectPageContent/DataConnectors/ProjectConnectDataConnectorsModal";
import {
  useGetStorageQuotasQuery,
  type StorageQuota,
} from "~/features/sessionsV2/api/computeResources.api";
import {
  PROJECT_STORAGE_DEFAULT_GB,
  PROJECT_STORAGE_DEFAULT_MOUNT_PATH,
  PROJECT_STORAGE_MAX_GB,
  PROJECT_STORAGE_MIN_GB,
  PROJECT_STORAGE_STEP_GB,
} from "./projectStorage.constants";

interface ProjectStorageV2FormValues {
  storageQuotaId: string;
  size: number;
  mountPath: string;
}

interface ProjectStorageV2FormProps {
  projectId: string;
  storage?: ProjectStorageV2;
  switchMode?: switchModeProps;
  toggle: () => void;
}

export default function ProjectStorageV2Form({
  projectId,
  storage,
  switchMode,
  toggle,
}: ProjectStorageV2FormProps) {
  const { data: storageQuotas, isLoading, error } = useGetStorageQuotasQuery();

  if (isLoading) {
    return (
      <ModalBody data-cy="project-storage-body">
        {switchMode && (
          <div className="mb-3">
            <ProjectConnectDataConnectorModeSwitch
              mode="add-storage-v2"
              switchMode={switchMode}
            />
          </div>
        )}
        <Loader />
      </ModalBody>
    );
  }

  if (error || storageQuotas == null) {
    return (
      <ModalBody data-cy="project-storage-body">
        {switchMode && (
          <div className="mb-3">
            <ProjectConnectDataConnectorModeSwitch
              mode="add-storage-v2"
              switchMode={switchMode}
            />
          </div>
        )}
        <p>Error: could not load storage classes</p>
        <RtkOrDataServicesError error={error} dismissible={false} />
      </ModalBody>
    );
  }

  if (storage == null && storageQuotas.length == 0) {
    return (
      <ModalBody data-cy="project-storage-body">
        {switchMode && (
          <div className="mb-3">
            <ProjectConnectDataConnectorModeSwitch
              mode="add-storage-v2"
              switchMode={switchMode}
            />
          </div>
        )}
        <p>Error: no available storage class</p>
      </ModalBody>
    );
  }

  return (
    <ProjectStorageV2FormInner
      projectId={projectId}
      storage={storage}
      storageQuotas={storageQuotas}
      switchMode={switchMode}
      toggle={toggle}
    />
  );
}

function ProjectStorageV2FormInner({
  projectId,
  storage,
  storageQuotas,
  switchMode,
  toggle,
}: ProjectStorageV2FormProps & {
  storageQuotas: StorageQuota[];
}) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ProjectStorageV2FormValues>({
    mode: "onChange",
    defaultValues: {
      // TODO: handle edit
      // size: projectStorage?.size ?? PROJECT_STORAGE_DEFAULT_GB,
      // mountPath:
      //   projectStorage?.mount_path ?? PROJECT_STORAGE_DEFAULT_MOUNT_PATH,

      storageQuotaId:
        storage?.storage_quota_id ?? storageQuotas.at(0)?.id ?? "",
      size:
        storage?.actual_size ??
        storage?.requested_size ??
        PROJECT_STORAGE_DEFAULT_GB,
      mountPath: storage?.mount_path ?? PROJECT_STORAGE_DEFAULT_MOUNT_PATH,
    },
  });

  const [postStorageMutation, postStorageStatus] = usePostStorageMutation();
  const [patchStorageByStorageIdMutation, patchStorageByStorageIdStatus] =
    usePatchStorageByStorageIdMutation();
  const { data: storageAllowData } = useGetStorageAllowByProjectIdQuery({
    projectId: projectId,
  });
  const projectStorageMaxSize =
    storageAllowData?.max_size ?? PROJECT_STORAGE_MAX_GB;

  const onSubmit = async (values: ProjectStorageV2FormValues) => {
    // if (!projectStorage) {
    //   // Create new project storage
    //   const result = await postStorageMutation({
    //     projectStoragePost: {
    //       namespace: namespace ?? "",
    //       size: values.size,
    //       mount_path: values.mountPath,
    //     },
    //   });
    //   if (!result.error) {
    //     toggle();
    //   }
    // } else {
    //   // Update existing project storage
    //   const result = await patchStorageByStorageIdMutation({
    //     storageId: projectStorage.id,
    //     "If-Match": projectStorage.etag ?? "",
    //     projectStoragePatch: {
    //       size: values.size,
    //       mount_path: values.mountPath,
    //     },
    //   });
    //   if (!result.error) {
    //     toggle();
    //   }
    // }
  };

  return (
    <>
      <ModalBody data-cy="project-storage-body">
        {switchMode && (
          <div className="mb-3">
            <ProjectConnectDataConnectorModeSwitch
              mode="add-storage-v2"
              switchMode={switchMode}
            />
          </div>
        )}

        <RtkOrDataServicesError
          error={postStorageStatus.error || patchStorageByStorageIdStatus.error}
        />
        {storage == null && (
          <InfoAlert dismissible={false} timeout={0}>
            You can add a project storage to this project. Project storage will
            be mounted in your sessions and jobs (not in apps). Project owners
            and project editors will have read-write access, while other users
            will have read-only access to this storage.
          </InfoAlert>
        )}
        <div className="mb-3">
          <Controller
            control={control}
            name="storageQuotaId"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                {/* <SessionClassSelector
                  id="addSessionResourceClass"
                  currentSessionClass={value}
                  resourcePools={resourcePools}
                  onChange={onChange}
                />
                {error && (
                  <div className={cx("small", "text-danger")}>
                    {error.message || "Please provide a valid resource class."}
                  </div>
                )} */}
              </>
            )}
            rules={{ required: "Please provide a resource class." }}
          />
        </div>
        <div className="mb-3">
          <Label className="form-label" for="size">
            Storage size
          </Label>
          <Controller
            control={control}
            name="size"
            render={({ field, fieldState: { error } }) => (
              <>
                <InputGroup className={cx(error && "is-invalid")}>
                  <Input
                    id="size"
                    data-cy="project-storage-form-size-input"
                    className={cx(error && "is-invalid")}
                    type="number"
                    min={PROJECT_STORAGE_MIN_GB}
                    max={projectStorageMaxSize}
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
                  {error?.message ||
                    "Please provide a valid value for project storage."}
                </div>
                <FormText>
                  Default: {PROJECT_STORAGE_DEFAULT_GB} GB, max:{" "}
                  {projectStorageMaxSize} GB
                </FormText>
              </>
            )}
            rules={{
              required: true,
              min: {
                value: PROJECT_STORAGE_MIN_GB,
                message: `Please select a value greater than or equal to ${PROJECT_STORAGE_MIN_GB}.`,
              },
              max: {
                value: projectStorageMaxSize,
                message: `Selected project storage exceeds maximum allowed value (${projectStorageMaxSize} GB).`,
              },
              validate: {
                integer: (value: unknown) =>
                  Number.isInteger(Number(value)) ||
                  "Please provide an integer value.",
              },
            }}
          />
        </div>
        <div className="mb-3">
          <div className={cx("d-flex", "align-items-center", "gap-2", "mb-1")}>
            <Label className="form-label" for="mountPath">
              Mount point
            </Label>
          </div>
          <Controller
            name="mountPath"
            control={control}
            render={({ field }) => (
              <input
                id="mountPath"
                type="text"
                {...field}
                className={cx("form-control", errors.mountPath && "is-invalid")}
                data-cy="project-storage-form-mount-point-input"
              />
            )}
            rules={{ required: true }}
          />
          <div className="invalid-feedback">Please provide a mount point.</div>
          <div className={cx("form-text", "text-muted")}>
            This is where the project storage will be mounted. You can either
            specify an absolute path (starting with `/`) or a relative path
            (relative to your session&apos;s working directory).
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="project-storage-form-cancel-button"
          onClick={() => toggle()}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="project-storage-form-submit-button"
          onClick={handleSubmit(onSubmit)}
        >
          {/* {projectStorage ? (
            "Update project storage"
          ) : (
            <>
              <PlusLg className={cx("bi", "me-1")} />
              Add project storage
            </>
          )} */}
        </Button>
      </ModalFooter>
    </>
  );
}
