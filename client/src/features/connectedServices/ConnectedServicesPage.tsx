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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Box2,
  CircleFill,
  Plugin,
  PlusLg,
  Send,
  XCircleFill,
  XLg,
} from "react-bootstrap-icons";
import { Link, useSearchParams } from "react-router";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Col,
  Input,
  InputGroup,
  Label,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import ExternalLink from "~/components/ExternalLink";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon.tsx";
import type { AppInstallationsPaginated } from "~/features/connectedServices/api/connectedServices.types";
import { useOAuthProviderConnect } from "~/features/connectedServices/useOAuthProviderConnect.hook";
import { NEW_DOCS_USER_INTEGRATIONS } from "~/utils/constants/NewDocs";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import { safeNewUrl } from "~/utils/helpers/safeNewUrl.utils";
import { InfoAlert, RenkuAlert, WarnAlert } from "../../components/Alert";
import RtkOrDataServicesError from "../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../components/Loader";
import PageLoader from "../../components/PageLoader";
import { usersApi } from "../usersV2/api/users.api";
import {
  ConnectedAccount as Account,
  connectedServicesApi,
  useDeleteOauth2ConnectionsByConnectionIdMutation,
  useGetOauth2ConnectionsByConnectionIdAccountQuery,
  useGetOauth2ConnectionsByConnectionIdInstallationsQuery,
  useGetOauth2ConnectionsQuery,
  useGetOauth2ProvidersQuery,
  type AppInstallation,
  type Connection,
  type ConnectionStatus,
  type Provider,
} from "./api/connectedServices.api";
import {
  CHECK_STATUS_QUERY_PARAM,
  SEARCH_PARAM_ACTION_REQUIRED,
  SEARCH_PARAM_PROVIDER,
  SEARCH_PARAM_SOURCE,
} from "./connectedServices.constants";
import { getSettingsUrl } from "./connectedServices.utils";
import ContactUsCard from "./ContactUsCard";
import {
  useConnectedServiceProviderLists,
  type ProviderWithConnection,
} from "./useConnectedServiceProviderLists.hook";
import type { GithubOAuthCompleteFollowUpData } from "./useGithubOAuthCompleteFollowUpData.hook";

import DashboardStyles from "~/features/dashboardV2/DashboardV2.module.scss";

const CONNECTED_SERVICES_POLLING_INTERVAL_MS = 10_000;
const DEFAULT_MODAL_PROVIDERS_COUNT = 4;

export default function ConnectedServicesPage() {
  const { data: user } = usersApi.endpoints.getUser.useQueryState();
  const isUserLoggedIn = !!user?.isLoggedIn;
  const [searchParams] = useSearchParams();
  const targetProviderId = searchParams.get(SEARCH_PARAM_PROVIDER);
  const source = searchParams.get(SEARCH_PARAM_SOURCE);
  const actionRequired = searchParams.get(SEARCH_PARAM_ACTION_REQUIRED);
  const { params } = useContext(AppContext);
  const renkuContactEmail =
    params?.CONTACT_EMAIL ?? DEFAULT_APP_PARAMS.CONTACT_EMAIL;
  const {
    data: providers,
    isLoading: isLoadingProviders,
    error: providersError,
  } = useGetOauth2ProvidersQuery(isUserLoggedIn ? undefined : skipToken, {
    pollingInterval: CONNECTED_SERVICES_POLLING_INTERVAL_MS,
  });
  const {
    data: connections,
    isLoading: isLoadingConnections,
    error: connectionsError,
  } = useGetOauth2ConnectionsQuery(isUserLoggedIn ? undefined : skipToken, {
    pollingInterval: CONNECTED_SERVICES_POLLING_INTERVAL_MS,
  });
  const [isAddIntegrationModalOpen, setIsAddIntegrationModalOpen] =
    useState(false);

  const { mainListProviders, modalProviders } =
    useConnectedServiceProviderLists({
      providers,
      connections,
      targetProviderId,
    });

  const isLoading = isLoadingProviders || isLoadingConnections;
  const error = providersError || connectionsError;
  const targetedProvider = providers?.find(
    (provider) => provider.id === targetProviderId
  );
  const IsTargetedProviderVisible = mainListProviders.some(
    (provider) => provider.provider.id === targetProviderId
  );

  const toggleAddIntegrationModal = useCallback(() => {
    setIsAddIntegrationModalOpen((isOpen) => !isOpen);
  }, []);

  const goBackButton = source && (
    <Link to={source} className={cx("primary")}>
      go back to your project
    </Link>
  );

  const content = isLoading ? (
    <PageLoader />
  ) : error ? (
    <RtkOrDataServicesError error={error} dismissible={false} />
  ) : !isUserLoggedIn ? (
    <InfoAlert dismissible={false}>
      Anonymous users cannot connect to external services.
    </InfoAlert>
  ) : !providers || providers.length === 0 ? (
    <>
      <p>There are currently no external services users can connect to.</p>
      <div className={cx("row", "g-3")}>
        <ContactUsCard />
      </div>
    </>
  ) : (
    <>
      {targetedProvider && !IsTargetedProviderVisible && actionRequired && (
        <RenkuAlert
          timeout={0}
          color={actionRequired ? "warning" : "info"}
          className={cx(
            actionRequired ? "border-warning" : "border-info",
            "shadow-sm"
          )}
        >
          <p className="mb-0">
            Action required. Please{" "}
            <a
              className={cx("text-primary", "cursor-pointer")}
              onClick={toggleAddIntegrationModal}
            >
              add integration to{" "}
              <span className="fst-italic">
                {targetedProvider.display_name}
              </span>
            </a>
            {goBackButton && <> and then {goBackButton}</>}.
          </p>
        </RenkuAlert>
      )}
      <Card data-cy="connected-services-list">
        <CardHeader className={cx("d-flex", "gap-2")}>
          <h2 className={cx("mb-0", "my-auto")}>My integrations</h2>
          <Button
            className={cx("btn-sm", "ms-auto", "my-auto")}
            color="outline-primary"
            id="ActivateIntegration"
            data-cy="activate-integration-button"
            onClick={toggleAddIntegrationModal}
            type="button"
          >
            <PlusLg className="bi" />
          </Button>
        </CardHeader>
        <CardBody>
          {mainListProviders.length === 0 ? (
            <p className={cx("mb-0", "text-muted")}>
              You have no integrations configured.
              <a
                className={cx("text-primary", "cursor-pointer", "ms-1")}
                onClick={toggleAddIntegrationModal}
              >
                Activate integrations
              </a>
            </p>
          ) : (
            <ListGroup flush>
              {mainListProviders.map(({ provider, connection }) => (
                <ConnectedServiceListItem
                  key={provider.id}
                  data-cy="connected-service-item"
                  actionRequired={!!actionRequired}
                  connection={connection}
                  highlighted={provider.id === targetProviderId}
                  provider={provider}
                  source={
                    provider.id === targetProviderId && source
                      ? source
                      : undefined
                  }
                />
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
      <div className={cx("mt-3", "row", "g-3")}>
        <ContactUsCard />
      </div>
      <AddIntegrationModal
        isOpen={isAddIntegrationModalOpen}
        onToggle={toggleAddIntegrationModal}
        providers={modalProviders}
      />
    </>
  );

  return (
    <div data-cy="connected-services-page">
      <h1>
        <Plugin className={cx("bi", "me-1")} />
        Integrations
      </h1>
      <p>
        Integrations with external services allow you to connect your Renku
        projects with external private repositories and images.
      </p>
      <Row className="g-4">
        <Col xs={12} md={8}>
          <Row className="g-4">
            <Col xs={12}>{content}</Col>
          </Row>
        </Col>
        {isUserLoggedIn && (
          <Col xs={12} md={4}>
            <Card
              className={cx(DashboardStyles.DashboardCard, "border-1", "mb-3")}
            >
              <CardBody className={DashboardStyles.FooterCard}>
                <p>
                  Do you have another platform you&apos;d like to connect to
                  Renku?
                </p>
                <p>
                  <Link
                    to={`mailto:${renkuContactEmail}`}
                    className={cx("btn", "btn-outline-primary")}
                    target="_blank"
                  >
                    <Send size={27} className="me-2" />
                    Contact us
                  </Link>{" "}
                  to add it to this list!
                </p>
              </CardBody>
            </Card>
            <Card className={cx("border-1")}>
              <CardBody>
                <p>
                  Check out our documentation to learn more about{" "}
                  <ExternalLink href={NEW_DOCS_USER_INTEGRATIONS}>
                    integrations in Renku
                  </ExternalLink>
                  .
                </p>
              </CardBody>
            </Card>
          </Col>
        )}
      </Row>
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

interface ConnectedServiceListItemProps {
  actionRequired?: boolean;
  connection?: Connection;
  highlighted?: boolean;
  provider: Provider;
  source?: string;
}

interface ProviderRowHeaderProps {
  provider: Provider;
  statusSlot?: ReactNode;
}
function ProviderRowHeader({ provider, statusSlot }: ProviderRowHeaderProps) {
  return (
    <>
      <h4 className={cx("mb-2", "fw-bold")}>
        <Box2 className={cx("bi", "me-1")} />
        {provider.display_name}
      </h4>
      <div
        className={cx(
          "d-flex",
          "flex-wrap",
          "align-items-center",
          "gap-2",
          "mb-2"
        )}
      >
        <ExternalLink href={provider.url}>{provider.url}</ExternalLink>
        {statusSlot}
      </div>
    </>
  );
}

function ConnectedServiceListItem({
  actionRequired = false,
  connection,
  highlighted = false,
  provider,
  source,
}: ConnectedServiceListItemProps) {
  const goBackButton = source && (
    <Link to={source} className={cx("primary")}>
      go back to your project
    </Link>
  );

  return (
    <ListGroupItem data-cy="connected-service-item" action={true}>
      {highlighted && (
        <RenkuAlert
          dismissible={false}
          timeout={0}
          color={actionRequired ? "warning" : "info"}
          className={cx(
            actionRequired ? "border-warning" : "border-info",
            "shadow-sm"
          )}
        >
          <p className="mb-0">
            {actionRequired && connection?.status === "pending"
              ? "Action required. Please connect to this integration"
              : "Check your integration settings here"}
            {goBackButton && <> and then {goBackButton}</>}.
          </p>
        </RenkuAlert>
      )}
      <div className={cx("d-flex", "align-items-start", "gap-3")}>
        <div className={cx("flex-grow-1")}>
          <ProviderRowHeader
            provider={provider}
            statusSlot={<ConnectedServiceStatus connection={connection} />}
          />
          {connection?.status === "connected" && (
            <ConnectedAccount connection={connection} />
          )}
          {connection?.status === "connected" && provider.kind == "github" && (
            <GitHubAppInstallations
              connection={connection}
              provider={provider}
            />
          )}
        </div>
        <div className={cx("d-flex", "gap-2", "ms-auto")}>
          <DisconnectButton
            connectionStatus={connection?.status}
            connectionId={connection?.id}
          />
          <ConnectButton
            provider={provider}
            connectionStatus={connection?.status}
          />
        </div>
      </div>
    </ListGroupItem>
  );
}

interface AddIntegrationModalProps {
  isOpen: boolean;
  onToggle: () => void;
  providers: ProviderWithConnection[];
}
function AddIntegrationModal({
  isOpen,
  onToggle,
  providers,
}: AddIntegrationModalProps) {
  const [showAllIntegrations, setShowAllIntegrations] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [userSearchInput, setUserSearchInput] = useState("");

  const normalizedSearchInput = useMemo(
    () => userSearchInput.trim().toLowerCase(),
    [userSearchInput]
  );

  const filteredProviders = useMemo(() => {
    if (!normalizedSearchInput) return providers;

    return providers.filter(({ provider }) =>
      [provider.display_name, provider.url].some((value) =>
        value.toLowerCase().includes(normalizedSearchInput)
      )
    );
  }, [normalizedSearchInput, providers]);

  const visibleProviders = useMemo(() => {
    if (showAllIntegrations) return filteredProviders;
    return filteredProviders.slice(0, DEFAULT_MODAL_PROVIDERS_COUNT);
  }, [filteredProviders, showAllIntegrations]);

  const toggleShowAllIntegrations = useCallback(() => {
    setShowAllIntegrations((open) => !open);
  }, []);

  const resetSearch = useCallback(() => {
    setUserSearchInput("");
    searchInputRef.current?.focus();
  }, []);

  const resetModalState = useCallback(() => {
    setShowAllIntegrations(false);
    setUserSearchInput("");
  }, []);

  return (
    <Modal
      centered
      isOpen={isOpen}
      onClosed={resetModalState}
      onOpened={resetSearch}
      size="lg"
      toggle={onToggle}
    >
      <ModalHeader tag="h2" toggle={onToggle}>
        <Plugin className={cx("bi", "me-1")} />
        Activate integration
      </ModalHeader>
      <ModalBody>
        {providers.length === 0 ? (
          <p>There are currently no external services users can connect to.</p>
        ) : (
          <>
            <p>Add a new code, data, or compute integration.</p>
            <div className="mb-4">
              <Label for="add-integration-search-input">Search</Label>
              <InputGroup>
                <Input
                  data-cy="add-integration-search-input"
                  id="add-integration-search-input"
                  innerRef={searchInputRef}
                  placeholder="Search by name or url"
                  type="text"
                  value={userSearchInput}
                  onChange={(e) => setUserSearchInput(e.target.value)}
                />
                <Button
                  color="outline-secondary"
                  className="border-secondary-subtle"
                  data-cy="search-clear-button"
                  onClick={resetSearch}
                  id="search-clear-button"
                  type="button"
                >
                  <XCircleFill className={cx("bi")} />
                </Button>
              </InputGroup>
            </div>
            {normalizedSearchInput && filteredProviders.length === 0 ? (
              <span className={cx("small", "text-muted")}>
                No integrations found for &quot;{userSearchInput.trim()}&quot;.
              </span>
            ) : (
              <ListGroup className={cx("bg-white", "rounded-3", "border")}>
                {visibleProviders.map(({ provider, connection }) => (
                  <ListGroupItem
                    key={provider.id}
                    action={true}
                    data-cy="provider-item"
                  >
                    <div
                      className={cx("d-flex", "align-items-center", "gap-3")}
                    >
                      <div className={cx("flex-grow-1")}>
                        <ProviderRowHeader provider={provider} />
                      </div>
                      <ConnectButton
                        provider={provider}
                        connectionStatus={connection?.status}
                        onConnectStart={onToggle}
                      />
                    </div>
                  </ListGroupItem>
                ))}
                {filteredProviders.length > DEFAULT_MODAL_PROVIDERS_COUNT && (
                  <button
                    onClick={toggleShowAllIntegrations}
                    className={cx(
                      "text-primary",
                      "list-group-item",
                      "text-start",
                      "text-decoration-underline"
                    )}
                  >
                    {!showAllIntegrations
                      ? "See all integrations"
                      : "Show less "}
                    <ChevronFlippedIcon
                      className="ms-1"
                      flipped={showAllIntegrations}
                    />
                  </button>
                )}
              </ListGroup>
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
}

export interface ConnectButtonParams {
  provider: Provider | null | undefined;
  connectionStatus?: ConnectionStatus;
  className?: string;
  includeSource?: boolean;
  onConnectStart?: () => void;
  onConnected?: () => void;
  labelConnect?: string;
  labelReconnect?: string;
  withIcon?: boolean;
}

export function ConnectButton({
  provider,
  connectionStatus,
  className,
  includeSource = false,
  onConnectStart,
  onConnected,
  labelConnect = "Connect",
  labelReconnect = "Reconnect",
  withIcon = false,
}: ConnectButtonParams) {
  const { startPolling, authorizeHref } = useOAuthProviderConnect(provider, {
    includeSource,
    onConnected,
  });
  const handleConnectClick = useCallback(() => {
    onConnectStart?.();
    startPolling();
  }, [onConnectStart, startPolling]);

  if (!provider || !authorizeHref) return null;

  const text = connectionStatus === "connected" ? labelReconnect : labelConnect;

  return (
    <a
      href={authorizeHref}
      className={cx("btn", "btn-primary", className)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleConnectClick}
    >
      {withIcon && <Plugin className={cx("bi", "me-1")} />}
      {text}
    </a>
  );
}

interface DisconnectButtonParams {
  className?: string;
  connectionStatus?: ConnectionStatus;
  connectionId?: string;
}
export function DisconnectButton({
  className,
  connectionStatus,
  connectionId,
}: DisconnectButtonParams) {
  const [deleteConnection] = useDeleteOauth2ConnectionsByConnectionIdMutation();

  const onDisconnect = useCallback(() => {
    if (connectionId) {
      deleteConnection({ connectionId });
    }
  }, [deleteConnection, connectionId]);

  if (connectionStatus === "pending")
    return (
      <Button
        color="outline-primary"
        className={cx(className)}
        onClick={onDisconnect}
      >
        Remove
      </Button>
    );
  if (connectionStatus !== "connected" || !connectionId) return null;

  return (
    <Button
      color="outline-primary"
      className={cx(className)}
      onClick={onDisconnect}
    >
      Disconnect
    </Button>
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
    return <RtkOrDataServicesError error={error} dismissible={false} />;
  }

  if (account == null) {
    return <CardText>Error: could not find connected account.</CardText>;
  }

  const text = `@${account.username}`;

  return (
    <CardText>
      Account:{" "}
      {account.web_url ? (
        <ExternalLink href={account.web_url}>{text}</ExternalLink>
      ) : (
        text
      )}
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
  const hasImageRegistry = !!provider.image_registry_url;
  const {
    data: account,
    isLoading: isLoadingAccount,
    error: accountError,
  } = connectedServicesApi.endpoints.getOauth2ConnectionsByConnectionIdAccount.useQueryState(
    hasImageRegistry
      ? skipToken
      : {
          connectionId: connection.id,
        }
  );

  const {
    data: installations,
    isFetching: isFetchingInstallations,
    error: installationsError,
    refetch: refetchInstallations,
  } = useGetOauth2ConnectionsByConnectionIdInstallationsQuery(
    hasImageRegistry
      ? skipToken
      : {
          connectionId: connection.id,
          params: { per_page: 100 },
        }
  );

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

  // ? We currently support image registries only for oAuth apps where we don't have additional info/customization
  if (hasImageRegistry) return null;

  if (error) {
    return <RtkOrDataServicesError error={error} dismissible={false} />;
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

  const settingsUrl = getSettingsUrl({
    app_slug: provider.app_slug,
    url: provider.url,
  });

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
          href={settingsUrl.href}
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
      <ExternalLink href={account_web_url}>
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

export interface GitHubStatusCheckProps {
  account: Account;
  installations: AppInstallationsPaginated;
  provider: Provider;
  refetchInstallations: () => void;
}

export function GitHubStatusCheck({
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

export interface GitHubStatusCheckModalProps {
  provider: Provider;
  refetchInstallations: () => void;
}

export function GitHubStatusCheckModal({
  provider,
  refetchInstallations,
}: GitHubStatusCheckModalProps) {
  const [, setSearch] = useSearchParams();

  const [isOpen, setIsOpen] = useState(true);
  const [hasOpenedTheLink, setHasOpenedTheLink] = useState(false);
  const toggle = useCallback(() => {
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
                href={settingsUrl.href}
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

type GitHubOAuthCompleteFollowUpProps = Pick<
  GithubOAuthCompleteFollowUpData,
  "skipData" | "connection" | "provider"
>;

export function GitHubOAuthCompleteFollowUp({
  skipData,
  connection,
  provider,
}: GitHubOAuthCompleteFollowUpProps) {
  const { data: account } = useGetOauth2ConnectionsByConnectionIdAccountQuery(
    skipData || !connection ? skipToken : { connectionId: connection.id }
  );

  const { data: installations, refetch: refetchInstallations } =
    useGetOauth2ConnectionsByConnectionIdInstallationsQuery(
      skipData || !connection
        ? skipToken
        : {
            connectionId: connection.id,
            params: { per_page: 100 },
          }
    );

  if (skipData || account == null || installations == null || !provider) {
    return null;
  }

  return (
    <GitHubStatusCheck
      account={account}
      installations={installations}
      provider={provider}
      refetchInstallations={refetchInstallations}
    />
  );
}
