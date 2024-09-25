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

import cx from "classnames";
import { Card, CardBody, CardText, CardTitle } from "reactstrap";

import { useMemo } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import PageLoader from "../../components/PageLoader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
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

export default function ConnectedServicesPage() {
  const {
    data: providers,
    isLoading: isLoadingProviders,
    error: providersError,
  } = useGetProvidersQuery();
  const { isLoading: isLoadingConnections, error: connectionsError } =
    useGetConnectionsQuery();

  const isLoading = isLoadingProviders || isLoadingConnections;
  const error = providersError || connectionsError;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div>
        <RtkOrNotebooksError error={error} dismissible={false} />
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
      <div className={cx("row", "g-3")}>
        {providers.map((provider) => (
          <ConnectedServiceCard key={provider.id} provider={provider} />
        ))}
      </div>
    </>
  );
}

interface ConnectedServiceCardProps {
  provider: Provider;
}

function ConnectedServiceCard({ provider }: ConnectedServiceCardProps) {
  const { id, display_name, url } = provider;

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
      : "not connected";

  return (
    <div className={cx("col-12", "col-lg-6")}>
      <Card className="h-100">
        <CardBody>
          <CardTitle>
            <div className={cx("d-flex", "flex-wrap", "align-items-center")}>
              <span className="pe-2">{display_name}</span>
              <ConnectButton connectionStatus={connection?.status} id={id} />
            </div>
          </CardTitle>
          <CardText className="mb-1">
            <ExternalLink url={url} role="text">
              <BoxArrowUpRight className={cx("bi", "me-1")} />
              {url}
            </ExternalLink>
          </CardText>
          <CardText className="mb-1">Status: {status}</CardText>
          {connection?.status === "connected" && (
            <ConnectedAccount connection={connection} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

interface ConnectButtonParams {
  connectionStatus?: ConnectionStatus;
  id: string;
}

function ConnectButton({ connectionStatus, id }: ConnectButtonParams) {
  const hereUrl = window.location.href;

  const authorizeUrl = `/ui-server/api/data/oauth2/providers/${id}/authorize`;
  const url = `${authorizeUrl}?next_url=${encodeURIComponent(hereUrl)}`;

  const text = connectionStatus === "connected" ? "Reconnect" : "Connect";
  const color =
    connectionStatus === "connected" ? "btn-outline-primary" : "btn-primary";

  return (
    <a className={cx(color, "btn", "btn-secondary", "ms-auto")} href={url}>
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
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (account == null) {
    return <CardText>Error: could not find connected account.</CardText>;
  }

  const text = `@${account.username}`;

  return (
    <CardText>
      Account:{" "}
      <ExternalLink role="text" url={account.web_url}>
        {text}
      </ExternalLink>
    </CardText>
  );
}
