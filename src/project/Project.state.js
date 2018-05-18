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
 *  Project.state.js
 *  Redux-based state-management code.
 */

import { UserState } from '../app-state';
import { API_ERRORS } from '../gitlab/errors';
import { StateModel} from '../model/Model';
import { projectSchema } from '../model/RenkuModels';


const List = {
  fetch: (client) => {
    return (dispatch) => {
      dispatch(List.request());
      client.getProjects()
        .then(d => dispatch(List.receive(d)))
        .catch(() => dispatch(List.receive([])));
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
};


class ProjectModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(projectSchema, stateBinding, stateHolder, initialState)
  }

  // TODO: Do we really want to re-fetch the entire project on every change?

  // TODO: Once state and client are fully adapted to each other, these functions should be trivial
  fetchProject = (client, id) => {
    client.getProject(id, {notebooks:true, data:true})
      .then(d => {
        this.setObject({
          core: d.metadata.core,
          system: d.metadata.system,
          visibility: d.metadata.visibility,
          files: d.files
        })
      })
  };

  fetchReadme = (client, id) => {
    this.setUpdating({data: {readme: true}});
    client.getProjectReadme(id)
      .then(d => this.set('data.readme', d))
      .catch(error => {
        console.log(error.case);
        if (error.case === API_ERRORS.notFoundError) {
          this.set('data.readme.text', 'No readme file found.')
        }
      })
  };

  setTags = (client, id, name, tags) => {
    this.setUpdating({system: {tag_list: [true]}});
    client.setTags(id, name, tags).then(() => {
      this.fetchProject(client, id);
    })
  };

  setDescription = (client, id, name, description) => {
    this.setUpdating({core: {description: true}});
    client.setDescription(id, name, description).then(() => {
      this.fetchProject(client, id);
    })
  };

  star = (client, id, userState, starred) => {
    client.starProject(id, starred).then((d) => {
      this.fetchProject(client, id);
      // TODO: Bad naming here - will be resolved once the user state is re-implemented.
      userState.dispatch(UserState.star(id))
    })
  };
}

export default { List };
export { ProjectModel };
