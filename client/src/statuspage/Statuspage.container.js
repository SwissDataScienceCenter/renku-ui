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
 *  Statuspage.container
 *  Components for the displaying information from statuspage.io
 */

import React from "react";
import { connect } from "react-redux";

import { StatuspageDisplay as DisplayPresent, StatuspageBanner as BannerPresent } from "./Statuspage.present";

function mapStateToProps(state, ownProps) {
  return { statusSummary: state.stateModel.statuspage, ...ownProps };
}

/**
 *
 * @param {object} props.model The global model
 */
function StatuspageDisplay(props) {
  const VisibleDisplay = connect(mapStateToProps)(DisplayPresent);
  return <VisibleDisplay store={props.model.reduxStore} />;
}

/**
 *
 * @param {object} props.model The global model
 */
function StatuspageBanner(props) {
  const VisibleBanner = connect(mapStateToProps)(BannerPresent);
  return <VisibleBanner store={props.model.reduxStore} siteStatusUrl={props.siteStatusUrl} location={props.location} />;
}


export { StatuspageDisplay, StatuspageBanner };
