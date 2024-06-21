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

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRepeat,
  ChevronRight,
  EyeFill,
  EyeSlashFill,
  KeyFill,
  SkipForward,
  XLg,
} from "react-bootstrap-icons";
import { Control, Controller, FieldValues, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../components/Loader";

import { useTestCloudStorageConnectionMutation } from "../project/components/cloudStorage/projectCloudStorage.api";
import type {
  CloudStorageDetailsOptions,
  TestCloudStorageConnectionParams,
} from "../project/components/cloudStorage/projectCloudStorage.types";
import { storageDefinitionFromConfig } from "../project/utils/projectCloudStorage.utils";
import type { RCloneOption } from "../projectsV2/api/storagesV2.api";
import type { SessionStartCloudStorageConfiguration } from "../sessionsV2/startSessionOptionsV2.types";

export type SessionLaunchModalCloudStorageConfiguration =
  SessionStartCloudStorageConfiguration;

interface ProgressBreadcrumbsProps {
  cloudStorageConfigs: SessionLaunchModalCloudStorageConfiguration[];
  index: number;
  setCloudStorageConfigs: (
    configs: SessionLaunchModalCloudStorageConfiguration[]
  ) => void;
  setIndex: (index: number) => void;
}
function ProgressBreadcrumbs({
  cloudStorageConfigs,
  index,
  setCloudStorageConfigs,
  setIndex,
}: ProgressBreadcrumbsProps) {
  if (cloudStorageConfigs.length < 2) return null;
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {cloudStorageConfigs.map((cloudStorageConfig, idx) => (
          <li
            className={cx("breadcrumb-item", idx === index && "active")}
            key={cloudStorageConfig.cloudStorage.storage.storage_id}
          >
            <button
              className={cx(
                "btn",
                "btn-link",
                "p-0",
                idx === index && ["text-decoration-none", "link-rk-text"],
                idx > index && "text-decoration-none"
              )}
              disabled={idx >= index}
              onClick={() => {
                const newCloudStorageConfigs = [...cloudStorageConfigs];
                newCloudStorageConfigs[idx] = {
                  ...cloudStorageConfigs[idx],
                  active: true,
                };
                setCloudStorageConfigs(newCloudStorageConfigs);
                setIndex(idx);
              }}
            >
              {cloudStorageConfig.cloudStorage.storage.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface SensitiveFieldInputProps {
  control: Control<FieldValues, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  friendlyName: string;
  defaultValue: string | undefined;
  option: RCloneOption;
}

function SensitiveFieldInput({
  control,
  defaultValue,
  friendlyName,
  option,
}: SensitiveFieldInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = useCallback(() => {
    setShowPassword((showPassword) => !showPassword);
  }, []);

  const tooltipContainerId = `option-is-secret-${option.name}`;
  return (
    <div>
      {/* {option.friendlyName ?? option.name}{" "} */}
      <Label htmlFor={option.name}>
        {friendlyName}
        <div id={tooltipContainerId} className="d-inline">
          <KeyFill className={cx("bi", "ms-1")} />
        </div>
      </Label>

      <Controller
        name={option.name ?? ""}
        control={control}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <>
            <InputGroup className={cx(fieldState.error && "is-invalid")}>
              <Input
                id={option.name}
                type={showPassword ? "text" : "password"}
                className={cx(
                  "form-control",
                  "rounded-0",
                  "rounded-start",
                  fieldState.error && "is-invalid"
                )}
                placeholder={""}
                {...field}
              />
              <Button
                className="rounded-end"
                id={`show-password-${option.name}`}
                onClick={() => toggleShowPassword()}
              >
                {showPassword ? (
                  <EyeFill className="bi" />
                ) : (
                  <EyeSlashFill className="bi" />
                )}
                <UncontrolledTooltip
                  placement="top"
                  target={`show-password-${option.name}`}
                >
                  Hide/show sensitive data
                </UncontrolledTooltip>
              </Button>
            </InputGroup>
          </>
        )}
        rules={{ required: true }}
      />
      <div className="invalid-feedback">Please provide a {option.name}</div>
    </div>
  );
}
interface CloudStorageConfigurationSecretsProps {
  cloudStorageConfig: SessionLaunchModalCloudStorageConfiguration;
  control: SensitiveFieldInputProps["control"];
}

function CloudStorageConfigurationSecrets({
  cloudStorageConfig,
  control,
}: CloudStorageConfigurationSecretsProps) {
  const storage = cloudStorageConfig.cloudStorage.storage;

  return (
    <>
      <div className={cx("d-flex", "align-items-baseline")}>
        <h4>{storage.name}</h4>
        <div className="ms-2">({storage.source_path})</div>
      </div>
      <div>
        {cloudStorageConfig.sensitiveFieldDefinitions.map((field) => {
          const defaultValue =
            cloudStorageConfig.sensitiveFieldValues[field.name] ?? "";
          return (
            <SensitiveFieldInput
              key={field.name}
              control={control}
              defaultValue={defaultValue}
              friendlyName={field.friendlyName}
              option={field}
            />
          );
        })}
      </div>
    </>
  );
}
interface SessionStartCloudStorageSecretsModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onStart: (
    cloudStorageConfigs: SessionLaunchModalCloudStorageConfiguration[]
  ) => void;
  cloudStorageConfigs:
    | SessionLaunchModalCloudStorageConfiguration[]
    | undefined;
}
export default function SessionStartCloudStorageSecretsModal({
  isOpen,
  onCancel,
  onStart,
  cloudStorageConfigs: initialCloudStorageConfigs,
}: SessionStartCloudStorageSecretsModalProps) {
  const noCredentialsConfigs = useMemo(
    () =>
      initialCloudStorageConfigs == null
        ? []
        : initialCloudStorageConfigs.filter(
            (config) => config.sensitiveFieldDefinitions.length === 0
          ),
    [initialCloudStorageConfigs]
  );
  const [cloudStorageConfigs, setCloudStorageConfigs] = useState(
    initialCloudStorageConfigs == null
      ? []
      : initialCloudStorageConfigs.filter(
          (config) => config.sensitiveFieldDefinitions.length > 0
        )
  );
  const [index, setIndex] = useState(0);
  const { control, handleSubmit, reset: resetForm } = useForm();

  const [validateCloudStorageConnection, validationResult] =
    useTestCloudStorageConnectionMutation();

  const onSkip = useCallback(() => {
    if (cloudStorageConfigs.length < 1) {
      onStart([...noCredentialsConfigs]);
      return;
    }

    const newCloudStorageConfigs = [...cloudStorageConfigs];
    newCloudStorageConfigs[index] = {
      ...cloudStorageConfigs[index],
      active: false,
    };
    setCloudStorageConfigs(newCloudStorageConfigs);
    if (index < cloudStorageConfigs.length - 1) {
      if (!validationResult.isUninitialized) validationResult.reset();
      resetForm();
      setIndex((index) => index + 1);
    } else {
      onStart([...noCredentialsConfigs, ...cloudStorageConfigs]);
    }
  }, [
    cloudStorageConfigs,
    index,
    noCredentialsConfigs,
    onStart,
    resetForm,
    validationResult,
  ]);

  const onContinue = useCallback(
    (options: CloudStorageDetailsOptions) => {
      if (cloudStorageConfigs == null || cloudStorageConfigs.length < 1) return;

      const config = { ...cloudStorageConfigs[index] };
      const sensitiveFieldValues = { ...config.sensitiveFieldValues };
      if (options && Object.keys(options).length > 0) {
        Object.entries(options).forEach(([key, value]) => {
          if (value != undefined && value !== "") {
            sensitiveFieldValues[key] = "" + value;
          }
        });
        config.sensitiveFieldValues = sensitiveFieldValues;
      }
      const newStorageDetails = storageDefinitionFromConfig(config);

      const validateParameters: TestCloudStorageConnectionParams = {
        configuration: newStorageDetails.configuration,
        source_path: newStorageDetails.source_path,
      };

      validateCloudStorageConnection(validateParameters);

      const newCloudStorageConfigs = [...cloudStorageConfigs];
      newCloudStorageConfigs[index] = config;
      setCloudStorageConfigs(newCloudStorageConfigs);
    },
    [cloudStorageConfigs, index, validateCloudStorageConnection]
  );

  useEffect(() => {
    if (cloudStorageConfigs == null) return;
    if (cloudStorageConfigs[index].active && !validationResult.isSuccess)
      return;
    if (index < cloudStorageConfigs.length - 1) {
      if (!validationResult.isUninitialized) validationResult.reset();
      resetForm();
      setIndex((index) => index + 1);
    } else {
      onStart([...noCredentialsConfigs, ...cloudStorageConfigs]);
    }
  }, [
    cloudStorageConfigs,
    index,
    noCredentialsConfigs,
    onStart,
    resetForm,
    validationResult,
  ]);

  if (cloudStorageConfigs == null) return null;
  if (cloudStorageConfigs.length < 1) return null;

  return (
    <Modal
      centered
      data-cy="session-cloud-storage-credentials-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader className={cx("fw-bold")}>
        Session Storage Credentials
      </ModalHeader>
      <Form
        noValidate
        className="form-rk-green"
        data-cy="cloud-storage-edit-options"
        onSubmit={handleSubmit(onContinue)}
      >
        <ModalBody className="pt-0">
          <CloudStorageConfigurationSecrets
            cloudStorageConfig={cloudStorageConfigs[index]}
            control={control}
          />
          <div className="mt-3">
            {validationResult.isError ? (
              <div className="text-danger">
                The data source could not be mounted. Please retry with
                different credentials, or skip.
              </div>
            ) : (
              <div>&nbsp;</div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className={cx("d-flex", "align-items-baseline", "pt-0")}>
          <div className="flex-grow-1">
            <ProgressBreadcrumbs
              cloudStorageConfigs={cloudStorageConfigs}
              index={index}
              setCloudStorageConfigs={setCloudStorageConfigs}
              setIndex={setIndex}
            />
          </div>
          <div>
            <Button className="me-5" color="outline-danger" onClick={onCancel}>
              <XLg className={cx("bi", "me-1")} />
              Cancel
            </Button>
            <Button
              className={cx("ms-2", "btn-outline-rk-green")}
              onClick={onSkip}
            >
              Skip <SkipForward className={cx("bi", "me-1")} />
            </Button>
            <Button
              className={cx(
                "ms-2",
                validationResult.isSuccess && "btn-rk-green",
                validationResult.isError && "btn-danger"
              )}
              disabled={validationResult.isLoading}
              type="submit"
            >
              {validationResult.isLoading ? (
                <span>
                  Testing <Loader inline size={16} />
                </span>
              ) : validationResult.isError ? (
                <span>
                  <ArrowRepeat className="bi" /> Retry
                </span>
              ) : (
                <span>
                  Continue <ChevronRight className="bi" />
                </span>
              )}
            </Button>
          </div>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
