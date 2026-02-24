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

import toastSlice from "~/components/toast/toast.slice";
import adminKeycloakApi from "~/features/admin/adminKeycloak.api";
import { projectCloudStorageEmptyApi as projectCloudStorageApi } from "~/features/cloudStorage/api/projectCloudStorage.empty-api";
import { connectedServicesEmptyApi as connectedServicesApi } from "~/features/connectedServices/api/connectedServices.empty-api";
import { dataConnectorsApi } from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { doiResolverEmptyApi as doiResolverApi } from "~/features/dataConnectorsV2/api/doiResolver.empty-api";
import dataConnectorFormSlice from "~/features/dataConnectorsV2/state/dataConnectors.slice";
import { displaySlice } from "~/features/display/displaySlice";
import { loginStateSlice } from "~/features/loginHandler/loginState.slice";
import { notificationsEmptyApi as notificationsApi } from "~/features/notifications/api/notifications.empty-api";
import { platformEmptyApi as platformApi } from "~/features/platform/api/platform-empty.api";
import { statuspageEmptyApi as statuspageApi } from "~/features/platform/statuspage-api/statuspage-empty.api";
import { projectV2Api } from "~/features/projectsV2/api/projectV2.enhanced-api";
import { recentUserActivityApi } from "~/features/recentUserActivity/RecentUserActivityApi";
import { repositoriesApi } from "~/features/repositories/api/repositories.api";
import { searchV2EmptyApi as searchV2Api } from "~/features/searchV2/api/searchV2-empty.api";
import { searchV2Slice } from "~/features/searchV2/searchV2.slice";
import { computeResourcesEmptyApi as computeResourcesApi } from "~/features/sessionsV2/api/computeResources.empty-api";
import { sessionLaunchersV2EmptyApi as sessionLaunchersV2Api } from "~/features/sessionsV2/api/sessionLaunchersV2.empty-api";
import { sessionsV2EmptyApi as sessionsV2Api } from "~/features/sessionsV2/api/sessionsV2.empty-api";
import startSessionOptionsV2Slice from "~/features/sessionsV2/startSessionOptionsV2.slice";
import termsApi from "~/features/terms/terms.api";
import { usersEmptyApi as usersApi } from "~/features/usersV2/api/users.empty-api";
import { versionsApi } from "~/features/versions/versions.api";
import featureFlagsSlice from "~/utils/feature-flags/featureFlags.slice";
import webSocketSlice from "~/websocket/webSocket.slice";

export const store = configureStore({
  reducer: {
    // Slices
    [dataConnectorFormSlice.name]: dataConnectorFormSlice.reducer,
    [displaySlice.name]: displaySlice.reducer,
    [featureFlagsSlice.name]: featureFlagsSlice.reducer,
    [loginStateSlice.name]: loginStateSlice.reducer,
    [startSessionOptionsV2Slice.name]: startSessionOptionsV2Slice.reducer,
    [searchV2Slice.name]: searchV2Slice.reducer,
    [webSocketSlice.name]: webSocketSlice.reducer,
    [toastSlice.name]: toastSlice.reducer,
    // APIs
    [adminKeycloakApi.reducerPath]: adminKeycloakApi.reducer,
    [computeResourcesApi.reducerPath]: computeResourcesApi.reducer,
    [connectedServicesApi.reducerPath]: connectedServicesApi.reducer,
    [dataConnectorsApi.reducerPath]: dataConnectorsApi.reducer,
    [doiResolverApi.reducerPath]: doiResolverApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [platformApi.reducerPath]: platformApi.reducer,
    [projectCloudStorageApi.reducerPath]: projectCloudStorageApi.reducer,
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
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    })
      .concat(adminKeycloakApi.middleware)
      .concat(computeResourcesApi.middleware)
      .concat(connectedServicesApi.middleware)
      .concat(dataConnectorsApi.middleware)
      .concat(doiResolverApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(platformApi.middleware)
      .concat(projectCloudStorageApi.middleware)
      .concat(projectV2Api.middleware)
      .concat(recentUserActivityApi.middleware)
      .concat(repositoriesApi.middleware)
      .concat(searchV2Api.middleware)
      .concat(sessionLaunchersV2Api.middleware)
      .concat(sessionsV2Api.middleware)
      .concat(statuspageApi.middleware)
      .concat(termsApi.middleware)
      .concat(usersApi.middleware)
      .concat(versionsApi.middleware),
});

export type StoreType = typeof store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
