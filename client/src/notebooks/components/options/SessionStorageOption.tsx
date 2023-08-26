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

import { useCallback, useEffect, useMemo } from "react";
import cx from "classnames";
import { clamp } from "lodash";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import {
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
} from "reactstrap";
import { ThrottledTooltip } from "../../../components/Tooltip";
import { ResourceClass } from "../../../features/dataServices/dataServices";
import { useGetResourcePoolsQuery } from "../../../features/dataServices/dataServicesApi";
import { StateModelProject } from "../../../features/project/Project";
import { useGetConfigQuery } from "../../../features/project/projectCoreApi";
import { useCoreSupport } from "../../../features/project/useProjectCoreSupport";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../../features/session/startSessionOptions.constants";
import {
  setStorage,
  useStartSessionOptionsSelector,
} from "../../../features/session/startSessionOptionsSlice";
import styles from "./SessionStorageOption.module.scss";

export const SessionStorageOption = () => {
  // Project options
  const { defaultBranch, externalUrl: projectRepositoryUrl } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const { coreSupport } = useCoreSupport({
    gitUrl: projectRepositoryUrl ?? undefined,
    branch: defaultBranch ?? undefined,
  });
  const { computed: coreSupportComputed, versionUrl } = coreSupport;
  const { data: projectConfig } = useGetConfigQuery(
    {
      projectRepositoryUrl,
      versionUrl,
    },
    { skip: !coreSupportComputed }
  );

  // Resource pools
  const {
    data: resourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery(
    {
      cpuRequest: projectConfig?.config.sessions?.legacyConfig?.cpuRequest,
      gpuRequest: projectConfig?.config.sessions?.legacyConfig?.gpuRequest,
      memoryRequest:
        projectConfig?.config.sessions?.legacyConfig?.memoryRequest,
      storageRequest: projectConfig?.config.sessions?.storage,
    },
    { skip: !projectConfig }
  );

  const { storage, sessionClass: currentSessionClassId } =
    useStartSessionOptionsSelector();

  const dispatch = useDispatch();

  const currentSessionClass = useMemo(
    () =>
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id === currentSessionClassId) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [currentSessionClassId, resourcePools]
  );

  // Set initial storage if configured
  // or
  // update to the default value when changing the session class
  useEffect(() => {
    if (projectConfig == null || currentSessionClass == null) {
      return;
    }
    const newValue = validateStorageAmount({
      value:
        projectConfig.config.sessions?.storage ??
        projectConfig.default.sessions?.storage ??
        currentSessionClass.default_storage,
      maxValue: currentSessionClass.max_storage,
    });
    dispatch(setStorage(newValue));
  }, [currentSessionClass, dispatch, projectConfig]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (currentSessionClass == null) {
        return;
      }
      const newValue = validateStorageAmount({
        value: event.target.valueAsNumber,
        maxValue: currentSessionClass.max_storage,
      });
      dispatch(setStorage(newValue));
    },
    [currentSessionClass, dispatch]
  );

  if (isLoading || !resourcePools || resourcePools.length == 0 || isError) {
    return null;
  }

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Amount of Storage</Label>
        <StorageSelector
          currentSessionClass={currentSessionClass}
          currentStorage={storage}
          onChange={onChange}
        />
      </FormGroup>
    </Col>
  );
};

interface StorageSelectorProps {
  currentSessionClass?: ResourceClass | undefined;
  currentStorage?: number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const StorageSelector = ({
  currentSessionClass,
  currentStorage,
  onChange,
  disabled,
}: StorageSelectorProps) => {
  if (!currentSessionClass) {
    return null;
  }

  const maxStorage = currentSessionClass.max_storage;

  return (
    <div className={cx(styles.container, "d-grid gap-sm-3 align-items-center")}>
      <Input
        type="range"
        className={styles.range}
        min={MIN_SESSION_STORAGE_GB}
        max={maxStorage}
        step={STEP_SESSION_STORAGE_GB}
        value={currentStorage}
        onChange={onChange}
        disabled={disabled}
      />
      <InputGroup>
        <Input
          type="number"
          className={cx(styles.inputNumber, "rounded-start")}
          min={MIN_SESSION_STORAGE_GB}
          max={maxStorage}
          step={STEP_SESSION_STORAGE_GB}
          value={currentStorage}
          onChange={onChange}
          disabled={disabled}
        />
        <InputGroupText
          id="session-storage-option-gb"
          className={"rounded-end"}
        >
          GB
        </InputGroupText>
        <ThrottledTooltip
          target="session-storage-option-gb"
          tooltip="Gigabytes"
        />
      </InputGroup>
    </div>
  );
};

const validateStorageAmount = ({
  value,
  maxValue,
}: {
  value: number;
  maxValue: number;
}) =>
  isNaN(value)
    ? MIN_SESSION_STORAGE_GB
    : clamp(Math.round(value), MIN_SESSION_STORAGE_GB, maxValue);
