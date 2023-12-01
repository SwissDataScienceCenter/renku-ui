/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { CloudStorage } from "../../../project/projectCloudStorage.types";
import { getProvidedSensitiveFields } from "../../../project/utils/projectCloudStorage.utils";
import { NotebooksVersion } from "../../../versions/versions.types";
import { setError } from "../../startSession.slice";
import { SessionCloudStorage } from "../../startSessionOptions.types";
import { setCloudStorage } from "../../startSessionOptionsSlice";

interface UseDefaultCloudStorageOptionArgs {
  notebooksVersion: NotebooksVersion | undefined;
  storageForProject: CloudStorage[] | undefined;
}

export default function useDefaultCloudStorageOption({
  notebooksVersion,
  storageForProject,
}: UseDefaultCloudStorageOptionArgs): void {
  const dispatch = useDispatch();

  const support = useMemo(
    () => (notebooksVersion?.cloudStorageEnabled.s3 ? "s3" : "azure"),
    [notebooksVersion?.cloudStorageEnabled]
  );

  // Populate session cloud storage from project's settings
  useEffect(() => {
    if (storageForProject == null) {
      return;
    }

    const initialCloudStorage: SessionCloudStorage[] = storageForProject.map(
      getInitialCloudStorageItem(support)
    );

    const missingCredentialsStorage = initialCloudStorage
      .filter(({ active }) => active)
      .filter(({ configuration, sensitive_fields }) => {
        const providedSensitiveFields =
          getProvidedSensitiveFields(configuration);
        const requiredSensitiveFields = sensitive_fields?.filter(({ name }) =>
          providedSensitiveFields.includes(name)
        );
        return requiredSensitiveFields?.find(({ value }) => !value);
      });
    if (missingCredentialsStorage.length > 0) {
      dispatch(setError({ error: "cloud-storage-credentials" }));
      return;
    }

    dispatch(setCloudStorage(initialCloudStorage));
  }, [dispatch, storageForProject, support]);
}

function getInitialCloudStorageItem(
  support: "s3" | "azure"
): (storageDefinition: CloudStorage) => SessionCloudStorage {
  return ({ storage, sensitive_fields }) => ({
    active:
      (storage.storage_type === "s3" && support === "s3") ||
      (storage.storage_type === "azureblob" && support === "azure"),
    supported:
      (storage.storage_type === "s3" && support === "s3") ||
      (storage.storage_type === "azureblob" && support === "azure"),
    ...(sensitive_fields
      ? {
          sensitive_fields: sensitive_fields.map(({ name, ...rest }) => ({
            ...rest,
            name,
            value: "",
          })),
        }
      : {}),
    ...storage,
  });
}
