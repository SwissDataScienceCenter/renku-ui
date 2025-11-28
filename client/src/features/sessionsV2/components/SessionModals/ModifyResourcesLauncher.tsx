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
import { useCallback, useEffect, useMemo } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { SuccessAlert } from "~/components/Alert";
import { Loader } from "~/components/Loader";
import { SessionClassSelectorV2 } from "~/features/session/components/options/SessionClassOption";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "~/features/session/startSessionOptions.constants";
import {
  useGetResourcePoolsQuery,
  type ResourceClassWithId,
} from "../../api/computeResources.api";
import { usePatchSessionLaunchersByLauncherIdMutation as useUpdateSessionLauncherMutation } from "../../api/sessionLaunchersV2.api";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";

interface ModifyResourcesLauncherModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  resourceClassId?: number;
  diskStorage?: number;
  sessionLauncherId: string;
}

export function ModifyResourcesLauncherModal({
  isOpen,
  sessionLauncherId,
  toggleModal,
  resourceClassId,
  diskStorage,
}: ModifyResourcesLauncherModalProps) {
  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();
  const {
    data: resourcePools,
    isLoading: isLoadingResources,
    isError: isErrorResources,
  } = useGetResourcePoolsQuery({});

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
    watch,
  } = useForm<ModifyResourcesLauncherForm>({
    defaultValues: {
      diskStorage,
    },
  });

  const onSubmitInner = useCallback(
    (data: ModifyResourcesLauncherForm) => {
      if (data.resourceClass) {
        const diskStorage =
          data.diskStorage &&
          data.diskStorage != data.resourceClass.default_storage
            ? data.diskStorage
            : null;
        updateSessionLauncher({
          launcherId: sessionLauncherId,
          sessionLauncherPatch: {
            resource_class_id: data.resourceClass.id,
            disk_storage: diskStorage,
          },
        });
      }
    },
    [sessionLauncherId, updateSessionLauncher]
  );
  const onSubmit = useMemo(
    () => handleSubmit(onSubmitInner),
    [handleSubmit, onSubmitInner]
  );

  useEffect(() => {
    const currentSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id === resourceClassId);
    reset({
      resourceClass: currentSessionClass,
      diskStorage,
    });
  }, [diskStorage, reset, resourceClassId, resourcePools]);

  useEffect(() => {
    if (!isOpen) {
      const currentSessionClass = resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id === resourceClassId);
      reset({
        resourceClass: currentSessionClass,
        diskStorage,
      });
    }
  }, [diskStorage, isOpen, reset, resourceClassId, resourcePools]);

  const watchCurrentSessionClass = watch("resourceClass");
  const watchCurrentDiskStorage = watch("diskStorage");

  const selector = isLoadingResources ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length == 0 || isErrorResources ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <Controller
      control={control}
      name="resourceClass"
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <SessionClassSelectorV2
            id="addSessionResourceClass"
            currentSessionClass={value}
            resourcePools={resourcePools}
            onChange={onChange}
          />
          {error && (
            <div className={cx("small", "text-danger")}>
              {error.message || "Please provide a valid resource class."}
            </div>
          )}
        </>
      )}
      rules={{ required: "Please provide a resource class." }}
    />
  );

  return (
    <Modal
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggleModal}
    >
      <ModalHeader tag="h2" toggle={toggleModal}>
        Set default resource class
      </ModalHeader>
      <ModalBody>
        {result.error && (
          <ErrorOrNotAvailableResourcePools title="Error modifying resources" />
        )}
        {result.isSuccess && (
          <SuccessAlert dismissible={false}>
            <h3 className={cx("fs-6", "fw-bold")}>
              Default resource class updated
            </h3>
            <p className="mb-0">
              The session launcher’s default resource class has been changed.
              This change will apply the next time you launch a new session.
            </p>
          </SuccessAlert>
        )}
        <p>
          These changes will apply the{" "}
          <strong>next time you launch a new session</strong>. If you wish to
          modify a currently running session, pause it and select ‘Modify
          session’ in the session options.
        </p>
        <div className="field-group">{selector}</div>
        {watchCurrentSessionClass && (
          <div className={cx("field-group", "mt-3")}>
            <div>
              Disk Storage:{" "}
              <span className="fw-bold">
                {watchCurrentDiskStorage &&
                watchCurrentDiskStorage !=
                  watchCurrentSessionClass.default_storage ? (
                  <>{watchCurrentDiskStorage} GB</>
                ) : (
                  <>{watchCurrentSessionClass?.default_storage} GB (default)</>
                )}
              </span>
            </div>
            <Controller
              control={control}
              name="diskStorage"
              render={({ field, fieldState: { error } }) => (
                <>
                  <InputGroup className={cx(error && "is-invalid")}>
                    <Input
                      className={cx(error && "is-invalid")}
                      type="number"
                      min={MIN_SESSION_STORAGE_GB}
                      max={watchCurrentSessionClass.max_storage}
                      step={STEP_SESSION_STORAGE_GB}
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
                    <InputGroupText id="configure-disk-storage-addon">
                      GB
                    </InputGroupText>
                    <UncontrolledTooltip target="configure-disk-storage-addon">
                      Gigabytes
                    </UncontrolledTooltip>
                  </InputGroup>
                  <div className="invalid-feedback">
                    {error?.message ||
                      "Please provide a valid value for disk storage."}
                  </div>
                  <FormText>
                    Default: {watchCurrentSessionClass.default_storage} GB, max:{" "}
                    {watchCurrentSessionClass.max_storage} GB
                  </FormText>
                </>
              )}
              rules={{
                min: {
                  value: MIN_SESSION_STORAGE_GB,
                  message: `Please select a value greater than or equal to ${MIN_SESSION_STORAGE_GB}.`,
                },
                max: {
                  value: watchCurrentSessionClass.max_storage,
                  message: `Selected disk storage exceeds maximum allowed value (${watchCurrentSessionClass.max_storage} GB).`,
                },
                validate: {
                  integer: (value: unknown) =>
                    value == null ||
                    value === "" ||
                    (!isNaN(parseInt(`${value}`, 10)) &&
                      parseInt(`${value}`, 10) == parseFloat(`${value}`)),
                },
                deps: ["resourceClass"],
              }}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={
            isLoadingResources ||
            !resourcePools ||
            resourcePools.length == 0 ||
            isErrorResources ||
            !isDirty
          }
          onClick={onSubmit}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Modify resources
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface ModifyResourcesLauncherForm {
  resourceClass: ResourceClassWithId | undefined;
  diskStorage: number | undefined;
}
