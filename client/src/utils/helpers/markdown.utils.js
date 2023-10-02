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

import showdown from "showdown";
import showdownHighlight from "showdown-highlight";
// Version 0.8.0 of showdown-katex breaks the tests so do not update the library
import showdownKatex from "showdown-katex";
import showdownMermaid from "showdown-mermaid";
import DOMPurify from "dompurify";

// ! This functions should only be imported from src/components/markdown/RenkuMarkdown.js
// ! If imported multiple times, the main bundle will contain showdown and
// ! other showdown extensions, adding ~700kB to the main bundle.
export function sanitizedHTMLFromMarkdown(markdown, singleLine = false) {
  // Reference: https://github.com/showdownjs/showdown/wiki/Showdown-Options
  const showdownOptions = {
    ghCompatibleHeaderId: true,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    strikethrough: true, // eslint-disable-line
    tables: true,
    tasklists: true, // eslint-disable-line
    disableForced4SpacesIndentedSublists: true, // eslint-disable-line
    literalMidWordUnderscores: true,
    emoji: true,
  };
  const showdownClasses = {
    table: "table word-break-normal",
  };
  // Reference: https://github.com/showdownjs/showdown/wiki/Add-default-classes-for-each-HTML-element
  const bindings = Object.keys(showdownClasses).map((key) => ({
    type: "output",
    regex: new RegExp(`<${key}(.*?)(?:(class="([^"]*)")(.*))?>`, "g"),
    replace: `<${key} $1 class="$3 ${showdownClasses[key]}" $4>`,
  }));
  const converter = new showdown.Converter({
    ...showdownOptions,
    extensions: [
      ...bindings,
      showdownMermaid(),
      showdownHighlight({ pre: true }),
      showdownKatex({
        throwOnError: false,
        displayMode: true,
        errorColor: "var(--bs-danger)",
        delimiters: [{ left: "$", right: "$", display: false }],
      }),
    ],
  });
  if (singleLine && markdown) {
    const lineBreakers = ["<br>", "<br />", "<br/>", "\n"];
    const breakPosition = Math.max(
      ...lineBreakers.map((elem) => markdown.indexOf(elem))
    );
    if (breakPosition !== -1) markdown = markdown.substring(0, breakPosition);
  }
  // adding gitlab delimiters support https://docs.gitlab.com/ee/user/markdown.html#math
  // inline math code between $` and `$
  markdown = markdown?.replace(new RegExp(/\$`/i, "gm"), "$");
  markdown = markdown?.replace(new RegExp(/`\$/i, "gm"), "$");
  // Reference https://github.com/obedm503/showdown-katex
  // this showdown extension only support ```ascii math or ```latex
  markdown = markdown?.replace(new RegExp("\\```math", "gm"), "```latex");
  const htmlFromMarkdown = converter.makeHtml(markdown);
  const sanitized = DOMPurify.sanitize(htmlFromMarkdown);
  return sanitized;
}
