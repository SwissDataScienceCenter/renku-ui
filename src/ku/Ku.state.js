/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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
 *  KuState.js
 *  Redux-based state-management code.
 */

import { combineReducers } from 'redux';
import { slugFromTitle } from '../utils/HelperFunctions';

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

const Core = {
  set: (field, value) => {
    const action = createSetAction('core', field, value);
    if (field === 'title') action.payload['displayId'] = slugFromTitle(value);
    return action
  },
  reduce: (state, action) => {
    return reduceState('core', state, action, {title: '', description: '', displayId: ''})
  }
};

const Visibility = {
  set: (level) => {
    return createSetAction('visibility', 'level', level)
  },
  reduce: (state, action) => {
    return reduceState('visibility', state, action, {level: 'public'})
  }
};

const KuState = {
  change: () => ({type: 'change_ku_state', payload: null}),
  reduce: (appState, action) => {
    if (!appState) return null;
    const newKuState = appState.state === 'closed' ? 'opened' : 'closed';
    return {...appState, state: newKuState }
  }
};

const combinedFieldReducer = combineReducers({
  core: Core.reduce,
  visibility: Visibility.reduce
});

const New = { Core, Visibility,
  reducer: combinedFieldReducer
};

const View = { Core, Visibility, KuState,
  setAll: (result) => ({type:'server_return', payload: result }),
  reducer: (state, action) => {
    if (action.type === 'change_ku_state') return KuState.reduce(state, action);
    if (action.type !== 'server_return') return combinedFieldReducer(state, action);
    // Take server result and set it to the state
    return {...state, ...action.payload}
  }
};

const List = {
  set: (results) => {
    const action = {type:'server_return', payload: results };
    return action
  },
  append: (results) => {
    const action = {type:'server_return', payload: results };
    return action
  },
  reducer: (state, action) => {
    if (state == null) state = {kus:[]}
    if (action.type !== 'server_return') return state;
    const results = {kus: state.kus.concat(action.payload)};
    return results
  }
}

export default { New, View, List };
