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
 *  CKEditorTextArea.js
 *  Presentational components.
 */

import React, { useState } from "react";
import FormLabel from "./FormLabel";
import { FormGroup, Label } from "reactstrap";
import CKEditor from "@ckeditor/ckeditor5-react";
import RenkuCKEditor from "@renku/ckeditor5-build-renku";
import { Input } from "reactstrap";
import { FormText } from "../../../ts-wrappers";
import { ErrorLabel } from "../../formlabels/FormLabels";


function CktextareaInput(
  { name, label, type, value, alert, setInputs, help, outputType, disabled, required = false, optional = false }) {
  const [codeView, setCodeView] = useState(false);

  const switchLabel = (outputType === "markdown") ? "Raw Markdown" : "Raw HTML";

  return <div>
    <FormGroup className="field-group">
      <div className="pb-2">
        <FormLabel htmlFor={name} label={label} required={required} optional={optional} />
        <div className="form-check form-switch float-end">
          <Input
            className="form-check-input rounded-pill"
            type="switch"
            id="CKEditorSwitch"
            name="customSwitch"
            checked={codeView}
            onChange={() => { setCodeView(!codeView); }}
          />
          <Label check htmlFor="exampleCustomSwitch" className="form-check-label">
            {switchLabel}
          </Label>
        </div>
      </div>
      {
        codeView === false ?
          <CKEditor
            id={name}
            editor={outputType === "markdown" ? RenkuCKEditor.RenkuMarkdownEditor : RenkuCKEditor.RenkuHTMLEditor}
            type={type}
            data={value || ""}
            disabled={disabled}
            invalid={alert !== undefined}
            rows={7}
            onChange={
              (event, editor) => {
                const artificialEvent = {
                  target: { name: name, value: editor.getData() },
                  isPersistent: () => false
                };
                setInputs(artificialEvent);
              }
            }
          />
          :
          <Input
            id={name + "text-area"}
            name={name}
            type="textarea"
            disabled={disabled}
            value={value || ""}
            onChange={setInputs}
            rows={value ? value.split("\n").length + 1 : 2}
          />
      }
      {help && <FormText color="muted">{help}</FormText>}
      {alert && <ErrorLabel text={alert} />}
    </FormGroup>
  </div>;
}

export default CktextareaInput;
