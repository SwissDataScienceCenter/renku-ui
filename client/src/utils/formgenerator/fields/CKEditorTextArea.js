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
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import { FormGroup, Label } from "reactstrap";
import CKEditor from "@ckeditor/ckeditor5-react";
import RenkuCKEditor from "@renku/ckeditor5-build-renku";
import { CustomInput, Input } from "reactstrap";


function CktextareaInput({ name, label, type, value, alert, setInputs, help, outputType, disabled }) {
  const [codeview, setCodeview] = useState(false);

  const switchLabel = (outputType === "markdown") ? "Markdown" : "HTML";

  return <div>
    <FormGroup>
      <Label htmlFor={name}>{label}</Label>
      <CustomInput
        className="float-right"
        type="switch"
        id="exampleCustomSwitch"
        name="customSwitch"
        label={switchLabel}
        checked={codeview}
        onChange={() => { setCodeview(!codeview); }}
      />
      {
        codeview === false ?
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
                const artifitialEvent = {
                  target: { name: name, value: editor.getData() },
                  isPersistent: () => false
                };
                setInputs(artifitialEvent);
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
      <HelpText content={help} />
      <ValidationAlert content={alert} />
    </FormGroup>
  </div>;
}

export default CktextareaInput;
