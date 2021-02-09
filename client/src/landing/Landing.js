/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
 *  incubator-renku-ui
 *
 *  Landing.js
 *  Container components for the landing page.
 */

import React, { Component } from "react";
import { connect } from "react-redux";

import Present from "./Landing.present";
import { ProjectsCoordinator } from "../project/shared";
import { Url } from "../utils/url";

const urlMap = {
  projectsUrl: Url.get(Url.pages.projects),
  projectNewUrl: Url.get(Url.pages.project.new),
  projectsSearchUrl: Url.get(Url.pages.projects.all),
  projectsStarredUrl: Url.get(Url.pages.projects.starred),
  siteStatusUrl: Url.get(Url.pages.help.status)
};

class Home extends Component {
  constructor(props) {
    super(props);

    this.projectsCoordinator = new ProjectsCoordinator(props.client, props.model.subModel("projects"));
  }

  componentDidMount() {
    if (this.props.user.logged)
      this.projectsCoordinator.getFeatured();
  }

  mapStateToProps(state, ownProps) {
    // map projects to props
    return { projects: state.projects };
  }

  render() {
    const ConnectedProjectsHome = connect(this.mapStateToProps.bind(this))(Present.Home);

    return <ConnectedProjectsHome
      user={this.props.user}
      welcomePage={atob(this.props.welcomePage)}
      urlMap={urlMap}
      statuspageId={this.props.statuspageId}
      statuspageModel={this.props.model.subModel("statuspage")}
      store={this.props.model.reduxStore}
    />;
  }
}


export default { Home };
