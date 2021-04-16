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
import FormLabel from "./FormLabel";
import { FormGroup, Input, Label, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";

function TextInput({ name, label, type, value, alert, placeholder, setInputs,
  help, disabled = false, required = false, editOnClick = false }) {

  const [onlyView, setOnlyView] = React.useState(editOnClick);

  const switchToEditMode = () => {
    setOnlyView(false);
  };

  const formContent = onlyView ?
    <FormGroup>
      <small>
        {value ?
          <Label className="font-italic text-muted">
            {label}: {value}
          </Label>
          : null
        }
        { value && !disabled ?
          <Button size="sm" color="rk-white" className="float-end" onClick={switchToEditMode}>
            <FontAwesomeIcon icon={faPencilAlt}/> Change Name
          </Button>
          : null
        }
      </small>
    </FormGroup>
    :
    <FormGroup>
      <FormLabel htmlFor={name} label={label} required={required}/>
      <Input id={name} name={name} type={type} value={value || ""}
        onChange={setInputs} disabled={disabled} placeholder={placeholder} />
      <HelpText content={help} />
      <ValidationAlert content={alert} />
    </FormGroup>;

  return formContent;
}

export default TextInput;
