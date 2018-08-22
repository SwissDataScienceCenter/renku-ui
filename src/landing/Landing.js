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

import React, { Component } from 'react';

import { Provider, connect } from 'react-redux'

import { createStore } from '../utils/EnhancedState'
import Present from './Landing.present'
import State from './Landing.state'

function urlMap() {
  return {
    projectsUrl: '/projects',
    projectNewUrl: '/project_new'
  }
}


class Starred extends Component {
  render() {
    const user = this.props.user;
    const projects = (user) ? user.starredProjects : [];
    return <Present.Starred urlMap={this.props.urlMap} projects={projects} welcomePage={this.props.welcomePage} />
  }
}


class Home extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.Home.reduce);
  }

  componentDidMount() {
    // this.listProjects();
  }

  mapStateToProps(state, ownProps) {
    const urls = urlMap();
    const local = {
      starred: <Starred user={ownProps.user} urlMap={urls} welcomePage={ownProps.welcomePage}/>,
      user: ownProps.user,
      urlMap: urls
    };
    return {...state, ...local}
  }


  mapDispatchToProps(dispatch, ownProps) {
    return {
      onStarred: (e) => { dispatch(State.Home.Ui.selectStarred()) },
      onYourActivity: (e) => { dispatch(State.Home.Ui.selectYourActivity()) },
      onYourNetwork: (e) => { dispatch(State.Home.Ui.selectYourNetwork()) },
      onExplore: (e) => { dispatch(State.Home.Ui.selectExplore()) },
      onWelcome: (e) => { dispatch(State.Home.Ui.selectWelcome()) },
    }
  }

  render() {
    const VisibleHome = connect(this.mapStateToProps, this.mapDispatchToProps)(Present.Home);
    return [
      <Provider key="new" store={this.store}>
        <VisibleHome user={this.props.user} welcomePage={atob(this.props.welcomePage)}/>
      </Provider>
    ]
  }
}

export default { Home };
