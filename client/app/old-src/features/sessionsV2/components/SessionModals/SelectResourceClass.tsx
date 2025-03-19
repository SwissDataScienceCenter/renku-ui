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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useMemo } from "react";
import { XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
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

import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { SessionRowResourceRequests } from "../../../session/components/SessionsList";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../../session/startSessionOptions.constants";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";

interface SelectResourceClassModalProps {
  isOpen: boolean;
  onContinue: (env: ResourceClass, diskStorage: number | undefined) => void;
  projectUrl: string;
  resourceClassId?: number | null;
  isCustom: boolean;
}
export function SelectResourceClassModal({
  isOpen,
  onContinue,
  projectUrl,
  resourceClassId,
  isCustom,
}: SelectResourceClassModalProps) {
  const {
    data: resourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery({});

  const { data: launcherClass, isLoading: isLoadingLauncherClass } =
    useGetResourceClassByIdQuery(resourceClassId ?? skipToken);

  const {
    control,
    formState: { isDirty },
    handleSubmit,
    watch,
  } = useForm<SelectResourceClassForm>();

  const onSubmitInner = useCallback(
    (data: SelectResourceClassForm) => {
      if (data.resourceClass) {
        const diskStorage =
          data.diskStorage != null &&
          data.diskStorage != data.resourceClass.default_storage
            ? data.diskStorage
            : undefined;
        onContinue(data.resourceClass, diskStorage);
      }
    },
    [onContinue]
  );
  const onSubmit = useMemo(
    () => handleSubmit(onSubmitInner),
    [handleSubmit, onSubmitInner]
  );

  const watchCurrentSessionClass = watch("resourceClass");
  const watchCurrentDiskStorage = watch("diskStorage");

  const selector = isLoading ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length == 0 || isError ? (
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

  const resourceDetails =
    !isLoadingLauncherClass && launcherClass ? (
      <SessionRowResourceRequests
        resourceRequests={{
          cpu: launcherClass.cpu,
          memory: `${launcherClass.memory}G`,
          storage: `${launcherClass.default_storage}G`,
          gpu: launcherClass.gpu,
        }}
      />
    ) : (
      <p>Resource class not available</p>
    );

  return (
    <Modal centered isOpen={isOpen} size="lg">
      <ModalHeader>
        {isCustom
          ? "Modify session launch before start"
          : "Complete missing information for session launch"}
      </ModalHeader>
      <ModalBody>
        {isCustom ? (
          <p>
            Please select one of your available resource classes to continue.
          </p>
        ) : (
          <p>
            You do not have access to the default resource class of this session
            launcher. Please select one of your available resource classes to
            continue.
          </p>
        )}
        {launcherClass && (
          <p>
            <span className={cx("fw-bold", "me-3")}>
              Original requested resources:
            </span>
            <span>{resourceDetails}</span>
          </p>
        )}
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
                  <FormText>
                    Default: {watchCurrentSessionClass.default_storage} GB, max:{" "}
                    {watchCurrentSessionClass.max_storage} GB
                  </FormText>
                  <div className="invalid-feedback">
                    {error?.message ||
                      "Please provide a valid value for disk storage."}
                  </div>
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
      <ModalFooter className="gap-2">
        <Link
          className={cx("btn", "btn-outline-primary")}
          to={projectUrl}
          data-cy="start-session-button"
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel launch
        </Link>
        <Button color="primary" disabled={!isDirty} onClick={onSubmit}>
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface SelectResourceClassForm {
  resourceClass: ResourceClass | undefined;
  diskStorage: number | undefined;
}
