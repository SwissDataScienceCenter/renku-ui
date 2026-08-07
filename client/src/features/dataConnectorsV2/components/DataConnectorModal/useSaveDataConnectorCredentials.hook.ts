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

import { useEffect } from "react";

import {
  CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
} from "~/features/cloudStorage/projectCloudStorage.constants";
import type { CloudStorageDetailsOptions } from "~/features/cloudStorage/projectCloudStorage.types";
import { findSensitive } from "~/features/cloudStorage/projectCloudStorage.utils";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import { usePatchDataConnectorsByDataConnectorIdSecretsMutation } from "../../api/data-connectors.enhanced-api";
import dataConnectorFormSlice from "../../state/dataConnectors.slice";

export default function useSaveDataConnectorCredentials() {
  const dispatch = useAppDispatch();
  const {
    cloudStorageState,
    credentialSaveStatus,
    dataConnectorResultId,
    flatDataConnector,
    schemata,
    validationResult,
  } = useAppSelector((state) => state.dataConnectorFormSlice);
  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();

  useEffect(() => {
    const dataConnectorId = dataConnectorResultId;
    if (dataConnectorId == null) return;
    if (!schemata) return;
    const options = flatDataConnector.options as
      | CloudStorageDetailsOptions
      | undefined;
    if (!options) return;

    const dataConnectorSecretPatchList = buildDataConnectorSecretPatchList(
      findSensitive(
        schemata.find((s) => s.prefix === flatDataConnector.schema),
      ),
      options,
    );
    const shouldSaveCredentials =
      shouldSaveDataConnectorCredentials(
        dataConnectorSecretPatchList,
        cloudStorageState.saveCredentials,
        validationResult?.isSuccess ?? false,
      ) && credentialSaveStatus === "none";
    if (!shouldSaveCredentials) return;

    saveCredentials({
      dataConnectorId,
      dataConnectorSecretPatchList,
    });
  }, [
    cloudStorageState.saveCredentials,
    credentialSaveStatus,
    dataConnectorResultId,
    flatDataConnector.options,
    flatDataConnector.schema,
    saveCredentials,
    schemata,
    validationResult?.isSuccess,
  ]);

  useEffect(() => {
    if (
      credentialSaveStatus === "success" ||
      credentialSaveStatus === "failure"
    ) {
      return;
    }
    const status =
      validationResult?.isSuccess != true
        ? "none"
        : dataConnectorResultId == null || saveCredentialsResult.isUninitialized
          ? "none"
          : saveCredentialsResult.isLoading
            ? "trying"
            : saveCredentialsResult.isSuccess
              ? "success"
              : saveCredentialsResult.isError
                ? "failure"
                : "none";
    dispatch(
      dataConnectorFormSlice.actions.setCredentialSaveStatus({
        credentialSaveStatus: status,
      }),
    );
  }, [
    credentialSaveStatus,
    dataConnectorResultId,
    dispatch,
    saveCredentialsResult,
    validationResult,
  ]);

  return { saveCredentialsResult };
}

function shouldSaveDataConnectorCredentials(
  dataConnectorSecretPatchList: { name: string; value: string }[],
  stateSaveCredentials: boolean,
  validationSucceeded: boolean,
) {
  return !!(
    dataConnectorSecretPatchList.length > 0 &&
    stateSaveCredentials &&
    validationSucceeded
  );
}

function buildDataConnectorSecretPatchList(
  sensitiveFieldNames: string[],
  options: CloudStorageDetailsOptions,
) {
  return sensitiveFieldNames
    .map((name) => ({
      name,
      value: options[name],
    }))
    .filter(
      (secret) =>
        secret.value != undefined &&
        secret.value != "" &&
        secret.value !== CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN &&
        secret.value !== CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE,
    )
    .map((secret) => ({
      name: secret.name,
      value: "" + secret.value,
    }));
}
