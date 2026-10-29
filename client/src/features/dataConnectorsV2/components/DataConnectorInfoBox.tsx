import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { capitalize } from "lodash-es";
import { DateTime } from "luxon";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowClockwise,
  Folder,
  Gear,
  Globe2,
  InfoCircle,
  Journals,
  Lock,
} from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import { Clipboard } from "~/components/clipboard/Clipboard";
import ExternalLink from "~/components/ExternalLink";
import { sortKeywords } from "~/components/keywords/EntityPageHeaderKeywords";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import { Loader } from "~/components/Loader";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import { TimeCaption } from "~/components/TimeCaption";
import { STORAGES_WITH_ACCESS_MODE } from "~/features/cloudStorage/projectCloudStorage.constants";
import { getCredentialFieldDefinitions } from "~/features/cloudStorage/projectCloudStorage.utils";
import { useGetNamespacesByNamespaceSlugQuery } from "~/features/projectsV2/api/projectV2.enhanced-api";
import EntityPill from "~/features/searchV2/components/EntityPill";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { ensureDateTime } from "~/utils/helpers/DateTimeUtils";
import { DataConnectorRead } from "../api/data-connectors.api";
import {
  doiToUrl,
  formatDataConnectorProviderType,
  getDataConnectorAccessModeLabel,
  getDataConnectorDoi,
  getDataConnectorIdentifier,
  getDataConnectorScope,
  useGetDataConnectorSource,
} from "../components/dataConnector.utils";
import type { DataConnectorScope } from "../dataConnectors.types";
import { DATA_CONNECTORS_VISIBILITY_WARNING } from "./dataConnector.constants";
import DataConnectorRefreshExpiredModal from "./DataConnectorRefreshExpiredModal";

type DataConnectorHeaderTag = "h2" | "h3" | "h4";

interface DataConnectorInfoBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: DataConnectorHeaderTag;
  visibilityWarning?: boolean;
  layout?: InfoEntryLayout;
}

interface DataConnectorSectionCardProps {
  children: React.ReactNode;
  headerTag: DataConnectorHeaderTag;
  icon: React.ReactNode;
  title: string;
}
function DataConnectorSectionCard({
  children,
  headerTag,
  icon,
  title,
}: DataConnectorSectionCardProps) {
  return (
    <Card data-cy="data-connector-info-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          {icon}
          {title}
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {children}
      </CardBody>
    </Card>
  );
}

interface DataConnectorEntryProps {
  dataConnector: DataConnectorRead;
  layout?: InfoEntryLayout;
}

function DataConnectorIdentityEntries({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  return (
    <>
      <DataConnectorIdentifierEntry
        dataConnector={dataConnector}
        layout={layout}
      />
      <DataConnectorDescriptionEntry
        dataConnector={dataConnector}
        layout={layout}
      />
      <DataConnectorKeywordsEntry
        dataConnector={dataConnector}
        layout={layout}
      />
      <DataConnectorOwnerEntry dataConnector={dataConnector} layout={layout} />
    </>
  );
}

function DataConnectorIdentifierEntry({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  const identifier = useMemo(
    () => getDataConnectorIdentifier(dataConnector),
    [dataConnector],
  );

  return (
    <InfoEntry title="Identifier" layout={layout}>
      <div className={cx("align-items-center", "d-flex", "gap-2")}>
        {identifier}
        <Clipboard
          className={cx("border-0", "btn", "p-0", "shadow-none")}
          clipboardText={identifier}
        />
      </div>
    </InfoEntry>
  );
}

function DataConnectorDescriptionEntry({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  if (!dataConnector.description) return null;

  return (
    <InfoEntry title="Description" layout={layout}>
      <LazyMarkdown>{dataConnector.description}</LazyMarkdown>
    </InfoEntry>
  );
}

function DataConnectorKeywordsEntry({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  const keywordsSorted = useMemo(
    () => sortKeywords(dataConnector.keywords),
    [dataConnector.keywords],
  );

  if (keywordsSorted.length === 0) return null;

  return (
    <InfoEntry title="Keywords" layout={layout}>
      <KeywordContainer>
        {keywordsSorted.map((keyword, index) => (
          <KeywordBadge key={`keyword-${index}`} searchKeyword={keyword}>
            {keyword}
          </KeywordBadge>
        ))}
      </KeywordContainer>
    </InfoEntry>
  );
}

function dataConnectorNamespaceUrl(
  namespace: string,
  scope: DataConnectorScope,
  namespaceKind?: string,
) {
  if (scope === "project") {
    const [owner, slug] = namespace.split("/");
    return generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: owner,
      slug,
    });
  }
  if (namespaceKind === "user") {
    return generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
      username: namespace,
    });
  }
  return generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
    slug: namespace,
  });
}

function DataConnectorOwnerEntry({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace],
  );
  const { data: referenceNamespace, isLoading: isLoadingReferenceNamespace } =
    useGetNamespacesByNamespaceSlugQuery(
      dataConnector.namespace
        ? { namespaceSlug: dataConnector.namespace }
        : skipToken,
    );
  const namespaceUrl = useMemo(
    () =>
      scope === "global" || !dataConnector.namespace
        ? null
        : dataConnectorNamespaceUrl(
            dataConnector.namespace,
            scope,
            referenceNamespace?.namespace_kind,
          ),
    [dataConnector.namespace, referenceNamespace?.namespace_kind, scope],
  );

  if (scope === "global") return null;

  return (
    <InfoEntry title="Owner" layout={layout}>
      <div className={cx("align-items-center", "d-flex", "gap-2")}>
        {scope === "project" ? (
          <>
            <Folder className={cx("bi", "flex-shrink-0")} />
            <Link to={namespaceUrl ?? ""}>@{dataConnector.namespace}</Link>
          </>
        ) : (
          <>
            <UserAvatar namespace={dataConnector.namespace as string} />
            <Link to={namespaceUrl ?? ""}>@{dataConnector.namespace}</Link>
            {isLoadingReferenceNamespace ? (
              <Loader inline size={16} />
            ) : referenceNamespace?.namespace_kind === "user" ? (
              <EntityPill
                entityType="User"
                size="sm"
                tooltipPlacement="bottom"
              />
            ) : referenceNamespace?.namespace_kind === "group" ? (
              <EntityPill
                entityType="Group"
                size="sm"
                tooltipPlacement="bottom"
              />
            ) : null}
          </>
        )}
      </div>
    </InfoEntry>
  );
}

export function DataConnectorVisibilityLabel({
  visibility,
}: {
  visibility: DataConnectorRead["visibility"];
}) {
  if (visibility === "private") {
    return (
      <>
        <Lock className={cx("bi", "me-1")} />
        Private
      </>
    );
  }
  return (
    <>
      <Globe2 className={cx("bi", "me-1")} />
      Public
    </>
  );
}

function DataConnectorVisibilityEntry({
  dataConnector,
  layout,
  visibilityWarning,
}: DataConnectorEntryProps & { visibilityWarning?: boolean }) {
  return (
    <InfoEntry title="Visibility" layout={layout}>
      <DataConnectorVisibilityLabel visibility={dataConnector.visibility} />
      {visibilityWarning && (
        <WarnAlert
          className={cx("mb-0", "mt-2")}
          timeout={0}
          dismissible={false}
        >
          {DATA_CONNECTORS_VISIBILITY_WARNING}
        </WarnAlert>
      )}
    </InfoEntry>
  );
}

function DataConnectorInternalIdEntry({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  return (
    <InfoEntry title="Internal ID" dataCy="internalId" layout={layout}>
      <div className={cx("align-items-center", "d-flex", "gap-2")}>
        <span className="text-truncate">{dataConnector.id}</span>
        <Clipboard
          className={cx("border-0", "btn", "p-0", "shadow-none")}
          clipboardText={dataConnector.id}
        />
      </div>
    </InfoEntry>
  );
}

function DataConnectorStorageEntries({
  dataConnector,
  layout,
}: DataConnectorEntryProps) {
  const hasAccessMode = STORAGES_WITH_ACCESS_MODE.includes(
    dataConnector.storage.storage_type,
  );
  const type = dataConnector.storage.configuration["type"]?.toString();
  const provider = dataConnector.storage.configuration["provider"]?.toString();

  return (
    <>
      <InfoEntry title="Access mode" layout={layout}>
        {dataConnector.storage.readonly
          ? "Force Read-only"
          : "Allow Read-Write (requires adequate privileges on the storage)"}
      </InfoEntry>
      {type && (
        <InfoEntry title="Type" layout={layout}>
          {type}
        </InfoEntry>
      )}
      {provider && (
        <InfoEntry title={hasAccessMode ? "Mode" : "Provider"} layout={layout}>
          {provider}
        </InfoEntry>
      )}
    </>
  );
}

export function DataConnectorCompleteInfoBox({
  dataConnector,
  headerTag = "h2",
  layout = "one-column",
  visibilityWarning,
}: DataConnectorInfoBoxProps) {
  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace],
  );

  return (
    <DataConnectorSectionCard
      headerTag={headerTag}
      icon={<InfoCircle className="me-1" />}
      title="Info"
    >
      <DataConnectorIdentityEntries
        dataConnector={dataConnector}
        layout={layout}
      />
      {scope === "global" && (
        <DataConnectorDoiInfo dataConnector={dataConnector} layout={layout} />
      )}
      <DataConnectorVisibilityEntry
        dataConnector={dataConnector}
        layout={layout}
        visibilityWarning={visibilityWarning}
      />
      <DataConnectorStorageEntries
        dataConnector={dataConnector}
        layout={layout}
      />
      <DataConnectorConnectionContent
        dataConnector={dataConnector}
        layout={layout}
      />
      <DataConnectorInternalIdEntry
        dataConnector={dataConnector}
        layout={layout}
      />
    </DataConnectorSectionCard>
  );
}

export function DataConnectorInfoBox({
  dataConnector,
  headerTag = "h2",
  layout = "one-column",
  visibilityWarning,
}: DataConnectorInfoBoxProps) {
  const provider =
    dataConnector.storage.configuration["provider"]?.toString() ?? "";
  const type = dataConnector.storage.configuration["type"]?.toString() ?? "";

  return (
    <DataConnectorSectionCard
      headerTag={headerTag}
      icon={<InfoCircle className="me-1" />}
      title="Info"
    >
      <DataConnectorIdentityEntries
        dataConnector={dataConnector}
        layout={layout}
      />
      <InfoEntry title="Provider" layout={layout}>
        {formatDataConnectorProviderType(provider, type)}
      </InfoEntry>
      <InfoEntry title="Access mode" layout={layout}>
        {getDataConnectorAccessModeLabel(dataConnector.storage.readonly)}
      </InfoEntry>
      <DataConnectorVisibilityEntry
        dataConnector={dataConnector}
        layout={layout}
        visibilityWarning={visibilityWarning}
      />
      <DataConnectorInternalIdEntry
        dataConnector={dataConnector}
        layout={layout}
      />
    </DataConnectorSectionCard>
  );
}

interface DataConnectorConnectionBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: DataConnectorHeaderTag;
  layout?: InfoEntryLayout;
  showDescription?: boolean;
}
export function DataConnectorConnectionBox({
  dataConnector,
  headerTag = "h2",
  layout = "one-column",
  showDescription = true,
}: DataConnectorConnectionBoxProps) {
  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace],
  );
  const isGlobal = scope === "global";

  return (
    <DataConnectorSectionCard
      headerTag={headerTag}
      icon={
        isGlobal ? <InfoCircle className="me-1" /> : <Gear className="me-1" />
      }
      title={isGlobal ? "Info" : "Connection settings"}
    >
      {showDescription && (
        <DataConnectorDescriptionEntry dataConnector={dataConnector} />
      )}
      {isGlobal && (
        <DataConnectorDoiInfo dataConnector={dataConnector} layout={layout} />
      )}
      <DataConnectorConnectionContent
        dataConnector={dataConnector}
        layout={layout}
      />
    </DataConnectorSectionCard>
  );
}

interface DataConnectorDoiInfoProps {
  dataConnector: DataConnectorRead;
  layout: InfoEntryLayout;
}
function DataConnectorDoiInfo({
  dataConnector,
  layout,
}: DataConnectorDoiInfoProps) {
  const { source: dataConnectorSource } =
    useGetDataConnectorSource(dataConnector);
  const doiReference = useMemo(
    () => getDataConnectorDoi(dataConnector),
    [dataConnector],
  );

  return (
    <>
      <InfoEntry title="Source" layout={layout}>
        <div className={cx("align-items-center", "d-flex", "gap-1")}>
          <Journals className={cx("me-1", "flex-shrink-0")} />
          DOI from {dataConnectorSource}
        </div>
      </InfoEntry>
      <InfoEntry title="DOI" layout={layout}>
        <div className={cx("align-items-center", "d-flex", "gap-2")}>
          {doiReference ? (
            <>
              <ExternalLink href={doiToUrl(doiReference)}>
                {doiReference}
              </ExternalLink>
              <Clipboard
                className={cx("border-0", "btn", "p-0", "shadow-none")}
                clipboardText={doiReference}
              />
            </>
          ) : (
            <p className="mb-0">N/A</p>
          )}
        </div>
      </InfoEntry>
    </>
  );
}

interface DataConnectorConnectionContentProps {
  dataConnector: DataConnectorRead;
  layout: InfoEntryLayout;
}
function DataConnectorConnectionContent({
  dataConnector,
  layout,
}: DataConnectorConnectionContentProps) {
  const expired = dataConnector.expires_at
    ? ensureDateTime(dataConnector.expires_at) < DateTime.now()
    : false;

  const [isRefreshExpiredOpen, setRefreshExpiredOpen] = useState(false);
  const toggleRefreshExpired = useCallback(() => {
    setRefreshExpiredOpen((open) => !open);
  }, []);

  return (
    <>
      {expired && (
        <WarnAlert className={cx("mb-0")} timeout={0}>
          <p className="mb-2">
            This data connector has expired and should be refreshed by an owner
            to use it in sessions, jobs or apps.
          </p>
          <Button
            color="primary"
            onClick={toggleRefreshExpired}
            size="sm"
            type="button"
          >
            <ArrowClockwise className={cx("bi", "me-1")} />
            Refresh
          </Button>
        </WarnAlert>
      )}

      {dataConnector.expires_at && (
        <InfoEntry
          title={<ExpiresAtTitle expiresAt={dataConnector.expires_at} />}
          dataCy="expires-at"
          layout={layout}
        >
          <TimeCaption
            datetime={dataConnector.expires_at}
            enableTooltip
            noCaption
          />
        </InfoEntry>
      )}

      <InfoEntry
        title={<MountPointHead />}
        dataCy="mount-point"
        layout={layout}
      >
        {dataConnector.storage.target_path}
      </InfoEntry>

      <InfoEntry title="Source path" layout={layout}>
        {dataConnector.storage.source_path}
      </InfoEntry>

      {expired && (
        <DataConnectorRefreshExpiredModal
          dataConnector={dataConnector}
          isOpen={isRefreshExpiredOpen}
          setOpen={setRefreshExpiredOpen}
          toggleModal={toggleRefreshExpired}
        />
      )}

      <DataConnectorAdditionalFields
        dataConnector={dataConnector}
        layout={layout}
      />
    </>
  );
}

export type InfoEntryLayout = "one-column" | "two-columns";

interface InfoEntryProps {
  children: React.ReactNode;
  dataCy?: string;
  title: string | React.ReactNode;
  layout?: InfoEntryLayout;
}
export function InfoEntry({
  children,
  title,
  dataCy,
  layout = "one-column",
}: InfoEntryProps) {
  const sizeMd = layout == "one-column" ? 12 : 4;
  const sizeLg = layout == "one-column" ? 12 : 3;

  return (
    <Row>
      <Col
        xs={12}
        md={sizeMd}
        lg={sizeLg}
        className={cx(
          "fw-semibold",
          "mb-1",
          layout === "two-columns" && "mb-md-0",
        )}
      >
        {title}
      </Col>
      <Col
        data-cy={
          dataCy
            ? `data-connector-${dataCy}`
            : typeof title === "string"
              ? `data-connector-${title.toLocaleLowerCase().replace(/\s/g, "-")}`
              : undefined
        }
      >
        {children}
      </Col>
    </Row>
  );
}

function MountPointHead() {
  const ref = useRef(null);
  return (
    <>
      <span>Mount Point</span>
      <span ref={ref}>
        <InfoCircle className="ms-1" />
      </span>
      <UncontrolledTooltip target={ref} placement="bottom">
        This is where the data connector will be mounted during sessions.
      </UncontrolledTooltip>
    </>
  );
}

interface ExpiresAtTitleProps {
  expiresAt: string;
}
function ExpiresAtTitle({ expiresAt: expiresAt_ }: ExpiresAtTitleProps) {
  const expiresAt = ensureDateTime(expiresAt_);
  const expired = expiresAt < DateTime.now();
  const ref = useRef(null);
  return (
    <>
      {expired ? "Expired" : "Expires"}
      <span ref={ref}>
        <InfoCircle className="ms-1" tabIndex={0} />
      </span>
      <UncontrolledTooltip target={ref} placement="bottom">
        {expired
          ? "This data connector has expired. You need to refresh it to use it in sessions or jobs."
          : "This data connector has an expire date and will need to be refreshed after reaching it."}
      </UncontrolledTooltip>
    </>
  );
}

interface DataConnectorAdditionalFieldsProps {
  dataConnector: DataConnectorRead;
  layout: InfoEntryLayout;
}
function DataConnectorAdditionalFields({
  dataConnector,
  layout,
}: DataConnectorAdditionalFieldsProps) {
  const credentialFieldDefinitions =
    getCredentialFieldDefinitions(dataConnector);

  const nonCredentialFields = Object.keys(
    dataConnector.storage.configuration,
  ).filter(
    (k) =>
      k !== "provider" &&
      k !== "type" &&
      !credentialFieldDefinitions?.some((f) => f.name === k),
  );

  return (
    <>
      {nonCredentialFields.map((fieldName) => {
        const title = capitalize(fieldName);
        const value =
          dataConnector.storage.configuration[fieldName]?.toString() ?? "";
        return (
          <InfoEntry key={fieldName} title={title} layout={layout}>
            {value}
          </InfoEntry>
        );
      })}
    </>
  );
}
