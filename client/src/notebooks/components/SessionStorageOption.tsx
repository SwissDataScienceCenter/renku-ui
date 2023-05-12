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

import React, { useCallback } from "react";
import cx from "classnames";
import { useDispatch } from "react-redux";
import {
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
} from "reactstrap";
import {
  setStorage,
  useStartSessionOptionsSelector,
} from "../../features/session/startSessionOptionsSlice";
import styles from "./SessionStorageOption.module.scss";
import { ThrottledTooltip } from "../../components/Tooltip";

const MIN_STORAGE = 1;
const STEP_STORAGE = 1;
const MAX_STORAGE_FOR_TESTS = 80;

export const SessionStorageOption = () => {
  return (
    <Col xs={12}>
      <FormGroup className="field-group">
        <Label>Amount of Storage</Label>
        <StorageSelector />
      </FormGroup>
    </Col>
  );
};

const StorageSelector = () => {
  const storage = useStartSessionOptionsSelector((state) => state.storage);
  const dispatch = useDispatch();

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = validateStorageAmount(event.target.valueAsNumber);
      dispatch(setStorage(newValue));
    },
    [dispatch]
  );

  return (
    <div className={cx(styles.container, "d-grid gap-sm-3 align-items-center")}>
      <Input
        type="range"
        className={styles.range}
        min={MIN_STORAGE}
        max={MAX_STORAGE_FOR_TESTS}
        step={STEP_STORAGE}
        value={storage}
        onChange={onChange}
      />
      <InputGroup>
        <Input
          type="number"
          className={cx(styles.inputNumber, "rounded-start")}
          min={MIN_STORAGE}
          max={MAX_STORAGE_FOR_TESTS}
          step={STEP_STORAGE}
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

const validateStorageAmount = (value: number) =>
  isNaN(value)
    ? MIN_STORAGE
    : Math.min(MAX_STORAGE_FOR_TESTS, Math.max(MIN_STORAGE, Math.round(value)));
