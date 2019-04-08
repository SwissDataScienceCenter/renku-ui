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


const Actions = {
  SET_USER_INFO: 'UserState.SET_USER_INFO',
  SET_STARRED_PROJECTS: 'UserState.SET_STARRED_PROJECTS',
  SET_MEMBER_PROJECTS: 'UserState.SET_MEMBER_PROJECTS',
  STAR_PROJECT: 'UserState.STAR_PROJECT',
}

const InitialState = {
  available: false
}

const SpecialPropVal = {
  UPDATING: 'is_updating'
};

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

const UserState = {
  // Actions for connecting to the server
  fetchAppUser: (client, dispatch) => {
    UserState.set({ available: SpecialPropVal.UPDATING })
    return client.getUser()
      .then(response => {
        dispatch(UserState.set({...response.data, available: true}));
        // TODO: Replace this after re-implementation of user state.
        client.getProjects({starred: true})
          .then((projectResponse) => {
            const reducedProjects = projectResponse.data.map((project) => starredProjectMetadata(project));
            dispatch(UserState.setStarred(reducedProjects));
          })
          .catch(() => dispatch(UserState.setStarred([])));
        client.getProjects({membership: true})
          .then((projectResponse) => {
            const reducedProjects = projectResponse.data.map((project) => starredProjectMetadata(project));
            dispatch(UserState.setMember(reducedProjects));
          })
          .catch(() => dispatch(UserState.setMember([])));
      })
      .catch((error) => {
        dispatch(UserState.set({available: true}));
      });
  },
  // Actions related to user state...
  set: (user) => {
    return { type: Actions.SET_USER_INFO, payload: user };
  },
  setStarred: (projectIds) => {
    return { type: Actions.SET_STARRED_PROJECTS, payload: projectIds };
  },
  setMember: (projectIds) => {
    return { type: Actions.SET_MEMBER_PROJECTS, payload: projectIds };
  },
  star: (projectId) => {
    return { type: Actions.STAR_PROJECT, payload: projectId };
  },
  // ... and the reducer.
  reducer: (state = InitialState, action) => {
    switch (action.type) {
    case Actions.SET_USER_INFO:
      return {...state, ...action.payload};
    case Actions.SET_STARRED_PROJECTS:
      return {...state, starredProjects: action.payload};
    case Actions.SET_MEMBER_PROJECTS:
      return {...state, memberProjects: action.payload};
    case Actions.STAR_PROJECT: {
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

export { InitialState };
export default UserState;
