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

import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { useEffect, useRef } from "react";
import { atobUTF8 } from "../utils/helpers/Encoding";

interface CodePreviewProps {
  content: string;
  fileExtension: string;
}

export default function CodePreview(props: CodePreviewProps) {
  const codeBlock = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (codeBlock.current) {
      codeBlock.current.innerHTML = DOMPurify.sanitize(
        codeBlock.current.innerHTML
      );
      hljs.highlightBlock(codeBlock.current);
    }
  }, [codeBlock]);

  const languageName = extensionToHljsName(props.fileExtension);

  return (
    <pre ref={codeBlock} className={`hljs language-${languageName} bg-white`}>
      {atobUTF8(props.content)}
    </pre>
  );
}

function extensionToHljsName(ext: string) {
  return hljsNameMap[ext] ?? ext;
}

// See https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
/* eslint-disable spellcheck/spell-checker */
const hljsNameMap: Record<string, string> = {
  jl: "julia",
  f: "fortran",
  for: "fortran",
  ftn: "fortran",
  fpp: "fortran",
  f03: "fortran",
  f08: "fortran",
  m: "objectivec",
  mat: "matlab",
};
/* eslint-enable spellcheck/spell-checker */
