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
 *  UIState.js
 *  Utility UI state management.
 */

import { configureStore } from "@reduxjs/toolkit";
import { projectKgApi } from "../../features/projects/ProjectKgApi";
import { sessionSidecarApi } from "../../features/session/sidecarApi";
import { kgSearchApi } from "../../features/kgSearch";
import kgSearchFormSlice from "../../features/kgSearch/KgSearchSlice";
import { recentUserActivityApi } from "../../features/recentUserActivity/RecentUserActivityApi";
import { inactiveKgProjectsApi } from "../../features/inactiveKgProjects/InactiveKgProjectsApi";
import kgInactiveProjectsSlice from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";

function createStore(renkuStateModelReducer, name = "renku") {
  renkuStateModelReducer[projectKgApi.reducerPath] = projectKgApi.reducer;
  renkuStateModelReducer[sessionSidecarApi.reducerPath] = sessionSidecarApi.reducer;
  renkuStateModelReducer[kgSearchApi.reducerPath] = kgSearchApi.reducer;
  renkuStateModelReducer[recentUserActivityApi.reducerPath] = recentUserActivityApi.reducer;
  renkuStateModelReducer[inactiveKgProjectsApi.reducerPath] = inactiveKgProjectsApi.reducer;
  renkuStateModelReducer[kgSearchFormSlice.name] = kgSearchFormSlice.reducer;
  renkuStateModelReducer[kgInactiveProjectsSlice.name] = kgInactiveProjectsSlice.reducer;
  // For the moment, disable the custom middleware, since it causes
  // problems for our app.
  const store = configureStore({
    reducer: renkuStateModelReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).concat(projectKgApi.middleware)
        .concat(kgSearchApi.middleware)
        .concat(sessionSidecarApi.middleware),
  });
  return store;
}

// TODO: Introduce a mock store for testing
// import configureMockStore from 'redux-mock-store'
// function createMockStore(reducer, name='renku') {
//   const mockStore = configureMockStore([thunk]);
//   return mockStore;
// }

export { createStore };
