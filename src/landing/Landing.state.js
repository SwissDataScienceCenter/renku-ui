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
 *  Landing.state.js
 *  Redux-based state-management code.
 */

import { combineReducers } from 'redux'


function createSetAction(type, field, value) {
  const payload = {[field]: value};
  return {type, payload}
}

function reduceState(type, state, action, initial) {
  if (state == null) state = initial
  if (action.type !== type) return state;
  // Can also use the explicit version below
  // return Object.assign({}, state, action.payload)
  return {...state, ...action.payload}
}


const YourActivity = {
  fetchActivity: (client, id) => {
    const entity = 'your_activity';
    return (dispatch) => {
      dispatch(YourActivity.request(entity));
      client.getProject(id).then(d => dispatch(YourActivity.receive(d, entity)))
    }
  },
  request: (entity) => {
    const action = {type:'server_request', entity};
    return action
  },
  receive: (result, entity) => ({type:'server_return', entity, payload: result }),
  reduce: (state, action) => {
    if (state == null) return {your_activity: []}
    // Take server result and set it to the state
    if (action.entity === 'your_activity') return {...state, ...action.payload.activity}
    return state
  }
};

const NetworkActivity = {
  fetchActivity: (client, id) => {
    const entity = 'network_activity';
    return (dispatch) => {
      dispatch(YourActivity.request(entity));
      client.getProject(id).then(d => dispatch(NetworkActivity.receive(d, entity)))
    }
  },
  request: (entity) => {
    const action = {type:'server_request', entity};
    return action
  },
  receive: (result, entity) => ({type:'server_return', entity, payload: result }),
  reduce: (state, action) => {
    if (state == null) return {network_activity: []}
    // Take server result and set it to the state
    if (action.entity === 'network_activity') return {...state, ...action.payload.activity}
    return state
  }
};

const Ui = {
  selectStarred: () => {
    return createSetAction('ui', 'selected', 'starred');
  },
  selectMember: () => {
    return createSetAction('ui', 'selected', 'your_activity');
  },
  selectYourNetwork: () => {
    return createSetAction('ui', 'selected', 'your_network');
  },
  selectExplore: () => {
    return createSetAction('ui', 'selected', 'explore');
  },
  selectWelcome: () => {
    return createSetAction('ui', 'selected', 'welcome');
  },
  reduce: (state, action) => {
    return reduceState('ui', state, action, {selected: 'welcome'})
  }
}


const Home = {
  Ui, YourActivity, NetworkActivity,
  request: () => {
    const action = {type:'server_request' };
    return action
  },
  receive: (results) => {
    const action = {type:'server_return', payload: results };
    return action
  },
  reduce: combineReducers({ui: Ui.reduce,
    your_activity: YourActivity.reduce,
    network_activity: NetworkActivity.reduce})
}

export default { Home };
