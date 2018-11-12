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


const SET_USER_INFO = 'SET_USER_INFO';
const SET_STARRED_PROJECTS = 'SET_STARRED_PROJECTS';
const STAR_PROJECT = 'STAR_PROJECT';

function starredProjectMetadata(project) {
  return {
    id: project.id,
    path_with_namespace: project.path_with_namespace,
    description: project.description,
    tag_list: project.tag_list,
    star_count: project.star_count,
    owner: project.owner,
    last_activity_at: project.last_activity_at
  }
}

const User = {
  // Actions for connecting to the server
  fetchAppUser: (client, dispatch) => {
    client.getUser()
      .then(response => {
        dispatch(User.set(response.data));
        // TODO: Replace this after re-implementation of user state.
        client.getProjects({starred: true})
          .then((projectResponse) => {
            const reducedProjects = projectResponse.data.map((project) => starredProjectMetadata(project));
            dispatch(User.setStarred(reducedProjects));
          })
          .catch(() => dispatch(User.setStarred([])));
      })
      .catch((error) => {
        console.error(error)
        User.set(undefined)
      });
  },
  // Actions related to user state...
  set: (user) => {
    return { type: SET_USER_INFO, payload: user };
  },
  setStarred: (projectIds) => {
    return { type: SET_STARRED_PROJECTS, payload: projectIds };
  },
  star: (projectId) => {
    return { type: STAR_PROJECT, payload: projectId };
  },
  // ... and the reducer.
  reducer: (state = null, action) => {
    switch (action.type) {
    case SET_USER_INFO:
      return {...state, ...action.payload};
    case SET_STARRED_PROJECTS:
      return {...state, starredProjects: action.payload};
    case STAR_PROJECT: {
      let newStarredProjects = state.starredProjects ? [...state.starredProjects] : [];
      const project = action.payload;
      const ind = newStarredProjects.map(p => p.id).indexOf(project.id);
      if (ind >= 0) {
        newStarredProjects.splice(ind, 1);
      }
      else {
        newStarredProjects.push(starredProjectMetadata(project));
      }
      return {...state, starredProjects: newStarredProjects}
    }
    default:
      return state;
    }
  }
};

export { User };
