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
 *  RenkuNavLink.js
 *  RenkuNavLink code and presentation.
 */

import React, { Component } from "react";
import { NavLink as RRNavLink } from "react-router-dom";
import { NavLink } from "reactstrap";

/**
 * Provide a react-router-compatible link to a URL. Show the link as active
 * if it matches either the to or alternate URL.
 */
class RenkuNavLink extends Component {

  constructor() {
    super();
    this.isActive = this.testActive.bind(this);
  }

  testActive(match, location) {
    const altArray = this.props.alternate ?
      Array.isArray(this.props.alternate) ?
        this.props.alternate : [this.props.alternate] : undefined;


    if (this.props.matchPath === true) {
      let haveMatch = (match != null || location.pathname.startsWith(this.props.to));
      if (!altArray) return haveMatch;
      return haveMatch || altArray.find(alt => location.pathname.startsWith(alt)) !== undefined;
    }
    let haveMatch = match != null;
    if (!altArray) return haveMatch;
    if (this.props.noSubPath)
      return haveMatch || altArray.find(alt => location.pathname.endsWith(alt)) !== undefined;
    return haveMatch || altArray.find(alt => location.pathname.startsWith(alt)) !== undefined;
  }

  render() {
    const { previous, title, icon } = this.props;
    const to = previous ?
      { "pathname": this.props.to, "state": { previous } } :
      this.props.to;
    const exact = (this.props.exact != null) ? this.props.exact : true;
    return (
      <NavLink exact={exact} to={to} isActive={this.isActive} tag={RRNavLink}
        id={this.props.id} className={this.props.className}>{icon} {title}</NavLink>
    );
  }
}
export { RenkuNavLink };
