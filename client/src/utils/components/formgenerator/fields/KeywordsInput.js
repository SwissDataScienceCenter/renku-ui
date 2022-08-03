/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  TextInput.js
 *  Presentational components.
 */

import React, { useEffect } from "react";
import FormLabel from "./FormLabel";
import { FormGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ErrorLabel } from "../../formlabels/FormLabels";
import { FormText } from "../../../ts-wrappers";

function KeywordsInput(
  { name, label, value, alert, setInputs, help, disabled = false, required = false, optional = false }) {

  const [tags, setTags] = React.useState(value);
  const [active, setActive] = React.useState(false);
  const tagInput = React.useRef(null);

  const removeTag = (i) => {
    const newTags = [ ...tags ];
    newTags.splice(i, 1);
    setTags(newTags);
  };

  const inputKeyDown = (e) => {
    const val = e.target.value;
    if (e.key === "Enter" && val) {
      e.preventDefault();
      if (tags.find(tag => tag.toLowerCase() === val.toLowerCase()))
        return;

      setTags([...tags, val]);
      tagInput.current.value = null;
    }
    else if (e.key === "Enter") {
      e.preventDefault();
      //If this is not here then the form will be submitted on enter
    }
    else if (e.key === "Backspace" && !val) {
      removeTag(tags.length - 1);
    }
  };

  useEffect(()=>{
    if (tags.length !== value.length) {
      const artificialEvent = {
        target: { name: name, value: tags },
        isPersistent: () => false
      };
      setInputs(artificialEvent);
    }
    //eslint-disable-next-line
  }, [tags]);


  const disabledClass = disabled === true ? "disabled" : "";
  const activeClass = active === true ? "input-tag--active" : "";

  let tagsList = <div className={`input-tag ${disabledClass} ${activeClass}`} >
    <ul className="input-tag__tags">
      { tags.map((tag, i) => (
        <li key={tag}>
          {tag}
          <FontAwesomeIcon size="sm" icon={faTimes} className="ms-2" onClick={(e) => removeTag(i)}/>
        </li>
      ))}
      <li className="input-tag__tags__input">
        <input type="text" onKeyDown={inputKeyDown} onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          ref={c => { tagInput.current = c; }}
          disabled={disabled} data-cy={`input-${name}`}
        />
      </li>
    </ul>
  </div>;

  return <FormGroup className="field-group">
    <FormLabel htmlFor={name} label={label} required={required} optional={optional} />
    {tagsList}
    {help && <FormText color="muted">{help}</FormText>}
    {alert && <ErrorLabel text={alert} />}
  </FormGroup>;
}

export default KeywordsInput;
