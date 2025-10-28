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

import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { DEFAULT_PERMISSIONS } from "../../permissionsV2/permissions.constants";
import type { Permissions } from "../../permissionsV2/permissions.types";
import {
  dataConnectorsApi,
  useGetDataConnectorsByDataConnectorIdPermissionsQuery,
} from "../api/data-connectors.enhanced-api";

interface UseDataConnectorPermissionsArgs {
  dataConnectorId: string;
}
type UseQueryStateResult = ReturnType<
  typeof useGetDataConnectorsByDataConnectorIdPermissionsQuery
>;
type Result = Omit<UseQueryStateResult, "data" | "currentData"> & {
  permissions: Permissions;
};

export default function useDataConnectorPermissions({
  dataConnectorId,
}: UseDataConnectorPermissionsArgs): Result {
  const { currentData, isLoading, isError, isUninitialized, ...result } =
    dataConnectorsApi.endpoints.getDataConnectorsByDataConnectorIdPermissions.useQueryState(
      dataConnectorId ? { dataConnectorId } : skipToken
    );
  const [fetchPermissions] =
    dataConnectorsApi.endpoints.getDataConnectorsByDataConnectorIdPermissions.useLazyQuery();

  useEffect(() => {
    if (dataConnectorId && isUninitialized) {
      fetchPermissions({ dataConnectorId });
    }
  }, [dataConnectorId, fetchPermissions, isUninitialized]);

  if (isLoading || isError || !currentData) {
    return {
      permissions: DEFAULT_PERMISSIONS,
      isLoading,
      isError,
      isUninitialized,
      ...result,
    };
  }

  const permissions: Permissions = {
    ...DEFAULT_PERMISSIONS,
    ...currentData,
  };
  return { permissions, isLoading, isError, isUninitialized, ...result };
}
