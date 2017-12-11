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

function displayIdFromTitle(title) {
  // title.Author: Alex K. - https://stackoverflow.com/users/246342/alex-k
  // Source: https://stackoverflow.com/questions/6507056/replace-all-whitespace-characters/6507078#6507078
  title = title.replace(/\s/g, "-");
  title = title.toLowerCase();
  return title;
}

const Core = {
  set: (name, value) => {
    const payload = {[name]: value};
    if (name === 'title') payload['displayId'] = displayIdFromTitle(value);
    return {type: 'core', payload}
  },
  reduce: (state, action) => {
    if (state == null) {
      state = {title: "", description: "", displayId: ""} // initial state of core fields
    }
    if (action.type !== 'core') return state;
    // Can also use the explicit version below
    // return Object.assign({}, state, action.payload)
    return {...state, ...action.payload}
  }
}

const Visibility = {
  set: (level) => {
    return {type: 'visibility', payload: {level} }
  },
  reduce: (state, action) => {
    if (state == null) {
      state = {level: "public"} // initial state of visibility field
    }
    if (action.type !== 'visibility') return state;
    return {...state, ...action.payload}
  }
}

const reducer = combineReducers({core: Core.reduce, visibility: Visibility.reduce});

export default { Core, Visibility, reducer };
export { displayIdFromTitle };
