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
 *  Maintenance.js
 *  Maintenance components.
 */

import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Jumbotron } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";

import { MaintenanceNavBar, FooterNavbar } from "./landing";


class Maintenance extends Component {
  render() {
    const { info } = this.props;

    const headerText = "Maintenance";
    const body = info && info !== "true" && info !== "1" ?
      info :
      "Renku is undergoing maintenance. It should be available again soon. Please check back in a little while.";
    return (
      <Router>
        <div>
          <Route component={MaintenanceNavBar} />
          <main role="main" className="container-fluid">
            <Jumbotron>
              <h1 className="text-center text-primary">
                <FontAwesomeIcon icon={faWrench} /> {headerText} <FontAwesomeIcon icon={faWrench} />
              </h1>
              <br />
              <p className="text-center">{body}</p>
            </Jumbotron>
          </main>
          <Route component={FooterNavbar} />
        </div>
      </Router>
    );
  }
}

export { Maintenance };
