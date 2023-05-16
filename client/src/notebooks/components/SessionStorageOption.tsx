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

import React, { useCallback, useEffect, useMemo } from "react";
import cx from "classnames";
import { clamp } from "lodash";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import {
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
} from "reactstrap";
import { Loader } from "../../components/Loader";
import { ThrottledTooltip } from "../../components/Tooltip";
import { ResourcePool } from "../../features/dataServices/dataServices";
import { useGetResourcePoolsQuery } from "../../features/dataServices/dataServicesApi";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../features/session/startSessionOptions.constants";
import {
  setStorage,
  useStartSessionOptionsSelector,
} from "../../features/session/startSessionOptionsSlice";
import { fakeResourcePools } from "./SessionClassOption";
import styles from "./SessionStorageOption.module.scss";

export const SessionStorageOption = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const enableFakeResourcePools = !!searchParams.get("useFakeResourcePools");

  const { data: realResourcePools, isLoading } = useGetResourcePoolsQuery(
    {},
    { skip: enableFakeResourcePools }
  );

  const resourcePools = enableFakeResourcePools
    ? fakeResourcePools
    : realResourcePools;

  if (isLoading || !resourcePools) {
    return <Loader />;
  }

  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Amount of Storage</Label>
        <StorageSelector resourcePools={resourcePools} />
      </FormGroup>
    </Col>
  );
};

interface StorageSelectorProps {
  resourcePools: ResourcePool[];
}

const StorageSelector = ({ resourcePools }: StorageSelectorProps) => {
  const sessionsClassesFlat = useMemo(
    () => resourcePools.flatMap((pool) => pool.classes),
    [resourcePools]
  );

  const { storage, sessionClass: sessionClassId } =
    useStartSessionOptionsSelector();
  const dispatch = useDispatch();

  const selectedSessionClass = useMemo(
    () =>
      sessionsClassesFlat.find((c) => c.id === sessionClassId) ??
      sessionsClassesFlat[0] ??
      null,
    [sessionClassId, sessionsClassesFlat]
  );
  const maxStorage = selectedSessionClass.max_storage;

  // Update the storage value to default when changing the session class
  useEffect(() => {
    if (selectedSessionClass == null) {
      return;
    }
    const newValue = validateStorageAmount({
      value: selectedSessionClass.default_storage,
      maxValue: selectedSessionClass.max_storage,
    });
    dispatch(setStorage(newValue));
  }, [dispatch, selectedSessionClass]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedSessionClass == null) {
        return;
      }
      const newValue = validateStorageAmount({
        value: event.target.valueAsNumber,
        maxValue: selectedSessionClass.max_storage,
      });
      dispatch(setStorage(newValue));
    },
    [dispatch, selectedSessionClass]
  );

  if (!selectedSessionClass) {
    return null;
  }

  return (
    <div className={cx(styles.container, "d-grid gap-sm-3 align-items-center")}>
      <Input
        type="range"
        className={styles.range}
        min={MIN_SESSION_STORAGE_GB}
        max={maxStorage}
        step={STEP_SESSION_STORAGE_GB}
        value={storage}
        onChange={onChange}
      />
      <InputGroup>
        <Input
          type="number"
          className={cx(styles.inputNumber, "rounded-start")}
          min={MIN_SESSION_STORAGE_GB}
          max={maxStorage}
          step={STEP_SESSION_STORAGE_GB}
          value={storage}
          onChange={onChange}
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
