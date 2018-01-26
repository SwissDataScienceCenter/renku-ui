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
 *  incubator-renga-ui
 *
 *  KuState.js
 *  Redux-based state-management code.
 */

import { combineReducers } from 'redux'

function displayIdFromTitle(title) {
  // title.Author: Alex K. - https://stackoverflow.com/users/246342/alex-k
  // Source: https://stackoverflow.com/questions/6507056/replace-all-whitespace-characters/6507078#6507078
  title = title.replace(/\s/g, '-');
  title = title.toLowerCase();
  return title;
}

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
    if (field === 'title') action.payload['displayId'] = displayIdFromTitle(value);
    return action
  },
  reduce: (state, action) => {
    return reduceState('core', state, action, {title: '', description: '', displayId: ''})
  }
}

const Visibility = {
  set: (level) => {
    return createSetAction('visibility', 'level', level)
  },
  reduce: (state, action) => {
    return reduceState('visibility', state, action, {level: 'public'})
  }
}

function dataset_object(id, asRef=true) {
  // Currently ignore addReff, but could later be used to refer to the url for the dataset
  // if (asRef) return {"$ref": `http://localhost:5000/datasets/${id}`} or {"$ref": `../datasets/${id}`}
  return {id}
}

const Datasets = {
  set: (id) => {
    return createSetAction('datasets', 'set', dataset_object(id, true))
  },
  append: (id) => {
    return createSetAction('datasets', 'append', dataset_object(id, true))
  },
  remove: (id) => {
    return createSetAction('datasets', 'remove', dataset_object(id, false))
  },
  reduce: (state, action) => {
    if (state == null) state = {refs: []}
    if (action.type !== 'datasets') return state;
    const payload = action.payload;
    const oldRefs = state.refs;
    let refs;
    if (payload.append != null) {
      refs = [...oldRefs, payload.append];
    } else if (payload.remove != null) {
      refs = oldRefs.filter(d => d.id !== payload.remove.id);
    } else if (payload.set != null) {
      refs = [payload.set];
    }
    return {...state, ...{refs}}
  }
}

const combinedFieldReducer = combineReducers({core: Core.reduce, visibility: Visibility.reduce, datasets: Datasets.reduce});

const New = { Core, Visibility, Datasets,
  reducer: combinedFieldReducer
};

const View = { Core, Visibility, Datasets,
  setAll: (result) => ({type:'server_return', payload: result }),
  reducer: (state, action) => {
    if (action.type !== 'server_return') return combinedFieldReducer(state, action);
    // Take server result and set it to the state
    return {...state, ...action.payload.metadata}
  }
};

const List = {
  set: (results) => {
    const action = {type:'server_return', payload: results.hits };
    return action
  },
  append: (results) => {
    const action = {type:'server_return', payload: { hits: results } };
    return action
  },
  reducer: (state, action) => {
    if (state == null) state = {kus:[]}
    if (action.type !== 'server_return') return state;
    const results = {kus: state.kus.concat(action.payload.hits)};
    return results
  }
}

export default { New, View, List };
export { displayIdFromTitle };
