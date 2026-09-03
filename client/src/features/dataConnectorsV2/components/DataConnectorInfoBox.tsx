import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { capitalize } from "lodash-es";
import { DateTime } from "luxon";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowClockwise,
  Folder,
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
  UncontrolledTooltip,
} from "reactstrap";

import { WarnAlert } from "~/components/Alert";
import { Clipboard } from "~/components/clipboard/Clipboard";
import ExternalLink from "~/components/ExternalLink";
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
  getDataConnectorScope,
  parseDoi,
  useGetDataConnectorSource,
} from "../components/dataConnector.utils";
import { DATA_CONNECTORS_VISIBILITY_WARNING } from "./dataConnector.constants";
import DataConnectorRefreshExpiredModal from "./DataConnectorRefreshExpiredModal";

interface DataConnectorInfoBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: "h2" | "h3" | "h4";
  visibilityWarning?: boolean;
  internalId?: React.ReactNode;
}
export default function DataConnectorInfoBox({
  dataConnector,
  headerTag = "h2",
  visibilityWarning,
  internalId,
}: DataConnectorInfoBoxProps) {
  // Get useful DC info
  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace],
  );
  const identifier = useMemo(
    () =>
      scope === "global"
        ? `${dataConnector.slug}`
        : `${dataConnector.namespace}/${dataConnector.slug}`,
    [dataConnector.namespace, dataConnector.slug, scope],
  );
  const dataConnectorSource = useGetDataConnectorSource(dataConnector);

  const sortedKeywords = useMemo(() => {
    if (!dataConnector.keywords) return [];
    return dataConnector.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [dataConnector.keywords]);

  // Global only
  const doiReference = useMemo(() => {
    if (!dataConnector) return null;
    const doi =
      scope === "global" &&
      dataConnector.storage.configuration["doi"] &&
      typeof dataConnector.storage.configuration["doi"] === "string"
        ? parseDoi(dataConnector.storage.configuration["doi"])
        : null;
    if (doi) {
      return doi;
    }
    if (dataConnector.doi) {
      return parseDoi(dataConnector.doi);
    }
    return null;
  }, [dataConnector, scope]);

  const expired = dataConnector.expires_at
    ? ensureDateTime(dataConnector.expires_at) < DateTime.now()
    : false;

  const [isRefreshExpiredOpen, setRefreshExpiredOpen] = useState(false);
  const toggleRefreshExpired = useCallback(() => {
    setRefreshExpiredOpen((open) => !open);
  }, []);

  // Non-global only
  const { data: referenceNamespace, isLoading: isLoadingReferenceNamespace } =
    useGetNamespacesByNamespaceSlugQuery(
      dataConnector.namespace
        ? {
            namespaceSlug: dataConnector.namespace,
          }
        : skipToken,
    );
  const namespaceUrl = useMemo(
    () =>
      scope === "global" || !dataConnector.namespace
        ? null
        : scope === "project"
          ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
              namespace: dataConnector.namespace.split("/")[0],
              slug: dataConnector.namespace.split("/")[1],
            })
          : referenceNamespace?.namespace_kind === "user"
            ? generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
                username: dataConnector.namespace,
              })
            : generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
                slug: dataConnector.namespace,
              }),
    [dataConnector.namespace, referenceNamespace, scope],
  );

  return (
    <Card data-cy="data-connector-info-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <InfoCircle className="me-1" />
          Info
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {expired && (
          <WarnAlert className={cx("mb-0")} timeout={0}>
            <p className="mb-2">
              This data connector has expired and should be refreshed by an
              owner to use it in sessions, jobs or apps.
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

        <InfoEntry title="Identifier">
          <div className={cx("align-items-center", "d-flex", "gap-2")}>
            {identifier}
            <Clipboard
              className={cx("border-0", "btn", "p-0", "shadow-none")}
              clipboardText={identifier}
            />
          </div>
        </InfoEntry>

        {dataConnector.description && (
          <InfoEntry title="Description">
            <LazyMarkdown>{dataConnector.description}</LazyMarkdown>
          </InfoEntry>
        )}

        {scope !== "global" && (
          <InfoEntry title="Owner">
            <div className={cx("align-items-center", "d-flex", "gap-2")}>
              {scope === "project" ? (
                <>
                  <Folder className={cx("bi", "flex-shrink-0")} />
                  <Link to={namespaceUrl ?? ""}>
                    @{dataConnector.namespace}
                  </Link>
                </>
              ) : (
                <>
                  <UserAvatar namespace={dataConnector.namespace as string} />
                  <Link to={namespaceUrl ?? ""}>
                    @{dataConnector.namespace}
                  </Link>
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
        )}

        <InfoEntry title="Visibility">
          {dataConnector.visibility === "private" ? (
            <>
              <Lock className={cx("bi", "me-1")} />
              Private
            </>
          ) : (
            <>
              <Globe2 className={cx("bi", "me-1")} />
              Public
            </>
          )}

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

        {scope === "global" && (
          <>
            <InfoEntry title="Source">
              <div className={cx("align-items-center", "d-flex", "gap-1")}>
                <Journals className={cx("me-1", "flex-shrink-0")} />
                DOI from {dataConnectorSource}
              </div>
            </InfoEntry>
            <InfoEntry title="DOI">
              <div className={cx("align-items-center", "d-flex", "gap-2")}>
                <ExternalLink href={`https://doi.org/${doiReference}`}>
                  {doiReference}
                </ExternalLink>
                <Clipboard
                  className={cx("border-0", "btn", "p-0", "shadow-none")}
                  clipboardText={doiReference ?? ""}
                />
              </div>
            </InfoEntry>
          </>
        )}

        {dataConnector.keywords && dataConnector.keywords.length > 0 && (
          <InfoEntry title="Keywords">
            <KeywordContainer>
              {sortedKeywords.map((keyword, index) => (
                <KeywordBadge key={index} searchKeyword={keyword}>
                  {keyword}
                </KeywordBadge>
              ))}
            </KeywordContainer>
          </InfoEntry>
        )}

        {dataConnector.expires_at && (
          <InfoEntry
            title={<ExpiresAtTitle expiresAt={dataConnector.expires_at} />}
            dataCy="expires-at"
          >
            <TimeCaption
              datetime={dataConnector.expires_at}
              enableTooltip
              noCaption
            />
          </InfoEntry>
        )}

        <InfoEntry title={<MountPointHead />} dataCy="mount-point">
          {dataConnector.storage.target_path}
        </InfoEntry>

        <InfoEntry title="Access mode">
          {dataConnector.storage.readonly
            ? "Force Read-only"
            : "Allow Read-Write (requires adequate privileges on the storage)"}
        </InfoEntry>

        <InfoEntry title="Source path">
          {dataConnector.storage.source_path}
        </InfoEntry>

        <DataConnectorAdditionalFields dataConnector={dataConnector} />

        {internalId}
      </CardBody>
      {expired && (
        <DataConnectorRefreshExpiredModal
          dataConnector={dataConnector}
          isOpen={isRefreshExpiredOpen}
          setOpen={setRefreshExpiredOpen}
          toggleModal={toggleRefreshExpired}
        />
      )}
    </Card>
  );
}

interface InfoEntryProps {
  children: React.ReactNode;
  dataCy?: string;
  title: string | React.ReactNode;
}
export function InfoEntry({ children, title, dataCy }: InfoEntryProps) {
  return (
    <div>
      <p className={cx("mb-1", "fw-semibold")}>{title}</p>
      <div
        data-cy={
          dataCy
            ? `data-connector-${dataCy}`
            : typeof title === "string"
              ? `data-connector-${title.toLocaleLowerCase().replace(/\s/g, "-")}`
              : undefined
        }
      >
        {children}
      </div>
    </div>
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
}
function DataConnectorAdditionalFields({
  dataConnector,
}: DataConnectorAdditionalFieldsProps) {
  const credentialFieldDefinitions =
    getCredentialFieldDefinitions(dataConnector);

  const nonCredentialFields = Object.keys(
    dataConnector.storage.configuration,
  ).filter((k) => !credentialFieldDefinitions?.some((f) => f.name === k));

  const hasAccessMode = useMemo(
    () =>
      STORAGES_WITH_ACCESS_MODE.includes(dataConnector.storage.storage_type),
    [dataConnector.storage.storage_type],
  );

  return (
    <>
      {nonCredentialFields.map((fieldName) => {
        const title =
          fieldName == "provider" && hasAccessMode
            ? "Mode"
            : capitalize(fieldName);
        const value =
          dataConnector.storage.configuration[fieldName]?.toString() ?? "";
        return (
          <InfoEntry key={fieldName} title={title}>
            {value}
          </InfoEntry>
        );
      })}
    </>
  );
}
