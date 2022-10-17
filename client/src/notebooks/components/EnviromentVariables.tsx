/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import React, { ChangeEvent } from "react";
import { Button, Col, FormGroup, Input, Label, Row } from "../../utils/ts-wrappers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ErrorLabel, InputLabel } from "../../utils/components/formlabels/FormLabels";

interface EnvironmentVariablesProps {
  environmentVariables: EnvVariablesField[];
  setEnvironmentVariables: Function;
}

export interface EnvVariablesField {
  key: string;
  value: string;
}

function EnvironmentVariables({ environmentVariables, setEnvironmentVariables }: EnvironmentVariablesProps) {
  const handleFormChange = (index: number, name: "key" | "value", value: string) => {
    let data: EnvVariablesField[] = [...environmentVariables];
    data[index][name] = value;
    setEnvironmentVariables(data);
  };

  const addFields = () => {
    let object = { key: "", value: "" };
    setEnvironmentVariables([...environmentVariables, object]);
  };

  const isKeyDuplicated = (key: string) => {
    if (!key)
      return false;
    return environmentVariables.filter( variable => variable.key === key).length >= 2;
  };

  const removeFields = (index: number) => {
    let data = [...environmentVariables];
    data.splice(index, 1);
    setEnvironmentVariables(data);
  };

  const form = environmentVariables?.map((input, index) => {
    const isDuplicated = isKeyDuplicated(input.key);
    return (
      <Row key={index}>
        <Col xs={5}>
          <FormGroup className="field-group">
            <Label for="variable" size="sm" className="text-muted d-md-none">Variable</Label>
            <Input
              name="variable"
              value={input.key}
              invalid={isDuplicated}
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleFormChange(index, "key", event.target.value)}
            />
            {isDuplicated ? <ErrorLabel text="Variable names must be unique" /> : null }
          </FormGroup>
        </Col>
        <Col xs={5}>
          <FormGroup className="field-group">
            <Label for="variable" size="sm" className="text-muted d-md-none">Value</Label>
            <Input
              name="value"
              value={input.value}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleFormChange(index, "value", event.target.value)}
            />
          </FormGroup>
        </Col>
        <Col xs={2} className="d-flex align-items-start justify-content-start">
          <Button
            size="sm"
            className="border-0 text-danger bg-transparent mb-3"
            onClick={() => removeFields(index)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </Col>
      </Row>
    );
  });

  const header = !environmentVariables?.length ? null :
    <Row className="my-2 d-none d-sm-none d-md-flex d-xl-flex">
      <Col sm={5}>
        <Label className="small">Variable</Label>
      </Col>
      <Col sm={5}>
        <Label className="small">Value</Label>
      </Col>
    </Row>;

  return <div className="mt-3">
    <InputLabel text="Environment Variables" isRequired={false} />
    {header}
    {form}
    <div><Button className="btn-outline-rk-green my-1" onClick={addFields}>Add Variable</Button></div>
  </div>;
}

export default EnvironmentVariables;
