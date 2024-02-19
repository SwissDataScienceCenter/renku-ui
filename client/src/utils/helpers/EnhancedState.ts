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

import adminComputeResourcesApi from "../../features/admin/adminComputeResources.api";
import adminKeycloakApi from "../../features/admin/adminKeycloak.api";
import adminSessionsApi from "../../features/admin/adminSessions.api";
import { dashboardMessageSlice } from "../../features/dashboard/message/dashboardMessageSlice";
import { dataServicesApi } from "../../features/dataServices/dataServices.api";
import { datasetsCoreApi } from "../../features/datasets/datasetsCore.api";
import { displaySlice } from "../../features/display/displaySlice";
import { inactiveKgProjectsApi } from "../../features/inactiveKgProjects/InactiveKgProjectsApi";
import { kgInactiveProjectsSlice } from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";
import { kgSearchApi } from "../../features/kgSearch";
import projectCloudStorageApi from "../../features/project/components/cloudStorage/projectCloudStorage.api";
import { datasetFormSlice } from "../../features/project/dataset";
import { projectCoreApi } from "../../features/project/projectCoreApi";
import projectGitLabApi from "../../features/project/projectGitLab.api";
import { projectKgApi } from "../../features/project/projectKg.api";
import { projectsApi } from "../../features/projects/projects.api";
import { projectV2Api } from "../../features/projectsV2/api/projectV2.enhanced-api";
import { projectV2NewSlice } from "../../features/projectsV2/new/projectV2New.slice";
import { recentUserActivityApi } from "../../features/recentUserActivity/RecentUserActivityApi";
import sessionsApi from "../../features/session/sessions.api";
import sessionSidecarApi from "../../features/session/sidecar.api";
import startSessionSlice from "../../features/session/startSession.slice";
import { startSessionOptionsSlice } from "../../features/session/startSessionOptionsSlice";
import sessionsV2Api from "../../features/sessionsV2/sessionsV2.api";
import termsApi from "../../features/terms/terms.api";
import { dataServicesUserApi } from "../../features/user/dataServicesUser.api";
import keycloakUserApi from "../../features/user/keycloakUser.api";
import userPreferencesApi from "../../features/user/userPreferences.api";
import { versionsApi } from "../../features/versions/versions.api";
import { workflowsApi } from "../../features/workflows/WorkflowsApi";
import { workflowsSlice } from "../../features/workflows/WorkflowsSlice";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStore = <S = any, A extends Action = AnyAction>(
  renkuStateModelReducer: ReducersMapObject<S, A>,
  enhancers: StoreEnhancer[] | undefined = undefined
) => {
  const enhancedReducer = {
    ...renkuStateModelReducer,
    // Slices
    [dashboardMessageSlice.name]: dashboardMessageSlice.reducer,
    [datasetFormSlice.name]: datasetFormSlice.reducer,
    [displaySlice.name]: displaySlice.reducer,
    [kgInactiveProjectsSlice.name]: kgInactiveProjectsSlice.reducer,
    [startSessionSlice.name]: startSessionSlice.reducer,
    [startSessionOptionsSlice.name]: startSessionOptionsSlice.reducer,
    [projectV2NewSlice.name]: projectV2NewSlice.reducer,
    [workflowsSlice.name]: workflowsSlice.reducer,
    // APIs
    [adminComputeResourcesApi.reducerPath]: adminComputeResourcesApi.reducer,
    [adminKeycloakApi.reducerPath]: adminKeycloakApi.reducer,
    [adminSessionsApi.reducerPath]: adminSessionsApi.reducer,
    [dataServicesApi.reducerPath]: dataServicesApi.reducer,
    [dataServicesUserApi.reducerPath]: dataServicesUserApi.reducer,
    [datasetsCoreApi.reducerPath]: datasetsCoreApi.reducer,
    [inactiveKgProjectsApi.reducerPath]: inactiveKgProjectsApi.reducer,
    [keycloakUserApi.reducerPath]: keycloakUserApi.reducer,
    [kgSearchApi.reducerPath]: kgSearchApi.reducer,
    [projectCloudStorageApi.reducerPath]: projectCloudStorageApi.reducer,
    [projectCoreApi.reducerPath]: projectCoreApi.reducer,
    [projectGitLabApi.reducerPath]: projectGitLabApi.reducer,
    [projectKgApi.reducerPath]: projectKgApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [projectV2Api.reducerPath]: projectV2Api.reducer,
    [recentUserActivityApi.reducerPath]: recentUserActivityApi.reducer,
    [sessionsApi.reducerPath]: sessionsApi.reducer,
    [sessionSidecarApi.reducerPath]: sessionSidecarApi.reducer,
    [sessionsV2Api.reducerPath]: sessionsV2Api.reducer,
    [termsApi.reducerPath]: termsApi.reducer,
    [userPreferencesApi.reducerPath]: userPreferencesApi.reducer,
    [versionsApi.reducerPath]: versionsApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
  };

  // For the moment, disable the custom middleware, since it causes problems for our app.
  const store = configureStore({
    reducer: enhancedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      })
        .concat(adminComputeResourcesApi.middleware)
        .concat(adminKeycloakApi.middleware)
        .concat(adminSessionsApi.middleware)
        .concat(dataServicesApi.middleware)
        // this is causing some problems, and I do not know why
        .concat(dataServicesUserApi.middleware)
        .concat(datasetsCoreApi.middleware)
        .concat(inactiveKgProjectsApi.middleware)
        .concat(keycloakUserApi.middleware)
        .concat(kgSearchApi.middleware)
        .concat(projectCloudStorageApi.middleware)
        .concat(projectCoreApi.middleware)
        .concat(projectGitLabApi.middleware)
        .concat(projectKgApi.middleware)
        .concat(projectsApi.middleware)
        .concat(projectV2Api.middleware)
        .concat(recentUserActivityApi.middleware)
        .concat(sessionSidecarApi.middleware)
        .concat(sessionsApi.middleware)
        .concat(sessionSidecarApi.middleware)
        .concat(sessionsV2Api.middleware)
        .concat(termsApi.middleware)
        .concat(userPreferencesApi.middleware)
        .concat(versionsApi.middleware)
        .concat(workflowsApi.middleware),
    enhancers,
  });
  return store;
};

type StoreType = ReturnType<typeof createStore>;

export type StrictRootState = ReturnType<StoreType["getState"]>;

export type LegacyRootState = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateModel: any;
};

export type RootState = StrictRootState & LegacyRootState;

export type AppDispatch = StoreType["dispatch"];

// TODO: Introduce a mock store for testing
// import configureMockStore from 'redux-mock-store'
// function createMockStore(reducer, name='renku') {
//   const mockStore = configureMockStore([thunk]);
//   return mockStore;
// }
