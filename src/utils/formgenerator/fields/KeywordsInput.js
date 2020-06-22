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

import * as React from "react";
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import { FormGroup, Label } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function KeywordsInput({ name, label, type, value, alert, placeholder, setInputs, help, disabled = false }) {

  const [tags, setTags] = React.useState([]);
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

  React.useEffect(()=>{
    const artifitialEvent = {
      target: { name: name, value: tags },
      isPersistent: () => false
    };
    setInputs(artifitialEvent);
    //eslint-disable-next-line
  }, [tags]);

  const disabledClass = disabled === true ? "disabled" : "";

  let tagsList = <div className={"input-tag " + disabledClass} >
    <ul className="input-tag__tags">
      { tags.map((tag, i) => (
        <li key={tag}>
          {tag}
          <FontAwesomeIcon size="sm" icon={faTimes} className="ml-2" onClick={(e) => removeTag(i)}/>
        </li>
      ))}
      <li className="input-tag__tags__input">
        <input type="text" onKeyDown={inputKeyDown}
          ref={c => { tagInput.current = c; }}
          disabled={disabled}
        />
      </li>
    </ul>
  </div>;

  return <FormGroup>
    <Label htmlFor={name}>{label}</Label>
    {tagsList}
    <HelpText content={help} />
    <ValidationAlert content={alert} />
  </FormGroup>;
}

export default KeywordsInput;
