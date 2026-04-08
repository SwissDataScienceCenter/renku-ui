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

import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router";

import {
  connectedServicesApi,
  useGetOauth2ConnectionsQuery,
  useGetOauth2ProvidersQuery,
  type Connection,
  type Provider,
} from "./api/connectedServices.api";
import {
  CHECK_STATUS_QUERY_PARAM,
  OAUTH_CONNECT_POLLING_INTERVAL_MS,
} from "./connectedServices.constants";

export interface GithubOAuthCompleteFollowUpData {
  checkId: string | null;
  provider: Provider | undefined;
  connection: Connection | undefined;
  skipData: boolean;
  isGithubAppFollowUp: boolean;
  isLoadingProviders: boolean;
  isLoadingConnections: boolean;
}

export function useGithubOAuthCompleteFollowUpData(): GithubOAuthCompleteFollowUpData {
  const [searchParams] = useSearchParams();
  const checkId = searchParams.get(CHECK_STATUS_QUERY_PARAM);

  const { data: providers, isLoading: isLoadingProviders } =
    useGetOauth2ProvidersQuery();
  const { data: connections, isLoading: isLoadingConnections } =
    useGetOauth2ConnectionsQuery();

  const provider = providers?.find((p) => p.id === checkId);
  const hasRegistry = !!provider?.image_registry_url;
  const isGithubAppFollowUp =
    !!checkId && !!provider && provider.kind === "github" && !hasRegistry;

  const hasGithubConnection =
    !!checkId &&
    !!connections?.some(
      (c) => c.provider_id === checkId && c.status === "connected"
    );

  connectedServicesApi.endpoints.getOauth2Connections.useQuerySubscription(
    isGithubAppFollowUp && !hasGithubConnection ? undefined : skipToken,
    { pollingInterval: OAUTH_CONNECT_POLLING_INTERVAL_MS }
  );

  const connection = connections?.find(
    (c) => c.provider_id === checkId && c.status === "connected"
  );

  const skipData =
    !checkId ||
    !provider ||
    provider.kind !== "github" ||
    hasRegistry ||
    !connection;

  return {
    checkId,
    provider,
    connection,
    skipData,
    isGithubAppFollowUp,
    isLoadingProviders,
    isLoadingConnections,
  };
}

/**
 * Whether the OAuth success page may auto-close: skip when a GitHub app
 * follow-up might still run (same `skipData` semantics as the follow-up
 * component), and while provider/connection queries are still loading.
 */
export function deriveOAuthCompleteSuccessAutoClose(
  hasError: boolean,
  data: GithubOAuthCompleteFollowUpData
): boolean {
  const {
    checkId,
    skipData,
    isGithubAppFollowUp,
    isLoadingProviders,
    isLoadingConnections,
  } = data;

  if (hasError) return false;
  if (!checkId) return true;
  if (isLoadingProviders || isLoadingConnections) return false;
  if (!isGithubAppFollowUp) return true;
  return skipData;
}
