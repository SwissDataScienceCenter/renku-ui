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
 * limitations under the License
 */

import { Card, CardBody, CardText, CardTitle } from "reactstrap";
import cx from "classnames";

import PageLoader from "../../components/PageLoader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import connectedServicesApi, {
  useGetConnectedAccountQuery,
  useGetConnectionsQuery,
  useGetProvidersQuery,
} from "./connectedServices.api";
import {
  Connection,
  ConnectionStatus,
  Provider,
} from "./connectedServices.types";
import { useMemo } from "react";
import { Loader } from "../../components/Loader";
import { ExternalLink } from "../../components/ExternalLinks";

export default function ConnectedServicesPage() {
  const {
    data: providers,
    isLoading: isLoadingProviders,
    error: providersError,
  } = useGetProvidersQuery();
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
  } = useGetConnectionsQuery();

  const isLoading = isLoadingProviders || isLoadingConnections;
  const error = providersError || connectionsError;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div>
        <RtkErrorAlert error={error} dismissible={false} />
      </div>
    );
  }

  if (providers == null || providers.length == 0) {
    return (
      <>
        <h1>Connected Services</h1>
        <p>There are currently no external services users can connect to.</p>
      </>
    );
  }

  return (
    <>
      <h1>Connected Services</h1>
      <div>
        {providers.map((provider) => (
          <ConnectedServiceCard key={provider.id} provider={provider} />
        ))}
      </div>
      <div className="mt-3">
        <pre>{JSON.stringify(providers, null, 2)}</pre>
        <pre>{JSON.stringify(connections, null, 2)}</pre>
      </div>
    </>
  );
}

interface ConnectedServiceCardProps {
  provider: Provider;
}

function ConnectedServiceCard({ provider }: ConnectedServiceCardProps) {
  const { id, display_name } = provider;

  const { data: connections } =
    connectedServicesApi.endpoints.getConnections.useQueryState();

  const connection = useMemo(
    () => connections?.find(({ provider_id }) => provider_id === id),
    [connections, id]
  );
  const status =
    connection?.status === "connected"
      ? "connected"
      : connection?.status === "pending"
      ? "pending"
      : "not-connected";

  return (
    <Card>
      <CardBody>
        <CardTitle>
          <div className={cx("d-flex", "align-items-center")}>
            {display_name}
            <ConnectButton id={id} connectionStatus={connection?.status} />
          </div>
        </CardTitle>
        <CardText>Status: {status}</CardText>
        {connection?.status === "connected" && (
          <ConnectedAccount connection={connection} />
        )}
      </CardBody>
    </Card>
  );
}

interface ConnectButtonParams {
  id: string;
  connectionStatus?: ConnectionStatus;
}

function ConnectButton({ id, connectionStatus }: ConnectButtonParams) {
  const hereUrl = window.location.href;

  const authorizeUrl = `/ui-server/api/data/oauth2/providers/${id}/authorize`;
  const url = `${authorizeUrl}?next=${encodeURIComponent(hereUrl)}`;

  const text = connectionStatus === "connected" ? "Reconnect" : "Connect";

  return (
    <a className={cx("ms-auto", "btn", "btn-secondary")} href={url}>
      {text}
    </a>
  );
}

interface ConnectedAccountProps {
  connection: Connection;
}

function ConnectedAccount({ connection }: ConnectedAccountProps) {
  const {
    data: account,
    isLoading,
    error,
  } = useGetConnectedAccountQuery({ connectionId: connection.id });

  if (isLoading) {
    return (
      <CardText>
        <Loader inline className="me-1" size={16} />
        Checking connected account...
      </CardText>
    );
  }

  if (error) {
    return <RtkErrorAlert error={error} dismissible={false} />;
  }

  if (account == null) {
    return <CardText>Error: could not find connected account.</CardText>;
  }

  const text = `@${account.username}`;

  return (
    <CardText>
      Account: <ExternalLink url={account.web_url}>{text}</ExternalLink>
    </CardText>
  );
}
