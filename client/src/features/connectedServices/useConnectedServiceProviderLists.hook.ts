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

import { useMemo } from "react";

import type { Connection, Provider } from "./api/connectedServices.api";

export type ProviderWithConnection = {
  provider: Provider;
  connection?: Connection;
};

interface UseConnectedServiceProviderListsArgs {
  providers?: Provider[];
  connections?: Connection[];
  targetProviderId: string | null;
}

export function useConnectedServiceProviderLists({
  providers,
  connections,
  targetProviderId,
}: UseConnectedServiceProviderListsArgs) {
  const targetProvider = useMemo(
    () => providers?.find((provider) => provider.id === targetProviderId),
    [providers, targetProviderId]
  );
  const sortedProviders = useMemo(() => {
    if (!providers) return [];
    if (!targetProvider) return providers;
    return [targetProvider, ...providers.filter((p) => p !== targetProvider)];
  }, [providers, targetProvider]);
  const providersWithConnection = useMemo<ProviderWithConnection[]>(
    () =>
      sortedProviders.map((provider) => ({
        provider,
        connection: connections?.find(
          ({ provider_id }) => provider_id === provider.id
        ),
      })),
    [connections, sortedProviders]
  );
  const mainListProviders = useMemo(
    () =>
      providersWithConnection.filter(
        ({ connection }) =>
          connection?.status === "connected" || connection?.status === "pending"
      ),
    [providersWithConnection]
  );
  const modalProviders = useMemo(
    () =>
      providersWithConnection.filter(({ connection }) => connection == null),
    [providersWithConnection]
  );

  return { mainListProviders, modalProviders };
}
