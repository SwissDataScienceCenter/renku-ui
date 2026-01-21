/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
 *  RenkuMarkdown.js
 *  RenkuMarkdown code and presentation.
 */

import mermaid from "mermaid";
import { useEffect } from "react";

import { sanitizedHTMLFromMarkdown } from "../../utils/helpers/markdown.utils";
import RenkuMarkdownWithPathTranslation from "./RenkuMarkdownWithPathTranslation";

mermaid.initialize({
  startOnLoad: true,
});

/**
 * Safely render RenkuMarkdown.
 * @param {string} markdownText the markdown text to display
 * @param {string} className any className to apply
 * @param {boolean} singleLine if true, render the output as a single line without line breaks
 * @param {object} style any styles to apply
 */
function RenkuMarkdown(props) {
  useEffect(() => {
    mermaid.contentLoaded();
  });

  const { singleLine, className, markdownText, style } = props;
  const markdownHtml = sanitizedHTMLFromMarkdown(markdownText, singleLine);

  if (props.fixRelativePaths) {
    return (
      <RenkuMarkdownWithPathTranslation
        markdownHtml={markdownHtml}
        {...props}
      />
    );
  }

  let classNameMarkdown = "text-break renku-markdown";
  if (singleLine) classNameMarkdown += " children-no-spacing";
  if (className) classNameMarkdown += " " + className;

  return (
    <div
      className={classNameMarkdown}
      style={style}
      dangerouslySetInnerHTML={{
        __html: markdownHtml,
      }}
    ></div>
  );
}

export { RenkuMarkdown };
