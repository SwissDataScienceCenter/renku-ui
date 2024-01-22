/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import React from "react";

/**
 * Return the HTML content with support for react routing
 *
 * @param {string} content - html content in string form.
 * @param {Object} history - react history object for the local routing
 */
export default class RoutedContent extends React.Component {
  // catch the anchor links and use the react route instead
  contentClickHandler = (e) => {
    const targetLink = e.target.closest("a");
    if (!targetLink) return;
    e.preventDefault();

    // remove the local prefix to avoid repetition
    const localUrl = e.target.href.replace(window.location.origin, "");
    this.props.history.push(localUrl);
  };

  render() {
    return (
      <div
        onClick={this.contentClickHandler}
        dangerouslySetInnerHTML={{ __html: this.props.content }}
      />
    );
  }
}
