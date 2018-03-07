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

const User = {
  // Actions related to user state...
  set: (user) => {
    return { type: SET_USER_INFO, payload: user };
  },
  // ... and the reducer.
  reducer: (state = null, action) => {
    switch (action.type) {
    case SET_USER_INFO:
      return action.payload;
    default:
      return state;
    }
  }
};

export { User };
