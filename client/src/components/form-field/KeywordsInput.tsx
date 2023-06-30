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
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FormGroup, FormText } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import FormLabel from "./FormLabel";

import { ErrorLabel } from "../formlabels/FormLabels";

type SetInputsValue = { target: unknown; type: unknown };

type FormGeneratorKeywordsInputProps = {
  alert: string | undefined;
  disabled?: boolean;
  help: React.ReactNode;
  label: string;
  name: string;
  required?: boolean;
  setInputs: (e: SetInputsValue) => void;
  value: string[];
};
function FormGeneratorKeywordsInput({
  name,
  label,
  value,
  alert,
  setInputs,
  help,
  disabled = false,
  required = false,
}: FormGeneratorKeywordsInputProps) {
  const [tags, setTags] = React.useState(value);
  const [active, setActive] = React.useState(false);
  const tagInput = React.useRef<HTMLInputElement>(null);

  const removeTag = React.useCallback(
    (i: number) => {
      const newTags = [...tags];
      newTags.splice(i, 1);
      setTags(newTags);
    },
    [tags]
  );

  const inputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const val = e.currentTarget.value;
      if (e.key === "Enter" && val) {
        e.preventDefault();
        if (tags.find((tag) => tag.toLowerCase() === val.toLowerCase())) return;
        setTags([...tags, val]);
        if (tagInput && tagInput.current) tagInput.current.value = "";
      } else if (e.key === "Enter") {
        e.preventDefault();
        // If this is not here then the form will be submitted on enter
      } else if (e.key === "Backspace" && !val) {
        removeTag(tags.length - 1);
      }
    },
    [removeTag, tags]
  );

  React.useEffect(() => {
    const artificialEvent = {
      target: { name: name, value: tags },
      type: "change",
    };
    setInputs(artificialEvent);
  }, [name, setInputs, tags]);

  const disabledClass = disabled === true ? "disabled" : "";
  const activeClass = active === true ? "input-tag--active" : "";

  const tagsList = (
    <div className={`input-tag ${disabledClass} ${activeClass}`}>
      <ul className="input-tag__tags">
        {tags.map((tag, i) => (
          <li key={tag}>
            {tag}
            <FontAwesomeIcon
              size="sm"
              icon={faTimes}
              className="ms-2"
              onClick={() => removeTag(i)}
            />
          </li>
        ))}
        <li className="input-tag__tags__input">
          <input
            type="text"
            onKeyDown={inputKeyDown}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            ref={tagInput}
            disabled={disabled}
            data-cy={`input-${name}`}
          />
        </li>
      </ul>
    </div>
  );

  return (
    <FormGroup className="field-group">
      <FormLabel name={name} label={label} required={required} />
      {tagsList}
      {help && <FormText color="muted">{help}</FormText>}
      {alert && <ErrorLabel text={alert} />}
    </FormGroup>
  );
}

type KeywordsInputProps = {
  error?: FieldError;
  help?: string | React.ReactNode;
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  value: string[];
};

function KeywordsInput(props: KeywordsInputProps) {
  const setInputs = (value: SetInputsValue) => {
    props.register.onChange(value);
  };
  return (
    <FormGeneratorKeywordsInput
      alert={props.error?.message}
      help={props.help}
      label={props.label}
      name={props.name}
      setInputs={setInputs}
      value={props.value}
    />
  );
}

export default KeywordsInput;
