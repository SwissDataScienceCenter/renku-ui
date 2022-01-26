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

import React, { Component } from "react";
import RenkuMarkdownWithPathTranslation from "./RenkuMarkdownWithPathTranslation";
import { sanitizedHTMLFromMarkdown } from "../../helpers/HelperFunctions";

/**
 * Safely render markdown.
 * @param {string} markdownText the markdown text to display
 * @param {boolean} singleLine if true, render the output as a single line without line breaks
 * @param {object} style any styles to apply
 */
class RenkuMarkdown extends Component {
  render() {
    const { singleLine, style, fixRelativePaths } = this.props;
    if (fixRelativePaths)
      return <RenkuMarkdownWithPathTranslation {...this.props} />;

    let className = "text-break renku-markdown";
    if (singleLine)
      className += " children-no-spacing";
    if (this.props.className)
      className += " " + this.props.className;

    return <div className={className} style={style}
      dangerouslySetInnerHTML={{ __html: sanitizedHTMLFromMarkdown(this.props.markdownText, singleLine) }}>
    </div>;
  }
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
