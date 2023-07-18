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

import React from "react";
import type {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegisterReturn,
} from "react-hook-form";
import { FormGroup, Input, Label, Row, Col, Button } from "reactstrap";

import HelpText from "./HelpText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMinus, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import {
  ErrorLabel,
  InputHintLabel,
  InputLabel,
} from "../formlabels/FormLabels";

import { Creator } from "../../features/project/Project";

import { SetInputsValue } from "./form-field.types";

export type CreatorInputCreator = Creator & { id: number; default?: boolean };

export interface CreatorInputProps {
  name: string;
  label: string;
  value?: CreatorInputCreator[];
  alert?: string;
  setInputs: (value: SetInputsValue) => void;
  help?: React.ReactNode;
  disabled?: boolean;
}

function validateCreators(creators: CreatorInputCreator[]) {
  const invalidCreators = creators.find(
    (creator) =>
      creator.email && (creator.name.length <= 0 || creator.email.length <= 0)
  );
  return invalidCreators === undefined;
}

interface CreatorFormProps {
  creator: CreatorInputCreator;
  disabled: boolean;
  setCreator: (creator: CreatorInputCreator) => void;
  deleteCreator: () => void;
  default: boolean;
}
function CreatorForm(props: CreatorFormProps) {
  const onChangeCreator = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputKey = event.target.name as keyof CreatorInputCreator;
    props.creator[inputKey] = event.target.value as never;
    props.setCreator(props.creator);
  };

  return (
    <Row>
      <Col md={4}>
        <FormGroup>
          <Label for="name" size="sm" className="text-muted d-md-none">
            Name
          </Label>
          <Input
            bsSize="sm"
            type="text"
            defaultValue={props.creator.name}
            name="name"
            data-cy="creator-name"
            disabled={props.disabled}
            onChange={onChangeCreator}
          />
        </FormGroup>
      </Col>
      <Col md={4}>
        <FormGroup>
          <Label for="email" size="sm" className="text-muted d-md-none">
            Email
          </Label>
          <Input
            bsSize="sm"
            type="email"
            data-cy="creator-email"
            defaultValue={props.creator.email}
            name="email"
            disabled={props.disabled}
            onChange={onChangeCreator}
          />
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label for="affiliation" size="sm" className="text-muted d-md-none">
            Affiliation
          </Label>
          <Input
            bsSize="sm"
            data-cy="creator-affiliation"
            defaultValue={props.creator.affiliation ?? undefined}
            name="affiliation"
            disabled={props.disabled}
            onChange={onChangeCreator}
          />
          <InputHintLabel text="e.g. National Institute of Science" />
        </FormGroup>
      </Col>
      <Col md={1}>
        <FormGroup>
          <Button
            size="sm"
            disabled={props.disabled}
            className="mb-3 p-0 border-0 text-danger bg-transparent"
            onClick={props.deleteCreator}
          >
            <FontAwesomeIcon icon={faUserMinus} />
          </Button>
        </FormGroup>
      </Col>
    </Row>
  );
}

export function FormGeneratorCreatorsInput({
  name,
  label,
  value,
  alert,
  setInputs,
  help,
  disabled = false,
}: CreatorInputProps) {
  const counter = React.useRef(
    value !== undefined && value.length > 0 ? value.length : 1
  );
  const [creators, setCreators] = React.useState<CreatorInputCreator[]>(
    value !== undefined && value.length > 0
      ? value.map((creator, index) => ({
          id: index,
          name: creator.name,
          email: creator.email,
          affiliation: creator.affiliation,
          identifier: "",
          default: creator.default === true,
        }))
      : [
          {
            id: 1,
            name: "",
            email: "",
            affiliation: "",
            identifier: "",
            default: false,
          },
        ]
  );

  const addEmptyCreator = () => {
    counter.current = counter.current + 1;
    setCreators((prevCreators) => [
      ...prevCreators,
      {
        id: counter.current,
        name: "",
        email: "",
        affiliation: "",
        identifier: "",
        default: false,
      },
    ]);
  };

  const deleteCreator = React.useCallback(
    (id: number) => {
      setCreators(creators.filter((creator) => creator.id !== id));
    },
    [creators]
  );

  const setCreator = (newCreator: CreatorInputCreator) => {
    setCreators((prevCreators) =>
      prevCreators.map((oldCreator) =>
        oldCreator.id === newCreator.id
          ? {
              id: newCreator.id,
              name: newCreator.name,
              email: newCreator.email,
              affiliation: newCreator.affiliation,
              default: false,
            }
          : oldCreator
      )
    );
  };

  React.useEffect(() => {
    const filteredCreators = creators.filter(
      (creator) =>
        !(
          creator.name === "" &&
          creator.email === "" &&
          creator.affiliation === ""
        )
    );
    const artificialEvent = {
      target: { name: name, value: filteredCreators },
      type: "change",
    };
    setInputs(artificialEvent);
  }, [creators, name, setInputs]);

  const defaultCreators = creators.filter(
    (creator) => creator.default === true
  );
  const nonDefaultCreators = creators.filter(
    (creator) => creator.default !== true
  );

  return (
    <FormGroup className="field-group">
      <InputLabel text={label} isRequired={false} />
      <Row className="mb-2">
        <Col>
          {defaultCreators.map((creator) => (
            <Input
              disabled={true}
              key={creator.email}
              name="default-creator"
              value={`${creator.name} (${creator.email})`}
            />
          ))}
        </Col>
      </Row>
      {nonDefaultCreators.length > 0 ? (
        <Row className="my-2">
          <Col md={4} className="d-none d-md-block">
            <Label>Name</Label>
          </Col>
          <Col md={4} className="d-none d-md-block">
            <Label>Email</Label>
          </Col>
          <Col md={3} className="d-none d-md-block">
            <Label>Affiliation</Label>
          </Col>
        </Row>
      ) : null}

      {nonDefaultCreators.map((creator) => (
        <CreatorForm
          key={"author" + creator.id}
          creator={creator}
          disabled={disabled}
          default={creator.default ?? false}
          setCreator={setCreator}
          deleteCreator={() => deleteCreator(creator.id)}
        />
      ))}

      <HelpText content={help} />
      <Row>
        <Col>
          <Button
            data-cy="addCreatorButton"
            size="sm"
            color="rk-white"
            disabled={disabled}
            onClick={addEmptyCreator}
          >
            <FontAwesomeIcon icon={faUserPlus} /> Add Creator
          </Button>
        </Col>
      </Row>
      {alert && <ErrorLabel text={alert} />}
    </FormGroup>
  );
}

export type CreatorsInputProps = Omit<
  CreatorInputProps,
  "alert" | "setInputs"
> & {
  error?:
    | Merge<
        FieldError,
        (Merge<FieldError, FieldErrorsImpl<CreatorInputCreator>> | undefined)[]
      >
    | undefined;
  register: UseFormRegisterReturn;
  value: CreatorInputCreator[];
};

function CreatorsInput(props: CreatorsInputProps) {
  const setInputs = (value: SetInputsValue) => {
    props.register.onChange(value);
  };
  return (
    <FormGeneratorCreatorsInput
      alert={props.error?.message}
      help={props.help}
      label={props.label}
      name={props.name}
      setInputs={setInputs}
      value={props.value}
    />
  );
}

export default CreatorsInput;
export { validateCreators };
