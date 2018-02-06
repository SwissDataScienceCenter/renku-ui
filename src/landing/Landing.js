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
 *  incubator-renga-ui
 *
 *  Landing.js
 *  Container components for the landing page.
 */

import React, { Component } from 'react';

import { Provider, connect } from 'react-redux'

import { createStore } from '../UIState'
import Present from './Landing.present'
import State from './Landing.state'


class Home extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(State.Home.reduce);
  }

  componentDidMount() {
    // this.listProjects();
  }

  mapStateToProps(state, ownProps) { return state  }

  mapDispatchToProps(dispatch, ownProps) {
    return {
      onYourActivity: (e) => { dispatch(State.Home.Ui.selectYourActivity()) },
      onYourNetwork: (e) => { dispatch(State.Home.Ui.selectYourNetwork()) },
      onExplore: (e) => { dispatch(State.Home.Ui.selectExplore()) },
    }
  }

  render() {
    const VisibleHome = connect(this.mapStateToProps, this.mapDispatchToProps)(Present.Home);
    return [
      <Provider key="new" store={this.store}>
        <VisibleHome />
      </Provider>
    ]
  }
}

export default { Home };
