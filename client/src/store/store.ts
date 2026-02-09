/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import adminKeycloakApi from "~/features/admin/adminKeycloak.api";
import { projectCloudStorageEmptyApi as projectCloudStorageApi } from "~/features/cloudStorage/api/projectCloudStorage.empty-api";
import { connectedServicesEmptyApi as connectedServicesApi } from "~/features/connectedServices/api/connectedServices.empty-api";
import { dataConnectorsEmptyApi as dataConnectorsApi } from "~/features/dataConnectorsV2/api/data-connectors.empty-api";
import { doiResolverEmptyApi as doiResolverApi } from "~/features/dataConnectorsV2/api/doiResolver.empty-api";
import dataConnectorFormSlice from "~/features/dataConnectorsV2/state/dataConnectors.slice";
import { displaySlice } from "~/features/display";
import { loginStateSlice } from "~/features/loginHandler/loginState.slice";
import { notificationsEmptyApi as notificationsApi } from "~/features/notifications/api/notifications.empty-api";
import { platformEmptyApi as platformApi } from "~/features/platform/api/platform-empty.api";
import { statuspageEmptyApi as statuspageApi } from "~/features/platform/statuspage-api/statuspage-empty.api";
import { projectsApi } from "~/features/projects/projects.api";
import { projectV2EmptyApi as projectV2Api } from "~/features/projectsV2/api/projectV2-empty.api";
import { recentUserActivityApi } from "~/features/recentUserActivity/RecentUserActivityApi";
import { repositoriesEmptyApi as repositoriesApi } from "~/features/repositories/api/repositories.empty-api";
import { searchV2EmptyApi as searchV2Api } from "~/features/searchV2/api/searchV2-empty.api";
import { searchV2Slice } from "~/features/searchV2/searchV2.slice";
import { computeResourcesEmptyApi as computeResourcesApi } from "~/features/sessionsV2/api/computeResources.empty-api";
import { sessionLaunchersV2EmptyApi as sessionLaunchersV2Api } from "~/features/sessionsV2/api/sessionLaunchersV2.empty-api";
import { sessionsV2EmptyApi as sessionsV2Api } from "~/features/sessionsV2/api/sessionsV2.empty-api";
import startSessionOptionsV2Slice from "~/features/sessionsV2/startSessionOptionsV2.slice";
import termsApi from "~/features/terms/terms.api";
import { usersEmptyApi as usersApi } from "~/features/usersV2/api/users.empty-api";
import { versionsApi } from "~/features/versions/versions.api";
import { workflowsApi } from "~/features/workflows/WorkflowsApi";
import { workflowsSlice } from "~/features/workflows/WorkflowsSlice";
import featureFlagsSlice from "~/utils/feature-flags/featureFlags.slice";

export const store = configureStore({
  reducer: {
    // Slices
    [dataConnectorFormSlice.name]: dataConnectorFormSlice.reducer,
    [displaySlice.name]: displaySlice.reducer,
    [featureFlagsSlice.name]: featureFlagsSlice.reducer,
    [loginStateSlice.name]: loginStateSlice.reducer,
    [searchV2Slice.name]: searchV2Slice.reducer,
    [startSessionOptionsV2Slice.name]: startSessionOptionsV2Slice.reducer,
    [workflowsSlice.name]: workflowsSlice.reducer,
    // APIs
    [adminKeycloakApi.reducerPath]: adminKeycloakApi.reducer,
    [computeResourcesApi.reducerPath]: computeResourcesApi.reducer,
    [connectedServicesApi.reducerPath]: connectedServicesApi.reducer,
    [dataConnectorsApi.reducerPath]: dataConnectorsApi.reducer,
    [doiResolverApi.reducerPath]: doiResolverApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [platformApi.reducerPath]: platformApi.reducer,
    [projectCloudStorageApi.reducerPath]: projectCloudStorageApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [projectV2Api.reducerPath]: projectV2Api.reducer,
    [recentUserActivityApi.reducerPath]: recentUserActivityApi.reducer,
    [repositoriesApi.reducerPath]: repositoriesApi.reducer,
    [searchV2Api.reducerPath]: searchV2Api.reducer,
    [sessionLaunchersV2Api.reducerPath]: sessionLaunchersV2Api.reducer,
    [sessionsV2Api.reducerPath]: sessionsV2Api.reducer,
    [statuspageApi.reducerPath]: statuspageApi.reducer,
    [termsApi.reducerPath]: termsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [versionsApi.reducerPath]: versionsApi.reducer,
    [workflowsApi.reducerPath]: workflowsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(adminKeycloakApi.middleware)
      .concat(computeResourcesApi.middleware)
      .concat(connectedServicesApi.middleware)
      .concat(dataConnectorsApi.middleware)
      .concat(doiResolverApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(platformApi.middleware)
      .concat(projectCloudStorageApi.middleware)
      .concat(projectsApi.middleware)
      .concat(projectV2Api.middleware)
      .concat(recentUserActivityApi.middleware)
      .concat(repositoriesApi.middleware)
      .concat(searchV2Api.middleware)
      .concat(sessionLaunchersV2Api.middleware)
      .concat(sessionsV2Api.middleware)
      .concat(statuspageApi.middleware)
      .concat(termsApi.middleware)
      .concat(usersApi.middleware)
      .concat(versionsApi.middleware)
      .concat(workflowsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
