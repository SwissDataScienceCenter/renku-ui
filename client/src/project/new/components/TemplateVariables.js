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
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
/**
 *  renku-ui
 *
 *  TemplateVariables.js
 *  Template Variables field group component
 */
import { Component } from "react";
import {
  Button,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from "reactstrap";
import {
  InputHintLabel,
  InputLabel,
} from "../../../components/formlabels/FormLabels";
import { toCapitalized as capitalize } from "../../../utils/helpers/HelperFunctions";

/**
 * Create a "restore default" button.
 *
 * @param {function} restore - function to invoke
 * @param {string} tip - message to display in the tooltip
 * @param {boolean} disabled - whether it's disabled or not
 */
function RestoreButton({ restore, name, disabled }) {
  const id = `restore_${name}`;
  const tip = disabled
    ? "Default value already selected"
    : "Restore default value";

  return (
    <div id={id} className="d-inline ms-2">
      <Button
        key="button"
        className="p-0"
        color="link"
        size="sm"
        onClick={() => restore()}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faUndo} />
      </Button>
      <UncontrolledTooltip key="tooltip" placement="top" target={id}>
        {tip}
      </UncontrolledTooltip>
    </div>
  );
}

class TemplateVariables extends Component {
  render() {
    const { template, templateVariables, setVariable } = this.props;
    if (!template) return null;

    const setTemplateVariable = (variableKey, value) => {
      setVariable({
        ...templateVariables,
        [variableKey]: value,
      });
    };
    if (
      !template ||
      !template.variables ||
      !Object.keys(template.variables).length
    )
      return null;
    return Object.keys(template.variables).map((variable) => {
      const data = template.variables[variable];

      // fallback to avoid breaking old variable structure
      if (typeof data !== "object") {
        return (
          <FormGroup key={variable}>
            <InputLabel text={capitalize(variable)} />
            <Input
              id={"parameter-" + variable}
              type="text"
              value={templateVariables[variable]}
              onChange={(e) => setTemplateVariable(variable, e.target.value)}
            />
            <InputHintLabel text={capitalize(template.variables[variable])} />
          </FormGroup>
        );
      }

      // expected `data` properties: default_value, description, enum, type.
      // changing enum to enumValues to avoid using js reserved word
      return (
        <Variable
          enumValues={data["enum"]}
          key={variable}
          variables={templateVariables}
          name={variable}
          setVariable={setTemplateVariable}
          {...data}
        />
      );
    });
  }
}

function Variable(props) {
  const {
    default_value,
    description,
    enumValues,
    setVariable,
    variables,
    name,
    type,
  } = props;
  const id = `parameter-${name}`;

  const descriptionOutput = description ? (
    <InputHintLabel text={capitalize(description)} />
  ) : null;

  const defaultOutput =
    default_value != null ? `Default: ${default_value}` : null;

  const restoreButton =
    default_value != null ? (
      <RestoreButton
        disabled={variables && variables[name] === default_value}
        name={name}
        restore={() => setVariable(name, default_value)}
      />
    ) : null;

  let inputElement = null;
  if (type === "boolean") {
    inputElement = (
      <FormGroup className="form-check form-switch d-inline-block">
        <Input
          type="switch"
          id={id}
          label={name}
          checked={variables && variables[name]}
          onChange={(e) => setVariable(name, e.target.checked)}
          className="form-check-input rounded-pill"
        />
        <Label check htmlFor={"parameter-" + name}>
          {name}
        </Label>
        {restoreButton}
      </FormGroup>
    );
    // inputElement = null;
  } else if (type === "enum") {
    const enumObjects = enumValues.map((enumObject) => {
      const enumId = `enum-${id}-${enumObject.toString()}`;
      return (
        <option key={enumId} value={enumObject}>
          {enumObject}
        </option>
      );
    });
    inputElement = (
      <FormGroup>
        <InputLabel text={name} />
        {restoreButton}
        <Input
          id={id}
          type="select"
          value={variables ? variables[name] : default_value}
          onChange={(e) => setVariable(name, e.target.value)}
        >
          {enumObjects}
        </Input>
        {descriptionOutput}
      </FormGroup>
    );
  } else {
    const inputType = type === "number" ? "number" : "text";
    inputElement = (
      <FormGroup>
        <InputLabel text={name} />
        {restoreButton}
        <Input
          id={id}
          type={inputType}
          value={variables ? variables[name] : undefined}
          onChange={(e) => setVariable(name, e.target.value)}
          placeholder={defaultOutput}
        />
        {descriptionOutput}
      </FormGroup>
    );
  }

  return inputElement;
}

export default TemplateVariables;
