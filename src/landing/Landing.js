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
import { Provider, connect } from "react-redux";

import { createStore } from "../utils/EnhancedState";
import Present from "./Landing.present";
import State from "./Landing.state";
import { ProjectsCoordinator } from "../project/shared";

function urlMap() {
  return {
    projectsUrl: "/projects",
    projectNewUrl: "/project_new",
    projectsSearchUrl: "/projects/all",
    projectsStarredUrl: "/projects/starred",
  };
}

class Home extends Component {
  mapStateToProps(state, ownProps) {
    // map projects to props
    return { projects: state.projects };
  }

  render() {
    const ConnectedProjectsHome = connect(this.mapStateToProps.bind(this))(HomeProjects);

    return <ConnectedProjectsHome
      store={this.props.model.reduxStore}
      {...this.props}
    />;
  }
}


class HomeProjects extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.Home.reduce);

    this.projectsCoordinator = new ProjectsCoordinator(props.client, props.model.subModel("projects"));
  }

  componentDidMount() {
    if (this.props.user.logged)
      this.projectsCoordinator.getFeatured();
  }

  mapStateToProps(state, ownProps) {
    const urls = urlMap();
    const local = {
      urlMap: urls
    };
    return { ...state, ...local };
  }


  mapDispatchToProps(dispatch, ownProps) {
    return {
      onStarred: (e) => { dispatch(State.Home.Ui.selectStarred()); },
      onMember: (e) => { dispatch(State.Home.Ui.selectMember()); },
      onYourNetwork: (e) => { dispatch(State.Home.Ui.selectYourNetwork()); },
      onExplore: (e) => { dispatch(State.Home.Ui.selectExplore()); },
      onWelcome: (e) => { dispatch(State.Home.Ui.selectWelcome()); },
    };
  }

  render() {
    const VisibleHome = connect(this.mapStateToProps, this.mapDispatchToProps)(Present.Home);
    return [
      <Provider key="new" store={this.store}>
        <VisibleHome
          welcomePage={atob(this.props.welcomePage)}
          user={this.props.user}
          projects={this.props.projects}
        />
      </Provider>
    ];
  }
}

export default { Home };
