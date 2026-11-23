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
import { useCallback, useMemo, type ReactNode } from "react";
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

import useAppSelector from "~/utils/customHooks/useAppSelector.hook";
import {
  useGetClassesByClassIdQuery,
  useGetResourcePoolsQuery,
  type ResourceClassWithIdFiltered,
  type ResourcePoolWithIdFiltered,
} from "../../api/computeResources.api";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../session.constants";
import SessionClassSelector from "../SessionClassSelector";
import { SessionRowResourceRequests } from "../SessionsList";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";

interface SelectResourceClassModalProps {
  embedded?: boolean;
  isOpen: boolean;
  onContinue: (
    env: ResourceClassWithIdFiltered,
    diskStorage: number | undefined,
  ) => void;
  onDiskValidChange?: (valid: boolean) => void;
  projectUrl: string;
  resourceClassId?: number | null;
  isCustom: boolean;
}
export function SelectResourceClassModal({
  embedded = false,
  isOpen,
  onContinue,
  onDiskValidChange,
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
    useGetClassesByClassIdQuery(
      resourceClassId ? { classId: `${resourceClassId}` } : skipToken,
    );
  const { sessionClass: savedSessionClassId, storage: savedStorage } =
    useAppSelector(({ startSessionOptionsV2 }) => startSessionOptionsV2);
  const poolsReady =
    !isLoading && resourcePools != null && resourcePools.length > 0 && !isError;

  const userLauncherClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == launcherClass?.id),
    [launcherClass, resourcePools],
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
        usageLimit={{
          resourceClass: userLauncherClass,
          quotaEnforced: false, // TODO: Pass the actual value when available from the API
        }}
      />
    ) : (
      <p>Resource class not available</p>
    );

  const intro = (
    <>
      {isCustom ? (
        <p>Please select one of your available resource classes to continue.</p>
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
    </>
  );
  const layout = (fields: ReactNode, continueButton: ReactNode) => {
    const form = (
      <>
        {intro}
        {fields}
      </>
    );
    if (embedded) {
      return <div>{form}</div>;
    }
    return (
      <Modal centered isOpen={isOpen} size="lg">
        <ModalHeader tag="h2">
          {isCustom
            ? "Modify session launch before start"
            : "Complete missing information for session launch"}
        </ModalHeader>
        <ModalBody>{form}</ModalBody>
        <ModalFooter className="gap-2">
          <Link
            className={cx("btn", "btn-outline-primary")}
            to={projectUrl}
            data-cy="cancel-start-session-button"
          >
            <XLg className={cx("bi", "me-1")} />
            Cancel launch
          </Link>
          {continueButton}
        </ModalFooter>
      </Modal>
    );
  };

  if (!poolsReady || resourcePools == null) {
    return layout(
      isLoading ? (
        <FetchingResourcePools />
      ) : (
        <ErrorOrNotAvailableResourcePools />
      ),
      <Button color="primary" disabled>
        Continue
      </Button>,
    );
  }

  return (
    <ResourceClassFields
      embedded={embedded}
      layout={layout}
      onContinue={onContinue}
      onDiskValidChange={onDiskValidChange}
      resourcePools={resourcePools}
      savedSessionClassId={savedSessionClassId}
      savedStorage={savedStorage}
    />
  );
}

function ResourceClassFields({
  embedded,
  layout,
  onContinue,
  onDiskValidChange,
  resourcePools,
  savedSessionClassId,
  savedStorage,
}: {
  embedded: boolean;
  layout: (fields: ReactNode, continueButton: ReactNode) => ReactNode;
  onContinue: SelectResourceClassModalProps["onContinue"];
  onDiskValidChange?: (valid: boolean) => void;
  resourcePools: ResourcePoolWithIdFiltered[];
  savedSessionClassId: number;
  savedStorage: number;
}) {
  const savedClass =
    savedSessionClassId === 0
      ? undefined
      : resourcePools
          .flatMap((pool) => pool.classes)
          .find((resourceClass) => resourceClass.id == savedSessionClassId);
  const {
    control,
    formState: { isDirty },
    getValues,
    handleSubmit,
    setValue,
    watch,
  } = useForm<SelectResourceClassForm>({
    defaultValues: {
      resourceClass: savedClass,
      diskStorage: diskStorageOrDefault(savedClass, savedStorage),
    },
  });
  const publish = useCallback(
    (
      resourceClass: ResourceClassWithIdFiltered | undefined,
      diskStorage: number | "" | undefined,
    ) => {
      if (!embedded || resourceClass == null) {
        return;
      }
      onContinue(
        resourceClass,
        diskStorageOrDefault(resourceClass, diskStorage),
      );
    },
    [embedded, onContinue],
  );
  const commitDisk = useCallback(
    (
      resourceClass: ResourceClassWithIdFiltered | undefined,
      diskStorage: number | "" | undefined,
    ) => {
      const valid = isDiskChoiceValid(resourceClass, diskStorage);
      onDiskValidChange?.(valid);
      if (!valid || resourceClass == null) {
        return;
      }
      publish(resourceClass, diskStorage);
    },
    [onDiskValidChange, publish],
  );
  const onSubmit = useCallback(() => {
    void handleSubmit((data) => {
      if (data.resourceClass == null) {
        return;
      }
      onContinue(
        data.resourceClass,
        diskStorageOrDefault(data.resourceClass, data.diskStorage),
      );
    })();
  }, [handleSubmit, onContinue]);
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchCurrentSessionClass = watch("resourceClass");
  const watchCurrentDiskStorage = watch("diskStorage");
  const fields = (
    <>
      <div className="field-group">
        <Controller
          control={control}
          name="resourceClass"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <SessionClassSelector
                id="addSessionResourceClass"
                currentSessionClass={value}
                resourcePools={resourcePools}
                onChange={(next) => {
                  const resourceClass = next ?? undefined;
                  onChange(resourceClass);
                  setValue("diskStorage", undefined);
                  commitDisk(resourceClass, undefined);
                }}
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
      </div>
      {watchCurrentSessionClass && (
        <DiskStorageField
          control={control}
          maxStorage={watchCurrentSessionClass.max_storage}
          defaultStorage={watchCurrentSessionClass.default_storage}
          value={watchCurrentDiskStorage}
          onCommit={(diskStorage) =>
            commitDisk(getValues("resourceClass"), diskStorage)
          }
        />
      )}
    </>
  );
  const continueButton = (
    <Button color="primary" disabled={!isDirty} onClick={onSubmit}>
      Continue
    </Button>
  );
  return layout(fields, continueButton);
}

function DiskStorageField({
  control,
  defaultStorage,
  maxStorage,
  onCommit,
  value,
}: {
  control: ReturnType<typeof useForm<SelectResourceClassForm>>["control"];
  defaultStorage: number;
  maxStorage: number;
  onCommit: (diskStorage: number | "" | undefined) => void;
  value: number | "" | undefined;
}) {
  return (
    <div className={cx("field-group", "mt-3")}>
      <div>
        Disk Storage:{" "}
        <span className="fw-bold">
          {typeof value === "number" && value != defaultStorage ? (
            <>{value} GB</>
          ) : (
            <>{defaultStorage} GB (default)</>
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
                max={maxStorage}
                step={STEP_SESSION_STORAGE_GB}
                {...field}
                value={field.value ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  const next = event.target.valueAsNumber;
                  if (raw === "" || isNaN(next)) {
                    field.onChange(raw);
                    onCommit(raw === "" ? "" : Number.NaN);
                    return;
                  }
                  field.onChange(next);
                  onCommit(next);
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
              Default: {defaultStorage} GB, max: {maxStorage} GB
            </FormText>
          </>
        )}
        rules={{
          min: {
            value: MIN_SESSION_STORAGE_GB,
            message: `Please select a value greater than or equal to ${MIN_SESSION_STORAGE_GB}.`,
          },
          max: {
            value: maxStorage,
            message: `Selected disk storage exceeds maximum allowed value (${maxStorage} GB).`,
          },
          validate: {
            integer: (fieldValue: unknown) =>
              fieldValue == null ||
              fieldValue === "" ||
              (!isNaN(parseInt(`${fieldValue}`, 10)) &&
                parseInt(`${fieldValue}`, 10) == parseFloat(`${fieldValue}`)),
          },
          deps: ["resourceClass"],
        }}
      />
    </div>
  );
}

interface SelectResourceClassForm {
  resourceClass: ResourceClassWithIdFiltered | undefined;
  diskStorage: number | "" | undefined;
}

function diskStorageOrDefault(
  resourceClass: ResourceClassWithIdFiltered | undefined,
  diskStorage: number | "" | undefined,
): number | undefined {
  if (
    resourceClass == null ||
    diskStorage == null ||
    diskStorage === "" ||
    diskStorage === resourceClass.default_storage
  ) {
    return undefined;
  }
  return diskStorage;
}

function isDiskChoiceValid(
  resourceClass: ResourceClassWithIdFiltered | undefined,
  diskStorage: number | "" | undefined,
): boolean {
  if (resourceClass == null) {
    return false;
  }
  if (diskStorage == null || diskStorage === "") {
    return true;
  }
  return isValidDiskStorage(diskStorage, resourceClass.max_storage);
}

function isValidDiskStorage(value: number, maxStorage: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_SESSION_STORAGE_GB &&
    value <= maxStorage
  );
}
