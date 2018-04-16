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
 *  Project.state.js
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

const System = {
  set: (field, value) => {
    return  createSetAction('system', field, value);
  },
  reduce: (state, action) => {
    return reduceState('system', state, action,
      {tag_list: [], star_count: '', forks_count: '', ssh_url: '', http_url: ''})
  }
}

const Files = {
  set: (field, value) => {
    return  createSetAction('files', field, value);
  },
  reduce: (state, action) => {
    return reduceState('files', state, action,
      {notebooks: [], data: [], workflows: []})
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

const DataReference = {
  set: (field, value) => {
    return createSetAction('data_reference', field, value)
  },
  reduce: (state, action) => {
    return reduceState('data_reference', state, action, {url_or_doi:'', author: ''})
  }
}

const DataUpload = {
  set: (field, value) => {
    return createSetAction('data_upload', field, value)
  },
  reduce: (state, action) => {
    return reduceState('data_upload', state, action, {files: []})
  }
}

const Readme = {
  set: (field, value) => {
    return createSetAction('readme', field, value)
  },
  reduce: (state, action) => {
    return reduceState('readme', state, action, {text: ''})
  }
}

const Data = {
  set: (subtype, field, value) => {
    if ('reference' === subtype) return DataReference.set(field, value);
    if ('upload' === subtype) return DataUpload.set(field, value);
  },
  reduce: combineReducers({reference: DataReference.reduce, upload: DataUpload.reduce, readme: Readme.reduce})
}

// TODO -- incorporate files fields
const combinedFieldReducer = combineReducers({core: Core.reduce, visibility: Visibility.reduce,
  data: Data.reduce, system: System.reduce, files: Files.reduce});



const View = { Core, Visibility, Data,
  fetchMetadata: (client, id) => {
    const entity = 'metadata';
    return (dispatch) => {
      dispatch(View.request(entity));
      client.getProject(id, {notebooks:true, data:true})
        .then(d => dispatch(View.receive(d, entity)))
    }
  },
  fetchReadme: (client, id) => {
    const entity = 'readme';
    return (dispatch) => {
      dispatch(View.request(entity));
      client.getProjectReadme(id).then(d => dispatch(View.receive(d, entity)))
    }
  },
  setTags: (client, id, name, tags) => {
    const entity = 'metadata';
    return (dispatch) => {
      dispatch(View.update(entity));
      client.setTags(id, name, tags).then(d => {
        dispatch(View.request(entity));
        client.getProject(id).then(d => dispatch(View.receive(d, entity)));
      })
    }
  },
  setDescription: (client, id, name, description) => {
    const entity = 'metadata';
    return (dispatch) => {
      dispatch(View.update(entity));
      client.setDescription(id, name, description).then(d => {
        dispatch(View.request(entity));
        client.getProject(id).then(d => dispatch(View.receive(d, entity)));
      })
    }
  },
  update: (property) => {
    const action = {type:'server_update', property};
    return action
  },
  request: (entity) => {
    const action = {type:'server_request', entity};
    return action
  },
  receive: (result, entity) => ({type:'server_return', entity, payload: result }),
  reducer: (state, action) => {
    if (action.type !== 'server_return') return combinedFieldReducer(state, action);
    // Take server result and set it to the state
    if (action.entity === 'metadata') {
      const newState =  {...state, ...action.payload.metadata}
      if (action.payload.files) {
        newState.files = action.payload.files;
      }
      return newState;
    }
    if (action.entity === 'readme') {
      const newState = {...state};
      newState.data.readme.text = action.payload.text;
      return newState
    }
    console.log('Unknown action', action);
    return state
  }
};

const List = {
  fetch: (client) => {
    return (dispatch) => {
      dispatch(List.request());
      client.getProjects().then(d => dispatch(List.receive(d)))
    }
  },
  request: () => {
    const action = {type:'server_request' };
    return action
  },
  receive: (results) => {
    const action = {type:'server_return', payload: results };
    return action
  },
  append: (results) => {
    const action = {type:'server_return', payload: { hits: results } };
    return action
  },
  reducer: (state, action) => {
    if (state == null) state = {projects:[]}
    if (action.type !== 'server_return') return state;
    const results = {projects: state.projects.concat(action.payload)};
    return results
  }
}

export default { View, List };
