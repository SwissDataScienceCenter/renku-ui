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

import React, { useEffect } from "react";
import mermaid from "mermaid";
import RenkuMarkdownWithPathTranslation from "./RenkuMarkdownWithPathTranslation";
import { sanitizedHTMLFromMarkdown } from "../../helpers/HelperFunctions";

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

  if (props.fixRelativePaths)
    return <RenkuMarkdownWithPathTranslation {...props} />;

  const { singleLine, className, markdownText, style } = props;
  let classNameMarkdown = "text-break renku-markdown";
  if (singleLine)
    classNameMarkdown += " children-no-spacing";
  if (className)
    classNameMarkdown += " " + className;

  return <div
    className={classNameMarkdown}
    style={style}
    dangerouslySetInnerHTML={{ __html: sanitizedHTMLFromMarkdown(markdownText, singleLine) }}>
  </div>;
}

/**
 * This component converts markdown to text. It is meant to be used when an extract of
 * a description in markdown should be be displayed.
 * @param {string} markdownText is the markdown text that wants to be displayed
 * @param {integer} charsLimit is the number of characters that will be displayed
 */
function MarkdownTextExcerpt(props) {
  // Alternative implementation to strip styling.
  // const temp = document.createElement("div");
  // temp.innerHTML = sanitizedHTMLFromMarkdown(this.props.markdownText, false);
  // const innerText = temp.textContent || temp.innerText || "";
  // return this.props.charsLimit !== undefined && innerText.length > this.props.charsLimit ?
  //   innerText.substr(0, this.props.charsLimit) + "..." : innerText;
  const style = props.heightLimit ?
    { maxHeight: `${props.heightLimit}ch` }
    : { maxWidth: `${props.charsLimit}ch` };
  const text = props.charsLimit && (props.markdownText.length > props.charsLimit) ?
    props.markdownText.slice(0, props.charsLimit) + "..." : props.markdownText;
  return <RenkuMarkdown markdownText={text} singleLine={props.singleLine || false} style={style} />;
}

export { RenkuMarkdown, MarkdownTextExcerpt };
