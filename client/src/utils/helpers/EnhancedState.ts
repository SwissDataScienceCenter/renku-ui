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
 * Exposes createStore() which creates the redux store used by the Renku UI
 */

import {
  Action,
  AnyAction,
  ReducersMapObject,
  StoreEnhancer,
  configureStore,
} from "@reduxjs/toolkit";

import { dashboardMessageSlice } from "../../features/dashboard/message/dashboardMessageSlice";
import { dataServicesApi } from "../../features/dataServices/dataServicesApi";
import { displaySlice } from "../../features/display/displaySlice";
import { datasetFormSlice } from "../../features/project/dataset";
import { datasetsCoreApi } from "../../features/datasets/datasetsCore.api";
import { inactiveKgProjectsApi } from "../../features/inactiveKgProjects/InactiveKgProjectsApi";
import { kgInactiveProjectsSlice } from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";
import { kgSearchApi } from "../../features/kgSearch";
import { projectCoreApi } from "../../features/project/projectCoreApi";
import { projectKgApi } from "../../features/project/projectKgApi";
import { projectsApi } from "../../features/projects/projectsApi";
import { projectsKgApi } from "../../features/projects/projectsKgApi";
import { recentUserActivityApi } from "../../features/recentUserActivity/RecentUserActivityApi";
import { sessionApi } from "../../features/session/sessionApi";
import { sessionSidecarApi } from "../../features/session/sidecarApi";
import { startSessionOptionsSlice } from "../../features/session/startSessionOptionsSlice";
import { versionsApi } from "../../features/versions/versionsApi";
import { workflowsApi } from "../../features/workflows/WorkflowsApi";
import { workflowsSlice } from "../../features/workflows/WorkflowsSlice";
import projectGitlabApi from "../../features/project/projectGitlabApi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStore = <S = any, A extends Action = AnyAction>(
  renkuStateModelReducer: ReducersMapObject<S, A>,
  enhancers: StoreEnhancer[] | undefined = undefined
) => {
  const enhancedReducer = {
    ...renkuStateModelReducer,
    [dashboardMessageSlice.name]: dashboardMessageSlice.reducer,
    [dataServicesApi.reducerPath]: dataServicesApi.reducer,
    [datasetFormSlice.name]: datasetFormSlice.reducer,
    [datasetsCoreApi.reducerPath]: datasetsCoreApi.reducer,
    [displaySlice.name]: displaySlice.reducer,
    [inactiveKgProjectsApi.reducerPath]: inactiveKgProjectsApi.reducer,
    [kgInactiveProjectsSlice.name]: kgInactiveProjectsSlice.reducer,
    [kgSearchApi.reducerPath]: kgSearchApi.reducer,
    [projectCoreApi.reducerPath]: projectCoreApi.reducer,
    [projectGitlabApi.reducerPath]: projectGitlabApi.reducer,
    [projectKgApi.reducerPath]: projectKgApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [projectsKgApi.reducerPath]: projectsKgApi.reducer,
    [recentUserActivityApi.reducerPath]: recentUserActivityApi.reducer,
    [sessionApi.reducerPath]: sessionApi.reducer,
    [sessionSidecarApi.reducerPath]: sessionSidecarApi.reducer,
    [startSessionOptionsSlice.name]: startSessionOptionsSlice.reducer,
    [versionsApi.reducerPath]: versionsApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
    [workflowsSlice.name]: workflowsSlice.reducer,
  };

  // For the moment, disable the custom middleware, since it causes problems for our app.
  const store = configureStore({
    reducer: enhancedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      })
        .concat(dataServicesApi.middleware)
        .concat(datasetsCoreApi.middleware)
        .concat(inactiveKgProjectsApi.middleware)
        .concat(kgSearchApi.middleware)
        .concat(projectCoreApi.middleware)
        .concat(projectGitlabApi.middleware)
        .concat(projectKgApi.middleware)
        .concat(projectsApi.middleware)
        .concat(projectsKgApi.middleware)
        .concat(recentUserActivityApi.middleware)
        .concat(sessionApi.middleware)
        .concat(sessionSidecarApi.middleware)
        .concat(versionsApi.middleware)
        .concat(workflowsApi.middleware),
    enhancers,
  });
  return store;
};

// TODO: Introduce a mock store for testing
// import configureMockStore from 'redux-mock-store'
// function createMockStore(reducer, name='renku') {
//   const mockStore = configureMockStore([thunk]);
//   return mockStore;
// }
