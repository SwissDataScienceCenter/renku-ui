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
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router";

import { connectedServicesApi } from "./api/connectedServices.api";
import type { Provider } from "./api/connectedServices.api";
import {
  OAUTH_CONNECT_POLLING_INTERVAL_MS,
  OAUTH_CONNECT_POLLING_TIMEOUT_MS,
} from "./connectedServices.constants";
import { buildOAuthAuthorizeUrl } from "./oauthComplete.utils";

export function useOAuthProviderConnect(
  provider: Provider | null | undefined,
  options?: {
    includeSource?: boolean;
    onConnected?: () => void;
  }
) {
  const { pathname, hash } = useLocation();
  const source =
    options?.includeSource === true ? `${pathname}${hash}` : undefined;

  const authorizeHref = useMemo(
    () => (provider ? buildOAuthAuthorizeUrl(provider, source) : null),
    [provider, source]
  );

  const providerId = provider?.id;
  const [isPolling, setIsPolling] = useState(false);

  const onConnectedRef = useRef(options?.onConnected);
  useEffect(() => {
    onConnectedRef.current = options?.onConnected;
  }, [options?.onConnected]);

  connectedServicesApi.endpoints.getOauth2Connections.useQuerySubscription(
    isPolling ? undefined : skipToken,
    { pollingInterval: OAUTH_CONNECT_POLLING_INTERVAL_MS }
  );

  const { data: connections } =
    connectedServicesApi.endpoints.getOauth2Connections.useQueryState();

  useEffect(() => {
    if (!isPolling || !providerId) return;
    const connected = connections?.some(
      ({ provider_id, status }) =>
        provider_id === providerId && status === "connected"
    );
    if (connected) {
      startTransition(() => {
        setIsPolling(false);
      });
      onConnectedRef.current?.();
    }
  }, [connections, isPolling, providerId]);

  useEffect(() => {
    if (!isPolling) return;
    const t = window.setTimeout(() => {
      setIsPolling(false);
    }, OAUTH_CONNECT_POLLING_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [isPolling]);

  const startConnect = useCallback(() => {
    if (!authorizeHref) return;
    window.open(authorizeHref, "_blank", "noopener,noreferrer");
    setIsPolling(true);
  }, [authorizeHref]);

  return { authorizeHref, startConnect, isPolling };
}
