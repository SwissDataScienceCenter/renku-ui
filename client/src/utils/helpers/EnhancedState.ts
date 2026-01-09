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
  configureStore,
  ReducersMapObject,
  StoreEnhancer,
} from "@reduxjs/toolkit";

import { notificationsEmptyApi as notificationsApi } from "~/features/notifications/api/notifications.empty-api";
import { computeResourcesEmptyApi as computeResourcesApi } from "~/features/sessionsV2/api/computeResources.empty-api";
import adminKeycloakApi from "../../features/admin/adminKeycloak.api";
import { connectedServicesEmptyApi as connectedServicesApi } from "../../features/connectedServices/api/connectedServices.empty-api";
import { dataConnectorsApi } from "../../features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { doiResolverEmptyApi as doiResolverApi } from "../../features/dataConnectorsV2/api/doiResolver.empty-api";
import dataConnectorFormSlice from "../../features/dataConnectorsV2/state/dataConnectors.slice";
import { datasetsCoreApi } from "../../features/datasets/datasetsCore.api";
import { displaySlice } from "../../features/display/displaySlice";
import { inactiveKgProjectsApi } from "../../features/inactiveKgProjects/InactiveKgProjectsApi";
import { kgInactiveProjectsSlice } from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";
import { platformEmptyApi as platformApi } from "../../features/platform/api/platform-empty.api";
import { statuspageEmptyApi as statuspageApi } from "../../features/platform/statuspage-api/statuspage-empty.api";
import { projectCloudStorageEmptyApi as projectCloudStorageApi } from "../../features/project/components/cloudStorage/api/projectCloudStorage.empty-api";
import { datasetFormSlice } from "../../features/project/dataset";
import { projectCoreApi } from "../../features/project/projectCoreApi";
import projectGitLabApi from "../../features/project/projectGitLab.api";
import { projectKgApi } from "../../features/project/projectKg.api";
import { projectsApi } from "../../features/projects/projects.api";
import { projectV2Api } from "../../features/projectsV2/api/projectV2.enhanced-api";
import { recentUserActivityApi } from "../../features/recentUserActivity/RecentUserActivityApi";
import { repositoriesApi } from "../../features/repositories/api/repositories.api";
import { searchV2EmptyApi as searchV2Api } from "../../features/searchV2/api/searchV2-empty.api";
import { searchV2Slice } from "../../features/searchV2/searchV2.slice";
import sessionsApi from "../../features/session/sessions.api";
import sessionSidecarApi from "../../features/session/sidecar.api";
import startSessionSlice from "../../features/session/startSession.slice";
import { startSessionOptionsSlice } from "../../features/session/startSessionOptionsSlice";
import { sessionLaunchersV2EmptyApi as sessionLaunchersV2Api } from "../../features/sessionsV2/api/sessionLaunchersV2.empty-api";
import { sessionsV2EmptyApi as sessionsV2Api } from "../../features/sessionsV2/api/sessionsV2.empty-api";
import startSessionOptionsV2Slice from "../../features/sessionsV2/startSessionOptionsV2.slice";
import termsApi from "../../features/terms/terms.api";
import { usersEmptyApi as usersApi } from "../../features/usersV2/api/users.empty-api";
import { versionsApi } from "../../features/versions/versions.api";
import { workflowsApi } from "../../features/workflows/WorkflowsApi";
import { workflowsSlice } from "../../features/workflows/WorkflowsSlice";
import featureFlagsSlice from "../feature-flags/featureFlags.slice";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStore = <S = any, A extends Action = AnyAction>(
  renkuStateModelReducer: ReducersMapObject<S, A>,
  enhancers: StoreEnhancer[] | undefined = undefined
) => {
  const enhancedReducer = {
    ...renkuStateModelReducer,
    // Slices
    [dataConnectorFormSlice.name]: dataConnectorFormSlice.reducer,
    [datasetFormSlice.name]: datasetFormSlice.reducer,
    [displaySlice.name]: displaySlice.reducer,
    [featureFlagsSlice.name]: featureFlagsSlice.reducer,
    [kgInactiveProjectsSlice.name]: kgInactiveProjectsSlice.reducer,
    [searchV2Slice.name]: searchV2Slice.reducer,
    [startSessionOptionsSlice.name]: startSessionOptionsSlice.reducer,
    [startSessionOptionsV2Slice.name]: startSessionOptionsV2Slice.reducer,
    [startSessionSlice.name]: startSessionSlice.reducer,
    [workflowsSlice.name]: workflowsSlice.reducer,
    // APIs
    [adminKeycloakApi.reducerPath]: adminKeycloakApi.reducer,
    [computeResourcesApi.reducerPath]: computeResourcesApi.reducer,
    [connectedServicesApi.reducerPath]: connectedServicesApi.reducer,
    [dataConnectorsApi.reducerPath]: dataConnectorsApi.reducer,
    [datasetsCoreApi.reducerPath]: datasetsCoreApi.reducer,
    [doiResolverApi.reducerPath]: doiResolverApi.reducer,
    [inactiveKgProjectsApi.reducerPath]: inactiveKgProjectsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [platformApi.reducerPath]: platformApi.reducer,
    [projectCloudStorageApi.reducerPath]: projectCloudStorageApi.reducer,
    [projectCoreApi.reducerPath]: projectCoreApi.reducer,
    [projectGitLabApi.reducerPath]: projectGitLabApi.reducer,
    [projectKgApi.reducerPath]: projectKgApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [projectV2Api.reducerPath]: projectV2Api.reducer,
    [recentUserActivityApi.reducerPath]: recentUserActivityApi.reducer,
    [repositoriesApi.reducerPath]: repositoriesApi.reducer,
    [searchV2Api.reducerPath]: searchV2Api.reducer,
    [sessionLaunchersV2Api.reducerPath]: sessionLaunchersV2Api.reducer,
    [sessionsApi.reducerPath]: sessionsApi.reducer,
    [sessionSidecarApi.reducerPath]: sessionSidecarApi.reducer,
    [sessionsV2Api.reducerPath]: sessionsV2Api.reducer,
    [statuspageApi.reducerPath]: statuspageApi.reducer,
    [termsApi.reducerPath]: termsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
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
        .concat(adminKeycloakApi.middleware)
        .concat(computeResourcesApi.middleware)
        .concat(connectedServicesApi.middleware)
        .concat(dataConnectorsApi.middleware)
        .concat(datasetsCoreApi.middleware)
        .concat(doiResolverApi.middleware)
        .concat(inactiveKgProjectsApi.middleware)
        .concat(notificationsApi.middleware)
        .concat(platformApi.middleware)
        .concat(projectCloudStorageApi.middleware)
        .concat(projectCoreApi.middleware)
        .concat(projectGitLabApi.middleware)
        .concat(projectKgApi.middleware)
        .concat(projectsApi.middleware)
        .concat(projectV2Api.middleware)
        .concat(recentUserActivityApi.middleware)
        .concat(repositoriesApi.middleware)
        .concat(searchV2Api.middleware)
        .concat(sessionLaunchersV2Api.middleware)
        .concat(sessionsApi.middleware)
        .concat(sessionSidecarApi.middleware)
        .concat(sessionsV2Api.middleware)
        .concat(statuspageApi.middleware)
        .concat(termsApi.middleware)
        .concat(usersApi.middleware)
        .concat(versionsApi.middleware)
        .concat(workflowsApi.middleware),
    enhancers: (getDefaultEnhancers) =>
      enhancers
        ? getDefaultEnhancers().concat(enhancers)
        : getDefaultEnhancers(),
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
