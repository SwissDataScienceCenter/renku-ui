/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  Privacy.container.js
 *  Container components for privacy
 */

import React, { Component } from "react";

import { Privacy as PrivacyPresent, CookieBanner } from "./Privacy.present";

const LAYOUT = {
  cookieName: "RenkuLabPrivacy",
  disableStyles: true,
  containerClasses: "fixed-bottom p-3 bg-dark",
  contentClasses: "text-white small",
  buttonClasses: "btn btn-sm btn-light mr-2",
  buttonWrapperClasses: "mt-2",
};
const CONTENT = `This website uses cookies to enhance the user experience. By clicking or navigating
the site, you consent to the use of cookies in accordance with
our <a class="text-white" href="/privacy">Privacy Policy</a>.`;

/**
 * Return the HTML content with support for react routing
 *
 * @param {string} content - html content in string form.
 * @param {Object} history - react history object for the local routing
 */
class RoutedContent extends React.Component {
  // catch the anchor links and use the react route instead
  contentClickHandler = (e) => {
    const targetLink = e.target.closest("a");
    if (!targetLink)
      return;
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

/**
 * Return the HTML content with support for react routing
 *
 * @param {Object} params - parameters object for renku-ui.
 * @param {Object} history - react history object for the local routing
 */
class Cookie extends Component {
  render() {
    const { params, history } = this.props;

    // REF: https://www.npmjs.com/package/react-cookie-consent
    const layout = params["PRIVACY_BANNER_LAYOUT"] ?
      params["PRIVACY_BANNER_LAYOUT"] :
      LAYOUT;
    const content = params["PRIVACY_BANNER_CONTENT"] ?
      atob(params["PRIVACY_BANNER_CONTENT"]) :
      CONTENT;
    const renderedContent = (<RoutedContent content={content} history={history} />);

    return (<CookieBanner layout={layout} content={renderedContent} />);
  }
}

class Privacy extends Component {
  render() {
    const { params } = this.props;

    const content = params["PRIVACY_STATEMENT"] ?
      params["PRIVACY_STATEMENT"] :
      null;

    return (<PrivacyPresent content={content} />);
  }
}

export { Privacy, Cookie, RoutedContent };
