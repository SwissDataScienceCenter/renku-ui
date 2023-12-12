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

import { useEffect } from "react";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import { getProvidedSensitiveFields } from "../../../project/utils/projectCloudStorage.utils";
import { NotebooksVersion } from "../../../versions/versions";
import { setError } from "../../startSession.slice";
import { SessionCloudStorage } from "../../startSessionOptions.types";
import { setCloudStorage } from "../../startSessionOptionsSlice";
import { CloudStorage } from "../../../project/components/cloudStorage/projectCloudStorage.types";

interface UseDefaultCloudStorageOptionArgs {
  notebooksVersion: NotebooksVersion | undefined;
  storageForProject: CloudStorage[] | undefined;
}

export default function useDefaultCloudStorageOption({
  notebooksVersion,
  storageForProject,
}: UseDefaultCloudStorageOptionArgs): void {
  const dispatch = useAppDispatch();

  const support = !!notebooksVersion?.cloudStorageEnabled;

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
  support: boolean
): (storageDefinition: CloudStorage) => SessionCloudStorage {
  return ({ storage, sensitive_fields }) => ({
    active: support,
    supported: support,
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
