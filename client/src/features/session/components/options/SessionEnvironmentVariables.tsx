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

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { ChangeEvent, useCallback, useMemo } from "react";
import { PlusLg } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { Button, Col, Input, Row } from "reactstrap";
import { ErrorLabel } from "../../../../components/formlabels/FormLabels";
import {
  addEnvironmentVariable,
  removeEnvironmentVariable,
  updateEnvironmentVariable,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";

export default function SessionEnvironmentVariables() {
  const environmentVariables = useStartSessionOptionsSelector(
    ({ environmentVariables }) => environmentVariables
  );

  const dispatch = useDispatch();
  const onAddEnvironmentVariable = useCallback(() => {
    dispatch(addEnvironmentVariable());
  }, [dispatch]);

  return (
    <div className="field-group">
      <div className="form-label">Environment Variables</div>
      {environmentVariables.length > 0 && <Header />}
      {environmentVariables.map(({ name, value }, index) => (
        <EnvironmentVariable
          key={`${index}`}
          index={index}
          name={name}
          value={value}
        />
      ))}
      <div>
        <Button
          className="btn-outline-rk-green"
          onClick={onAddEnvironmentVariable}
        >
          <PlusLg className={cx("bi", "me-1")} />
          Add Variable
        </Button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <Row className="my-1">
      <Col xs={5}>
        <div className={cx("form-label", "small", "text-rk-text")}>
          Variable
        </div>
      </Col>
      <Col xs={5}>
        <div className={cx("form-label", "small", "text-rk-text")}>Value</div>
      </Col>
    </Row>
  );
}

interface EnvironmentVariableProps {
  index: number;
  name: string;
  value: string;
}

function EnvironmentVariable({ index, name, value }: EnvironmentVariableProps) {
  const environmentVariables = useStartSessionOptionsSelector(
    ({ environmentVariables }) => environmentVariables
  );

  const hasDuplicate = useMemo(
    () =>
      !!name &&
      environmentVariables.filter((variable) => variable.name === name).length >
        1,
    [environmentVariables, name]
  );

  const dispatch = useDispatch();
  const onRemove = useCallback(() => {
    dispatch(removeEnvironmentVariable({ index }));
  }, [dispatch, index]);
  const onUpdateName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateEnvironmentVariable({
          index,
          variable: {
            name: event.target.value,
            value,
          },
        })
      );
    },
    [dispatch, index, value]
  );
  const onUpdateValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateEnvironmentVariable({
          index,
          variable: {
            name,
            value: event.target.value,
          },
        })
      );
    },
    [dispatch, index, name]
  );

  return (
    <Row className={cx(hasDuplicate && "mb-3")}>
      <Col xs={5}>
        <Input
          autoComplete="variableName"
          invalid={hasDuplicate}
          name="variableName"
          onChange={onUpdateName}
          placeholder="Variable"
          type="text"
          value={name}
        />
        {hasDuplicate && <ErrorLabel text="Variable names must be unique" />}
      </Col>
      <Col xs={5}>
        <Input
          autoComplete="variableValue"
          name="variableValue"
          onChange={onUpdateValue}
          placeholder="Value"
          type="text"
          value={value}
        />
      </Col>
      <Col xs={2}>
        <Button
          size="sm"
          className={cx("border-0", "text-danger", "bg-transparent", "mb-3")}
          onClick={onRemove}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </Col>
    </Row>
  );
}
