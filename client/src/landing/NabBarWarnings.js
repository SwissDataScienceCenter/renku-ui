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
import { WarnAlert } from "../utils/UIComponents";


const versionUpdateInterval = 1000 * 60 * 5; // Update every 5 minutes

/**
 * Poller function to keep the server components version up-to-date. It doesn't need to run often.
 *
 * @param {Object} model - current model object for the environments (sub-model of the global model)
 * @param {*} client - API client
 */
function pollComponentsVersion(model, client) {
  async function fetchVersions() {
    model.setObject({ fetching: true });
    const componentsVersion = await client.getComponentsVersion();
    const environment = {
      fetching: false,
      fetched: new Date(),
      data: componentsVersion
    };
    model.setObject(environment);
  }
  fetchVersions();

  if (model.get("timeout"))
    return null;
  const idTimeout = setInterval(fetchVersions, versionUpdateInterval);
  model.setObject({ timeout: idTimeout });
  return null;
}

/**
 * Container component for the warning banners
 */
function VersionsBanner(props) {
  function mapStateToProps(state, ownProps) {
    return { environment: state.environment };
  }

  const VisibleBanner = connect(mapStateToProps)(VersionsBannerPresent);
  return (<VisibleBanner store={props.model.reduxStore} uiShortSha={props.uiShortSha} />);
}

/**
 * Presentational component for the warning banners
 */
function VersionsBannerPresent(props) {
  const { environment, uiShortSha } = props;

  // return when local ui version data is not available
  if (!uiShortSha || uiShortSha.toLowerCase() === "development" || uiShortSha.toLowerCase() === "dev")
    return null;

  // return when remote ui version data is not available
  if (!environment.fetched || !environment.data["ui-short-sha"])
    return null;

  if (uiShortSha === environment.data["ui-short-sha"])
    return null;

  return (
    <WarnAlert timeout={0} className="container-xxl renku-container" fade={false}>
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


export { pollComponentsVersion, VersionsBanner };
