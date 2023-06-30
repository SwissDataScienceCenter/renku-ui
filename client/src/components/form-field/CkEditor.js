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

// Until we upgrade to CKEditor 5 v6.0.0, it is necessary to
// wrap the CKEditor component in a JS (not TS) component

import { CKEditor } from "@ckeditor/ckeditor5-react";
import RenkuCKEditor from "@renku/ckeditor5-build-renku";
import React from "react";

function CkEditor({
  data,
  disabled,
  id,
  invalid,
  name,
  outputType,
  setInputs,
}) {
  return (
    <CKEditor
      id={id}
      editor={
        outputType === "markdown"
          ? RenkuCKEditor.RenkuMarkdownEditor
          : RenkuCKEditor.RenkuHTMLEditor
      }
      data={data}
      disabled={disabled}
      invalid={invalid}
      customConfig={{ height: 500 }}
      height={800}
      data-cy={`ckeditor-${name}`}
      onChange={(_event, editor) => {
        const artificialEvent = {
          target: { name: name, value: editor.getData() },
          isPersistent: () => false,
        };
        setInputs(artificialEvent);
      }}
    />
  );
}

export default CkEditor;
