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
 *  DatasetState.js
 *  Redux-based state-management code.
 */

import { combineReducers } from 'redux'

function setCore(name, value) {
  return {type: 'core', payload: {[name]: value}}
}

function setVisibility(level) {
  return {type: 'visibility', payload: {level} }
}

function core(state, action) {
  if (state == null) {
    state = {title: "", description: ""} // initial state of core fields
  }
  if (action.type != 'core') return state;
  // Can also use the explicit version below
  // return Object.assign({}, state, action.payload)
  return {...state, ...action.payload}

}

function visibility(state, action) {
  if (state == null) {
    state = {level: "public"} // initial state of visibility field
  }
  if (action.type != 'visibility') return state;
  return {...state, ...action.payload}
}

const newDataSetReducer = combineReducers({core, visibility});

export { setCore, setVisibility, newDataSetReducer };
