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

import { ClassicEditor as ClassicEditorBase } from "@ckeditor/ckeditor5-editor-classic";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import { Markdown } from "@ckeditor/ckeditor5-markdown-gfm";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
} from "@ckeditor/ckeditor5-basic-styles";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { CodeBlock } from "@ckeditor/ckeditor5-code-block";
import Math from "@isaul32/ckeditor5-math/src/math";
import AutoformatMath from "@isaul32/ckeditor5-math/src/autoformatmath";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";
import { WordCount } from "@ckeditor/ckeditor5-word-count";
import { List, TodoList } from "@ckeditor/ckeditor5-list";
import { Alignment } from "@ckeditor/ckeditor5-alignment";
import { Link } from "@ckeditor/ckeditor5-link";
import {
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
} from "@ckeditor/ckeditor5-table";
import { HorizontalLine } from "@ckeditor/ckeditor5-horizontal-line";
/*import {
  ImageBlock,
  ImageInsert,
  ImageResize,
  ImageToolbar,
  ImageUpload,
} from "@ckeditor/ckeditor5-image";
import { Base64UploadAdapter } from "@ckeditor/ckeditor5-upload";*/

import { CKEditor } from "@ckeditor/ckeditor5-react";

import "ckeditor5/ckeditor5.css";
import "./ckEditor.css";

import katex from "katex";
import "katex/dist/katex.min.css";

window.katex = katex;

class RenkuWordCount extends WordCount {
  constructor(editor) {
    super(editor);
    this.isSourceEditingMode = false;
    const sourceEditing = editor.plugins.get("SourceEditing");
    sourceEditing.on(
      "change:isSourceEditingMode",
      (_eventInfo, _name, value) => {
        if (value) {
          this.isSourceEditingMode = true;
          // Source editing textarea is not yet available.
          setTimeout(() => {
            const sourceEditingTextarea =
              editor.editing.view.getDomRoot().nextSibling.firstChild;
            if (sourceEditingTextarea) {
              sourceEditingTextarea.addEventListener("input", (event) => {
                sourceEditing.updateEditorData();
                this.fire("update", {
                  exact: true,
                  words: this.words,
                  characters: () => event.target.value.length,
                });
              });
              this.fire("update", {
                exact: true,
                words: this.words,
                characters: () => sourceEditingTextarea.value.length,
              });
            }
          });
        } else {
          this.isSourceEditingMode = false;
          this._refreshStats();
        }
      }
    );
  }

  _refreshStats() {
    if (!this.isSourceEditingMode) {
      const words = this.words;
      const characters = this.characters;
      this.fire("update", {
        exact: false,
        words,
        characters,
      });
    }
  }
}

class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
  Essentials,
  Markdown,
  Autoformat,
  SourceEditing,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  BlockQuote,
  BlockQuote,
  Code,
  CodeBlock,
  List,
  TodoList,
  Alignment,
  Superscript,
  Subscript,
  Link,
  HorizontalLine,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  // ImageBlock,
  // ImageInsert,
  // ImageResize,
  // ImageToolbar,
  // ImageUpload,
  // Base64UploadAdapter,
  Math,
  AutoformatMath,
  RenkuWordCount,
];

function CkEditor({
  id,
  name,
  data,
  disabled = false,
  invalid = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setInputs = (value) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wordCount = (stats) => {},
}) {
  const editorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "blockQuote",
        "|",
        "code",
        "codeBlock",
        "|",
        {
          label: "List",
          withText: true,
          items: ["bulletedList", "numberedList", "todoList"],
        },
        "|",
        "alignment",
        "|",
        "superscript",
        "subscript",
        "math",
        "|",
        "link",
        "|",
        {
          label: "Other",
          withText: false,
          items: [
            "horizontalLine",
            "insertTable",
            // "insertImage",
            // "resizeImage",
          ],
        },
        "sourceEditing",
      ],
    },
    math: {
      engine: "katex",
      enablePreview: true,
    },
    wordCount: {
      onUpdate: wordCount,
    },
  };
  return (
    <CKEditor
      id={id}
      editor={ClassicEditor}
      config={editorConfig}
      disabled={disabled}
      invalid={invalid}
      customConfig={{ height: 500 }}
      height={800}
      data-cy={`ckeditor-${name}`}
      onReady={(e) => {
        if (disabled) {
          e.ui.view.toolbar.element.style.display = "none";
        }

        e.data.processor._html2markdown._parser.keep("u");
        e.data.processor._html2markdown._parser.addRule("math", {
          filter: ["script"],
          replacement: function (content) {
            return "$" + content.replace(/(?:\\(.))/g, "$1") + "$";
          },
        });
        const latex = {
          name: "latex",
          level: "inline",
          start(src) {
            return src.match(/\$/)?.index;
          },
          tokenizer(src) {
            // Inspired by https://github.com/markedjs/marked/blob/4c5b974b391f913ac923610bd3740ef27ccdae95/src/Tokenizer.js#L647
            const cap = /^(\$+)([^$]|[^$][\s\S]*?[^$])\1(?!\$)/.exec(src);
            if (cap) {
              let formula = cap[2].replace(/\n/g, " ");
              const hasNonSpaceChars = /[^ ]/.test(formula);
              const hasSpaceCharsOnBothEnds =
                /^ /.test(formula) && / $/.test(formula);
              if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
                formula = formula.substring(1, formula.length - 1);
              }
              return {
                type: "latex",
                raw: cap[0],
                text: formula,
              };
            }
          },
          renderer({ text }) {
            return `<script type="math/tex">${text}</script>`;
          },
        };
        e.data.processor._markdown2html._parser.use({ extensions: [latex] });
        e.setData(data);

        e.model.document.on("change:data", () => {
          const artificialEvent = {
            target: { name: name, value: e.getData() },
            isPersistent: () => false,
          };
          setInputs(artificialEvent);
        });
      }}
    />
  );
}

export default CkEditor;
