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
  constructor(props) {
    super(props);
    this.store = this.props.userState;
  }

  mapStateToProps(state, ownProps) {
    const projects = (state.user) ? state.user.starredProjects : []
    return {projects, urlMap: ownProps.urlMap}
  }

  render() {
    const VisibleStarred = connect(this.mapStateToProps)(Present.Starred);
    return [
      <Provider key="new" store={this.store}>
        <VisibleStarred urlMap={this.props.urlMap} />
      </Provider>
    ]
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
      starred: <Starred userState={ownProps.userState} urlMap={urls} />,
      user: ownProps.userState.getState().user,
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
        <VisibleHome userState={this.props.userState}/>
      </Provider>
    ]
  }
}

export default { Home };
