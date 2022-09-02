/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
 *  NavBarWarnings.js
 *  Container and presentationl components for NavBar warnings
 */

import React from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { WarnAlert } from "../utils/components/Alert";


/**
 * Container component for the warning banners
 */
function NavBarWarnings(props) {
  function mapStateToProps(state, ownProps) {
    return { environment: state.stateModel.environment };
  }

  const VisibleBanner = connect(mapStateToProps)(NavBarWarningsPresent);
  return (<VisibleBanner store={props.model.reduxStore} uiShortSha={props.uiShortSha} />);
}

/**
 * Presentational component for the warning banners
 */
function NavBarWarningsPresent(props) {
  let { environment, uiShortSha } = props;
  const { uiVersion } = environment;

  // return when local ui version data is not available
  if (!uiShortSha || uiShortSha.toLowerCase() === "development" || uiShortSha.toLowerCase() === "dev")
    return null;

  // return when remote ui version data is not available
  if (!uiVersion.webSocket || !uiVersion.lastValue)
    return null;

  if (uiShortSha === uiVersion.lastValue)
    return null;

  return (
    <WarnAlert className="container-xxl renku-container" fade={false}>
      <h5>
        A new version of RenkuLab is available!
      </h5>
      <p className="m-0">
        Reload the page or{" "}
        <Button size="sm" color="warning" onClick={() => window.location.reload()}>
          click here <FontAwesomeIcon icon={faSyncAlt} />
        </Button>
        {" "}to refresh the UI. Sessions will keep running.
      </p>
    </WarnAlert>
  );
}


export { NavBarWarnings };
