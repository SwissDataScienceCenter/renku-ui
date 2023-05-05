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
import { dataServicesApi } from "../../features/dataServices/dataServicesApi";
import displaySlice from "../../features/display/displaySlice";
import { inactiveKgProjectsApi } from "../../features/inactiveKgProjects/InactiveKgProjectsApi";
import kgInactiveProjectsSlice from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";
import { kgSearchApi } from "../../features/kgSearch";
import { projectCoreApi } from "../../features/project/projectCoreApi";
import { projectKgApi } from "../../features/projects/ProjectKgApi";
import { projectApi } from "../../features/projects/ProjectsApi";
import { recentUserActivityApi } from "../../features/recentUserActivity/RecentUserActivityApi";
import { sessionApi } from "../../features/session/sessionApi";
import { sessionSidecarApi } from "../../features/session/sidecarApi";
import { startSessionOptionsSlice } from "../../features/session/startSessionOptionsSlice";
import { versionsApi } from "../../features/versions/versionsApi";
import { workflowsApi } from "../../features/workflows/WorkflowsApi";
import workflowsSlice from "../../features/workflows/WorkflowsSlice";

function createStore(renkuStateModelReducer) {
  return createStoreWithEnhancers(renkuStateModelReducer);
}

function createStoreWithEnhancers(
  renkuStateModelReducer,
  enhancers = undefined
) {
  renkuStateModelReducer[dataServicesApi.reducerPath] = dataServicesApi.reducer;
  renkuStateModelReducer[kgSearchApi.reducerPath] = kgSearchApi.reducer;
  renkuStateModelReducer[projectApi.reducerPath] = projectApi.reducer;
  renkuStateModelReducer[projectCoreApi.reducerPath] = projectCoreApi.reducer;
  renkuStateModelReducer[projectKgApi.reducerPath] = projectKgApi.reducer;
  renkuStateModelReducer[sessionSidecarApi.reducerPath] =
    sessionSidecarApi.reducer;
  renkuStateModelReducer[sessionApi.reducerPath] = sessionApi.reducer;
  renkuStateModelReducer[startSessionOptionsSlice.name] =
    startSessionOptionsSlice.reducer;
  renkuStateModelReducer[recentUserActivityApi.reducerPath] =
    recentUserActivityApi.reducer;
  renkuStateModelReducer[inactiveKgProjectsApi.reducerPath] =
    inactiveKgProjectsApi.reducer;
  renkuStateModelReducer[kgInactiveProjectsSlice.name] =
    kgInactiveProjectsSlice.reducer;
  renkuStateModelReducer[versionsApi.reducerPath] = versionsApi.reducer;
  renkuStateModelReducer[displaySlice.name] = displaySlice.reducer;
  renkuStateModelReducer[workflowsApi.reducerPath] = workflowsApi.reducer;
  renkuStateModelReducer[workflowsSlice.name] = workflowsSlice.reducer;

  // For the moment, disable the custom middleware, since it causes problems for our app.
  const store = configureStore({
    reducer: renkuStateModelReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      })
        .concat(dataServicesApi.middleware)
        .concat(kgSearchApi.middleware)
        .concat(inactiveKgProjectsApi.middleware)
        .concat(projectApi.middleware)
        .concat(projectCoreApi.middleware)
        .concat(projectKgApi.middleware)
        .concat(sessionSidecarApi.middleware)
        .concat(recentUserActivityApi.middleware)
        .concat(sessionApi.middleware)
        .concat(versionsApi.middleware)
        .concat(workflowsApi.middleware),
    enhancers,
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
export { createStoreWithEnhancers };
