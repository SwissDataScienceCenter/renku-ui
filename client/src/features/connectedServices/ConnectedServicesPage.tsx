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
import { useCallback, useEffect, useMemo, useState } from "react";
import { BoxArrowUpRight, CircleFill, XLg } from "react-bootstrap-icons";
import { useSearchParams } from "react-router-dom-v5-compat";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { skipToken } from "@reduxjs/toolkit/query";

import { InfoAlert, WarnAlert } from "../../components/Alert";
import { ExternalLink } from "../../components/ExternalLinks";
import { Loader } from "../../components/Loader";
import PageLoader from "../../components/PageLoader";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import { safeNewUrl } from "../../utils/helpers/safeNewUrl.utils";
import {
  connectedServicesApi,
  useGetOauth2ConnectionsByConnectionIdAccountQuery,
  useGetOauth2ConnectionsByConnectionIdInstallationsQuery,
  useGetOauth2ConnectionsQuery,
  useGetOauth2ProvidersQuery,
  type ConnectedAccount as Account,
  type AppInstallation,
  type Connection,
  type ConnectionStatus,
  type Provider,
  type ProviderKind,
} from "./api/connectedServices.api";
import { AppInstallationsPaginated } from "./api/connectedServices.types";

const CHECK_STATUS_QUERY_PARAM = "check-status";

export default function ConnectedServicesPage() {
  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );

  const {
    data: providers,
    isLoading: isLoadingProviders,
    error: providersError,
  } = useGetOauth2ProvidersQuery(isUserLoggedIn ? undefined : skipToken);
  const { isLoading: isLoadingConnections, error: connectionsError } =
    useGetOauth2ConnectionsQuery(isUserLoggedIn ? undefined : skipToken);

  const isLoading = isLoadingProviders || isLoadingConnections;
  const error = providersError || connectionsError;

  const content = isLoading ? (
    <PageLoader />
  ) : error ? (
    <RtkOrNotebooksError error={error} dismissible={false} />
  ) : !isUserLoggedIn ? (
    <InfoAlert dismissible={false}>
      Anonymous users cannot connect to external services.
    </InfoAlert>
  ) : !providers || providers.length === 0 ? (
    <p>There are currently no external services users can connect to.</p>
  ) : (
    <div className={cx("row", "g-3")}>
      {providers.map((provider) => (
        <ConnectedServiceCard key={provider.id} provider={provider} />
      ))}
    </div>
  );

  return (
    <div data-cy="connected-services-page">
      <h1>Connected services</h1>
      {content}
    </div>
  );
}

interface ConnectedServiceStatusProps {
  connection?: Connection;
}
function ConnectedServiceStatus({ connection }: ConnectedServiceStatusProps) {
  const status =
    connection == null
      ? {
          text: "Not connected",
          classes: [
            "bg-danger-subtle",
            "border-danger",
            "text-danger-emphasis",
          ],
        }
      : connection.status === "connected"
      ? {
          text: "Connected",
          classes: [
            "bg-success-subtle",
            "border-success",
            "text-success-emphasis",
          ],
        }
      : {
          text: "Pending",
          classes: [
            "bg-warning-subtle",
            "border-warning",
            "text-warning-emphasis",
          ],
        };

  return (
    <Badge className={cx("border", ...status.classes)} color="info">
      <CircleFill className={cx("bi", "me-1")} />
      {status.text}
    </Badge>
  );
}

interface ConnectedServiceCardProps {
  provider: Provider;
}

function ConnectedServiceCard({ provider }: ConnectedServiceCardProps) {
  const { id, display_name, kind, url } = provider;

  const { data: connections } =
    connectedServicesApi.endpoints.getOauth2Connections.useQueryState();

  const connection = useMemo(
    () => connections?.find(({ provider_id }) => provider_id === id),
    [connections, id]
  );

  return (
    <div data-cy="connected-services-card" className={cx("col-12", "col-lg-6")}>
      <Card className="h-100">
        <CardBody>
          <CardTitle>
            <div className={cx("d-flex", "flex-wrap", "align-items-center")}>
              <h4 className="pe-2">{display_name}</h4>
              <ConnectButton
                id={id}
                connectionStatus={connection?.status}
                kind={kind}
              />
            </div>
          </CardTitle>
          <CardText>
            URL:{" "}
            <ExternalLink url={url} role="text">
              <BoxArrowUpRight className={cx("bi", "me-1")} />
              {url}
            </ExternalLink>
          </CardText>
          <CardText>
            Status: <ConnectedServiceStatus connection={connection} />
          </CardText>
          {connection?.status === "connected" && (
            <ConnectedAccount connection={connection} />
          )}
          {connection?.status === "connected" && provider.kind == "github" && (
            <GitHubAppInstallations
              connection={connection}
              provider={provider}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

interface ConnectButtonParams {
  connectionStatus?: ConnectionStatus;
  id: string;
  kind?: ProviderKind;
}

function ConnectButton({ id, connectionStatus, kind }: ConnectButtonParams) {
  const hereUrl = useMemo(() => {
    const here = new URL(window.location.href);
    if (kind === "github") {
      here.searchParams.append(CHECK_STATUS_QUERY_PARAM, id);
    }
    return here.href;
  }, [id, kind]);

  const authorizeUrl = `/ui-server/api/data/oauth2/providers/${id}/authorize`;
  const url = `${authorizeUrl}?next_url=${encodeURIComponent(hereUrl)}`;

  const text = connectionStatus === "connected" ? "Reconnect" : "Connect";
  const color =
    connectionStatus === "connected" ? "btn-outline-primary" : "btn-primary";

  return (
    <a className={cx(color, "btn", "ms-auto")} href={url}>
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
  } = useGetOauth2ConnectionsByConnectionIdAccountQuery({
    connectionId: connection.id,
  });

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

interface GitHubAppInstallationsProps {
  connection: Connection;
  provider: Provider;
}

function GitHubAppInstallations({
  connection,
  provider,
}: GitHubAppInstallationsProps) {
  const {
    data: account,
    isLoading: isLoadingAccount,
    error: accountError,
  } = connectedServicesApi.endpoints.getOauth2ConnectionsByConnectionIdAccount.useQueryState(
    {
      connectionId: connection.id,
    }
  );

  const {
    data: installations,
    isFetching: isFetchingInstallations,
    error: installationsError,
    refetch: refetchInstallations,
  } = useGetOauth2ConnectionsByConnectionIdInstallationsQuery({
    connectionId: connection.id,
    params: { per_page: 100 },
  });

  const isLoading = isLoadingAccount || isFetchingInstallations;
  const error = accountError ?? installationsError;

  if (isLoadingAccount) {
    return null;
  }

  if (isLoading) {
    return (
      <CardText>
        <Loader inline className="me-1" size={16} />
        Checking GitHub app installations...
      </CardText>
    );
  }

  if (error) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (account == null || installations == null) {
    return <CardText>Error: could not load app installations.</CardText>;
  }

  const app = provider.app_slug ? (
    <>
      The application <code>{provider.app_slug}</code>
    </>
  ) : (
    "This application"
  );

  const settingsUrl = provider.app_slug
    ? safeNewUrl(
        `apps/${provider.app_slug}/installations/select_target`,
        provider.url
      )
    : null;

  const refreshInstallationsButton = (
    <Button
      color="primary"
      role="button"
      onClick={() => {
        refetchInstallations();
      }}
    >
      Check again
    </Button>
  );

  return (
    <>
      {installations.data?.length ? (
        <>
          <CardText className="mb-1">{app} is installed in:</CardText>
          <ul>
            {installations.data.map((installation) => (
              <GitHubAppInstallationItem
                key={installation.id}
                installation={installation}
              />
            ))}
            {installations.pagination.totalPages > 1 && (
              <li className="fst-italic">and more...</li>
            )}
          </ul>
          {installations.data.every(
            (installation) => !!installation.suspended_at
          ) && (
            <WarnAlert dismissible={false}>
              <p className="mb-2">
                The application is not active for any user or organization.
                Please update the settings.
              </p>
              {refreshInstallationsButton}
            </WarnAlert>
          )}
        </>
      ) : (
        <>
          <CardText>{app} is not installed.</CardText>
          <WarnAlert dismissible={false}>
            <p className="mb-2">
              The application is not installed for any user or organization yet.
              Please update the settings.
            </p>
            {refreshInstallationsButton}
          </WarnAlert>
        </>
      )}

      {settingsUrl && (
        <ExternalLink
          url={settingsUrl.href}
          role="button"
          color="outline-primary"
        >
          Update settings for {provider.display_name}
        </ExternalLink>
      )}
      <GitHubStatusCheck
        account={account}
        installations={installations}
        provider={provider}
        refetchInstallations={refetchInstallations}
      />
    </>
  );
}

interface GitHubAppInstallationItemProps {
  installation: AppInstallation;
}

function GitHubAppInstallationItem({
  installation,
}: GitHubAppInstallationItemProps) {
  const { account_login, account_web_url, repository_selection, suspended_at } =
    installation;

  const isSuspended = !!suspended_at;
  const restrictedSelection = repository_selection === "selected";

  return (
    <li className="mb-1">
      <ExternalLink url={account_web_url} role="text">
        <BoxArrowUpRight className={cx("bi", "me-1")} />
        <span className={cx(isSuspended && "text-decoration-line-through")}>
          {account_login}
        </span>
      </ExternalLink>
      {isSuspended
        ? " (suspended)"
        : restrictedSelection
        ? " (only selected repositories)"
        : null}
    </li>
  );
}

interface GitHubStatusCheckProps {
  account: Account;
  installations: AppInstallationsPaginated;
  provider: Provider;
  refetchInstallations: () => void;
}

function GitHubStatusCheck({
  account,
  installations,
  provider,
  refetchInstallations,
}: GitHubStatusCheckProps) {
  const [search, setSearch] = useSearchParams();

  const isEnabled = useMemo(
    () => search.get(CHECK_STATUS_QUERY_PARAM) === provider.id,
    [provider.id, search]
  );

  const isInstalledForUser = useMemo(() => {
    const userInstallation = installations.data.find(
      ({ account_login }) => account_login === account.username
    );
    return !!userInstallation && !userInstallation.suspended_at;
  }, [account.username, installations.data]);

  useEffect(() => {
    if (
      isEnabled &&
      (isInstalledForUser || installations.pagination.totalPages > 1)
    ) {
      setSearch(
        (prevSearch) => {
          prevSearch.delete(CHECK_STATUS_QUERY_PARAM);
          return prevSearch;
        },
        { replace: true }
      );
    }
  }, [
    installations.pagination.totalPages,
    isEnabled,
    isInstalledForUser,
    setSearch,
  ]);

  //? NOTE: if the user has more than 100 installations, assume the app is installed for the user
  if (
    !isEnabled ||
    isInstalledForUser ||
    installations.pagination.totalPages > 1
  ) {
    return null;
  }

  return (
    <GitHubStatusCheckModal
      provider={provider}
      refetchInstallations={refetchInstallations}
    />
  );
}

interface GitHubStatusCheckModalProps {
  provider: Provider;
  refetchInstallations: () => void;
}

function GitHubStatusCheckModal({
  provider,
  refetchInstallations,
}: GitHubStatusCheckModalProps) {
  const [, setSearch] = useSearchParams();

  const [isOpen, setIsOpen] = useState(true);
  const [hasOpenedTheLink, setHasOpenedTheLink] = useState(false);
  const toggle = useCallback(() => {
    // ? NOTE: refetch when the modal is closed in case the user has updated the settings
    if (hasOpenedTheLink) refetchInstallations();
    setIsOpen((open) => !open);
  }, [hasOpenedTheLink, refetchInstallations]);

  useEffect(() => {
    if (!isOpen) {
      setSearch(
        (prevSearch) => {
          prevSearch.delete(CHECK_STATUS_QUERY_PARAM);
          return prevSearch;
        },
        { replace: true }
      );
    }
  }, [isOpen, setSearch]);

  const settingsUrl = provider.app_slug
    ? safeNewUrl(
        `apps/${provider.app_slug}/installations/select_target`,
        provider.url
      )
    : null;

  return (
    <Modal backdrop="static" centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>GitHub app configuration</ModalHeader>
      <ModalBody>
        {settingsUrl ? (
          <>
            <p>
              In order to finish setting up the connection to{" "}
              {provider.display_name}, head over to {provider.url}.
            </p>
            <p>
              <ExternalLink
                color="primary"
                onClick={() => setHasOpenedTheLink(true)}
                role="button"
                url={settingsUrl.href}
              >
                Configure {provider.app_slug} on {provider.display_name}
              </ExternalLink>
            </p>
            <p>
              The {provider.app_slug} GitHub app needs to be installed for users
              and organizations so that RenkuLab can use repositories in
              projects and sessions.
            </p>
          </>
        ) : (
          <p>
            In order to finish setting up the connection to{" "}
            {provider.display_name}, you may need to configure where this app
            integration is installed on {provider.url}.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
