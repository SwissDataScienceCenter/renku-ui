/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  getSchemaProviders,
  hasProviderShortlist,
} from "~/features/cloudStorage/projectCloudStorage.utils";
import { EMPTY_CLOUD_STORAGE_STATE } from "../../cloudStorage/projectCloudStorage.constants";
import {
  AddCloudStorageState,
  CloudStorageSchema,
} from "../../cloudStorage/projectCloudStorage.types";
import {
  EMPTY_DATA_CONNECTOR_FLAT,
  type DataConnectorFlat,
} from "../components/dataConnector.utils";
import type { AuxiliaryCommandStatus } from "../components/DataConnectorModal/DataConnectorModalResult";

interface BackendResult {
  isSuccess: boolean | undefined;
  isError: boolean | undefined;
  error: FetchBaseQueryError | SerializedError | null | undefined;
}

const initialState = {
  cloudStorageState: EMPTY_CLOUD_STORAGE_STATE,
  credentialSaveStatus: "none" as AuxiliaryCommandStatus,
  dataConnectorResultId: undefined as string | undefined,
  dataConnectorResultName: undefined as string | undefined,
  flatDataConnector: EMPTY_DATA_CONNECTOR_FLAT,
  isActionOngoing: false,
  projectLinkStatus: "none" as AuxiliaryCommandStatus,
  schemata: [] as CloudStorageSchema[],
  success: false,
  validationResult: null as BackendResult | null,
  validationResultIsCurrent: true,
};

const dataConnectorFormSlice = createSlice({
  name: "dataConnectorFormSlice",
  initialState,
  reducers: {
    initializeCloudStorageState: (
      state,
      action: PayloadAction<{
        cloudStorageState: AddCloudStorageState;
        flatDataConnector: DataConnectorFlat;
        schemata: CloudStorageSchema[];
      }>
    ) => {
      state.cloudStorageState = action.payload.cloudStorageState;
      state.flatDataConnector = action.payload.flatDataConnector;
      state.schemata = action.payload.schemata;
    },
    reset: (
      state,
      action: PayloadAction<{
        flatDataConnector: DataConnectorFlat;
        hasDataConnector: boolean;
      }>
    ) => {
      // flatDataConnector is the same as the one in the initial state in this case
      if (!action.payload.hasDataConnector) {
        const flatDataConnector = {
          ...initialState.flatDataConnector,
          namespace: state.flatDataConnector.namespace,
        };
        return { ...initialState, schemata: state.schemata, flatDataConnector };
      }
      state.cloudStorageState = {
        ...initialState.cloudStorageState,
        step: state.cloudStorageState.step,
        completedSteps: state.cloudStorageState.completedSteps,
      };
      state.credentialSaveStatus = initialState.credentialSaveStatus;
      state.flatDataConnector = action.payload.flatDataConnector;
      state.projectLinkStatus = initialState.projectLinkStatus;
      state.validationResult = null;
    },
    resetTransientState: (state) => {
      // If the data connector was created/updated reset everything
      if (state.success) return initialState;
      // Otherwise, just reset the transient state
      state.credentialSaveStatus = initialState.credentialSaveStatus;
      state.projectLinkStatus = initialState.projectLinkStatus;
      state.validationResult = null;
    },
    setActionOngoing: (
      state,
      action: PayloadAction<{ isActionOngoing: boolean }>
    ) => {
      state.isActionOngoing = action.payload.isActionOngoing;
    },
    setCloudStorageState: (
      state,
      action: PayloadAction<{
        cloudStorageState: Partial<AddCloudStorageState>;
        validationResult?: null | undefined;
      }>
    ) => {
      const schemata = state.schemata;
      const fullNewState = {
        ...state.cloudStorageState,
        ...action.payload.cloudStorageState,
      };

      // Handle advanced mode changes
      if (
        fullNewState.advancedMode !== state.cloudStorageState.advancedMode &&
        fullNewState.step !== 3
      ) {
        if (fullNewState.advancedMode) {
          fullNewState.step = 0;
        } else {
          if (
            // schema and provider (where necessary) must also exist in the list
            !state.flatDataConnector.schema ||
            !schemata?.find(
              (s) => s.prefix === state.flatDataConnector.schema
            ) ||
            (hasProviderShortlist(state.flatDataConnector.schema) &&
              (!state.flatDataConnector.provider ||
                !getSchemaProviders(
                  schemata,
                  false,
                  state.flatDataConnector.schema
                )?.find((p) => p.name === state.flatDataConnector.provider)))
          ) {
            fullNewState.step = 1;
          } else {
            fullNewState.step = 2;
          }
        }
      }
      state.cloudStorageState = fullNewState;
      if (action.payload.validationResult !== undefined) {
        state.validationResult = null;
      }
    },
    setCredentialSaveStatus: (
      state,
      action: PayloadAction<{ credentialSaveStatus: AuxiliaryCommandStatus }>
    ) => {
      state.credentialSaveStatus = action.payload.credentialSaveStatus;
    },
    setFlatDataConnector: (
      state,
      action: PayloadAction<{
        flatDataConnector: Partial<DataConnectorFlat>;
        validationSucceeded?: boolean | null;
      }>
    ) => {
      const fullNewDetails = {
        ...state.flatDataConnector,
        ...action.payload.flatDataConnector,
      };
      // reset follow-up properties: schema > provider > options
      if (fullNewDetails.schema !== state.flatDataConnector.schema) {
        fullNewDetails.provider = undefined;
        fullNewDetails.options = undefined;
        fullNewDetails.sourcePath = undefined;
        state.validationResult = null;
      } else if (fullNewDetails.provider !== state.flatDataConnector.provider) {
        fullNewDetails.options = undefined;
        fullNewDetails.sourcePath = undefined;
        state.validationResult = null;
      }
      state.flatDataConnector = fullNewDetails;
      if (
        action.payload.validationSucceeded !== undefined ||
        fullNewDetails.sourcePath !== fullNewDetails.sourcePath
      ) {
        state.validationResult = null;
        state.validationResultIsCurrent = false;
      }
    },
    setProjectLinkStatus: (
      state,
      action: PayloadAction<{ projectLinkStatus: AuxiliaryCommandStatus }>
    ) => {
      state.projectLinkStatus = action.payload.projectLinkStatus;
    },
    setSuccess: (
      state,
      action: PayloadAction<{
        success: boolean;
        dataConnectorResultId: string | undefined;
        dataConnectorResultName: string | undefined;
      }>
    ) => {
      state.success = action.payload.success;
      state.dataConnectorResultName = action.payload.dataConnectorResultName;
      state.dataConnectorResultId = action.payload.dataConnectorResultId;
    },
    setValidationResult: (
      state,
      action: PayloadAction<{
        validationResult: BackendResult | null;
        isActionOngoing?: boolean;
      }>
    ) => {
      state.validationResult = action.payload.validationResult;
      state.validationResultIsCurrent = true;
      if (action.payload.isActionOngoing !== undefined) {
        state.isActionOngoing = action.payload.isActionOngoing;
      }
    },
  },
});

export default dataConnectorFormSlice;
