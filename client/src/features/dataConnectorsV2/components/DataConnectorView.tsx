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
import cx from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Folder,
  Gear,
  Globe2,
  InfoCircle,
  Journals,
  Key,
  Lock,
  Pencil,
  PersonBadge,
} from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import {
  Button,
  Offcanvas,
  OffcanvasBody,
  UncontrolledTooltip,
} from "reactstrap";

import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import { getCredentialFieldDefinitions } from "~/features/cloudStorage/projectCloudStorage.utils";
import { WarnAlert } from "../../../components/Alert";
import { Clipboard } from "../../../components/clipboard/Clipboard";
import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import { toCapitalized } from "../../../utils/helpers/HelperFunctions";
import { CredentialMoreInfo } from "../../cloudStorage/CloudStorageItem";
import {
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
  STORAGES_WITH_ACCESS_MODE,
} from "../../cloudStorage/projectCloudStorage.constants";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import { useGetNamespacesByNamespaceSlugQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { EntityPill } from "../../searchV2/components/SearchV2Results";
import { storageSecretNameToFieldName } from "../../secretsV2/secrets.utils";
import UserAvatar from "../../usersV2/show/UserAvatar";
import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";
import { useGetDataConnectorsByDataConnectorIdSecretsQuery } from "../api/data-connectors.enhanced-api";
import useDataConnectorPermissions from "../utils/useDataConnectorPermissions.hook";
import { DATA_CONNECTORS_VISIBILITY_WARNING } from "./dataConnector.constants";
import {
  getDataConnectorScope,
  parseDoi,
  useGetDataConnectorSource,
} from "./dataConnector.utils";
import DataConnectorActions from "./DataConnectorActions";
import DataConnectorModal from "./DataConnectorModal";
import useDataConnectorProjects from "./useDataConnectorProjects.hook";

const SECTION_CLASSES = [
  "border-top",
  "border-dark",
  "border-opacity-50",
  "pt-3",
];

interface DataConnectorPropertyProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
}

function DataConnectorPropertyValue({
  title,
  children,
}: DataConnectorPropertyProps) {
  return (
    <>
      <div className="fw-bold">{title}</div>
      <div className="mb-4">{children}</div>
    </>
  );
}

interface DataConnectorViewProps {
  dataConnector: DataConnectorRead;
  dataConnectorLink?: DataConnectorToProjectLink;
  showView: boolean;
  toggleView: () => void;
  toggleEdit: (initialStep?: number) => void;
  dataConnectorPotentiallyInaccessible?: boolean;
}
export default function DataConnectorView({
  dataConnector,
  dataConnectorLink,
  showView,
  toggleView,
  dataConnectorPotentiallyInaccessible = false,
}: Omit<DataConnectorViewProps, "toggleEdit">) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [initialStep, setInitialStep] = useState(2);

  const toggleEdit = useCallback((initialStep?: number) => {
    if (initialStep) setInitialStep(initialStep);
    setIsEditOpen((open) => !open);
  }, []);

  return (
    <Offcanvas
      toggle={toggleView}
      isOpen={showView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="data-connector-view-back-button"
            data-bs-dismiss="offcanvas"
            onClick={toggleView}
          ></button>
        </div>
        <DataConnectorViewHeader
          {...{ dataConnector, dataConnectorLink, toggleView, toggleEdit }}
        />
        <DataConnectorViewMetadata
          dataConnector={dataConnector}
          dataConnectorPotentiallyInaccessible={
            dataConnectorPotentiallyInaccessible
          }
        />
        <DataConnectorViewConfiguration
          dataConnector={dataConnector}
          toggleEdit={toggleEdit}
        />
        <DataConnectorViewAccess dataConnector={dataConnector} />
        <DataConnectorViewProjects dataConnector={dataConnector} />
      </OffcanvasBody>
      <DataConnectorModal
        dataConnector={dataConnector}
        isOpen={isEditOpen}
        namespace={dataConnector.namespace}
        toggle={toggleEdit}
        initialStep={initialStep}
      />
    </Offcanvas>
  );
}

function DataConnectorViewAccess({
  dataConnector,
}: Pick<DataConnectorViewProps, "dataConnector">) {
  const { data: connectorSecrets } =
    useGetDataConnectorsByDataConnectorIdSecretsQuery({
      dataConnectorId: dataConnector.id,
    });
  const storageDefinition = dataConnector.storage;
  const sensitiveFields = storageDefinition.sensitive_fields
    ? storageDefinition.sensitive_fields?.map((f) => f.name)
    : [];
  const anySensitiveField = Object.keys(storageDefinition.configuration).some(
    (key) => sensitiveFields.includes(key)
  );
  const savedCredentialFields =
    connectorSecrets?.reduce((acc: Record<string, string>, s) => {
      acc[storageSecretNameToFieldName(s)] = s.name;
      return acc;
    }, {}) ?? {};
  const credentialFieldDefinitions = useMemo(
    () =>
      getCredentialFieldDefinitions({
        storage: dataConnector.storage,
        sensitive_fields: dataConnector.storage.sensitive_fields,
      }),
    [dataConnector]
  );
  const requiredCredentials = useMemo(
    () =>
      credentialFieldDefinitions?.filter((field) => field.requiredCredential),
    [credentialFieldDefinitions]
  );
  return (
    <section
      className={cx(SECTION_CLASSES)}
      data-cy="data-connector-access-section"
    >
      <h3 className="mb-4">
        <PersonBadge className={cx("bi", "me-1")} />
        Credentials
      </h3>
      <div>
        <DataConnectorPropertyValue title="Requires credentials">
          <span data-cy="requires-credentials-section">
            {anySensitiveField ? "Yes" : "No"}
          </span>
        </DataConnectorPropertyValue>
        {anySensitiveField &&
          requiredCredentials &&
          requiredCredentials.length > 0 && (
            <div className={cx("mb-4", "mt-3")}>
              <p className={cx("fw-bold", "m-0")}>Required credentials</p>
              <table
                className={cx(
                  "ps-4",
                  "mb-0",
                  "table",
                  "table-sm",
                  "table-borderless"
                )}
              >
                <tbody>
                  {requiredCredentials.map(({ name, help }, index) => {
                    const value =
                      name == null ? (
                        "unknown"
                      ) : savedCredentialFields[name] ? (
                        <span
                          className={cx(
                            "badge",
                            "bg-opacity-25",
                            "rounded-pill",
                            "text-bg-success"
                          )}
                        >
                          <Key className={cx("bi", "me-2")} /> Credentials saved
                        </span>
                      ) : storageDefinition.configuration[name]?.toString() ==
                        CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN ? (
                        <span
                          className={cx(
                            "badge",
                            "rounded-pill",
                            "text-bg-secondary"
                          )}
                        >
                          <Lock className={cx("bi", "me-2")} /> Requires
                          credentials
                        </span>
                      ) : (
                        storageDefinition.configuration[name]?.toString()
                      );
                    return (
                      <tr key={index}>
                        <td>
                          {name}
                          {help && <CredentialMoreInfo help={help} />}
                        </td>
                        <td data-cy={`${name}-value`}>{value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}

function DataConnectorViewConfiguration({
  dataConnector,
  toggleEdit,
}: Pick<DataConnectorViewProps, "dataConnector" | "toggleEdit">) {
  const storageDefinition = dataConnector.storage;
  const { permissions } = useDataConnectorPermissions({
    dataConnectorId: dataConnector.id,
  });
  const credentialFieldDefinitions = useMemo(
    () =>
      getCredentialFieldDefinitions({
        storage: storageDefinition,
        sensitive_fields: storageDefinition.sensitive_fields,
      }),
    [storageDefinition]
  );
  const requiredCredentials = useMemo(
    () =>
      credentialFieldDefinitions?.filter((field) => field.requiredCredential),
    [credentialFieldDefinitions]
  );
  const nonRequiredCredentialConfigurationKeys = Object.keys(
    storageDefinition.configuration
  ).filter((k) => !requiredCredentials?.some((f) => f.name === k));
  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace]
  );
  const hasAccessMode = useMemo(
    () => STORAGES_WITH_ACCESS_MODE.includes(storageDefinition.storage_type),
    [storageDefinition.storage_type]
  );

  return (
    <section
      className={cx(SECTION_CLASSES)}
      data-cy="data-connector-configuration-section"
    >
      <div className={cx("d-flex", "justify-content-between", "mb-4")}>
        <h3>
          <Gear className={cx("bi", "me-1")} />
          {scope === "global" ? "Configuration" : "Connection Information"}
        </h3>
        <PermissionsGuard
          disabled={null}
          enabled={
            <>
              <Button
                color="outline-primary"
                id="modify-data-connection-button"
                onClick={() => toggleEdit(2)}
                size="sm"
                tabIndex={0}
              >
                <Pencil className="bi" />
              </Button>
              <UncontrolledTooltip target="modify-data-connection-button">
                Modify connection information
              </UncontrolledTooltip>
            </>
          }
          requestedPermission="write"
          userPermissions={permissions}
        />
      </div>
      {scope !== "global" &&
        nonRequiredCredentialConfigurationKeys.map((key) => {
          const title =
            key == "provider" && hasAccessMode ? "Mode" : toCapitalized(key);
          const value = storageDefinition.configuration[key]?.toString() ?? "";
          return (
            <DataConnectorPropertyValue key={key} title={title}>
              {value}
            </DataConnectorPropertyValue>
          );
        })}
      <div>
        <DataConnectorPropertyValue title="Source path">
          {storageDefinition.source_path}
        </DataConnectorPropertyValue>
      </div>
    </section>
  );
}

function DataConnectorViewHeader({
  dataConnector,
  dataConnectorLink,
  toggleView,
  toggleEdit,
}: Omit<DataConnectorViewProps, "showView">) {
  return (
    <div className="mb-4">
      <span className={cx("small", "text-muted", "me-3")}>Data connector</span>
      <div>
        <div className={cx("float-end", "mt-1", "ms-1")}>
          <DataConnectorActions
            dataConnector={dataConnector}
            dataConnectorLink={dataConnectorLink}
            toggleView={toggleView}
            toggleEdit={toggleEdit}
          />
        </div>
        <h2 className={cx("m-0", "text-break")} data-cy="data-connector-title">
          {dataConnector.name}
        </h2>
      </div>
    </div>
  );
}

function DataConnectorViewProjects({
  dataConnector,
}: Pick<DataConnectorViewProps, "dataConnector">) {
  const { projects, isLoading } = useDataConnectorProjects({ dataConnector });
  return (
    <section
      className={cx(SECTION_CLASSES)}
      data-cy="data-connector-projects-section"
    >
      <h3 className="mb-4">
        <Folder className={cx("bi", "me-1")} />
        Projects
      </h3>
      <div>
        {isLoading && <p>Retrieving projects...</p>}
        {!isLoading && projects.length === 0 && <p>None</p>}
        <table className="table table-sm table-borderless">
          <tbody>
            {projects.map((project) => {
              if (!project) return null;

              const projectUrl = generatePath(
                ABSOLUTE_ROUTES.v2.projects.show.root,
                {
                  namespace: project.namespace,
                  slug: project.slug,
                }
              );
              return (
                <tr key={project.id}>
                  <td scope="row">
                    <Link to={projectUrl}>
                      {project.namespace}/{project.slug}
                    </Link>
                  </td>
                  <td>{project.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface DataConnectorViewMetadataProps {
  dataConnector: DataConnectorRead;
  dataConnectorPotentiallyInaccessible: boolean;
}

function DataConnectorViewMetadata({
  dataConnector,
  dataConnectorPotentiallyInaccessible,
}: DataConnectorViewMetadataProps) {
  const storageDefinition = dataConnector.storage;
  const { data: namespace, isLoading: isLoadingNamespace } =
    useGetNamespacesByNamespaceSlugQuery(
      dataConnector.namespace
        ? {
            namespaceSlug: dataConnector.namespace,
          }
        : skipToken
    );

  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace]
  );

  const namespaceUrl = useMemo(
    () =>
      scope === "global" || !namespace || !dataConnector.namespace
        ? null
        : scope === "project"
        ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
            namespace: dataConnector.namespace.split("/")[0],
            slug: dataConnector.namespace.split("/")[1],
          })
        : namespace.namespace_kind === "user"
        ? generatePath(ABSOLUTE_ROUTES.v2.users.show, {
            username: dataConnector.namespace,
          })
        : generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
            slug: dataConnector.namespace,
          }),
    [dataConnector.namespace, namespace, scope]
  );

  const identifier = useMemo(
    () =>
      scope === "global"
        ? `${dataConnector.slug}`
        : `${dataConnector.namespace}/${dataConnector.slug}`,
    [dataConnector.namespace, dataConnector.slug, scope]
  );

  const doiReference = useMemo(() => {
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
  }, [dataConnector.storage.configuration, scope, dataConnector.doi]);

  const sortedKeywords = useMemo(() => {
    if (!dataConnector.keywords) return [];
    return dataConnector.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [dataConnector.keywords]);

  const dataConnectorSource = useGetDataConnectorSource(dataConnector);

  return (
    <section className={cx("pt-3")} data-cy="data-connector-metadata-section">
      <DataConnectorPropertyValue title="Identifier">
        <div className={cx("d-flex", "justify-content-between", "mx-0")}>
          <div>{identifier}</div>
          <div>
            <Clipboard
              className={cx("border-0", "btn", "ms-1", "p-0", "shadow-none")}
              clipboardText={identifier}
            />
          </div>
        </div>
      </DataConnectorPropertyValue>

      {dataConnector.description && (
        <DataConnectorPropertyValue title="Description">
          <LazyMarkdown>{dataConnector.description}</LazyMarkdown>
        </DataConnectorPropertyValue>
      )}

      {scope === "global" ? (
        <>
          <DataConnectorPropertyValue title="Source">
            <div className={cx("align-items-center", "d-flex", "gap-1")}>
              <Journals className={cx("bi", "flex-shrink-0")} />
              DOI from {dataConnectorSource}
            </div>
          </DataConnectorPropertyValue>

          <DataConnectorPropertyValue title="DOI">
            <div
              className={cx(
                "align-items-center",
                "d-flex",
                "gap-1",
                "justify-content-between"
              )}
            >
              <a
                href={`https://doi.org/${doiReference}`}
                rel="noreferrer noopener"
                target="_blank"
              >
                {doiReference}
              </a>
              <div>
                <Clipboard
                  className={cx(
                    "border-0",
                    "btn",
                    "ms-1",
                    "p-0",
                    "shadow-none"
                  )}
                  clipboardText={
                    dataConnector.storage.configuration["doi"] as string
                  }
                />
              </div>
            </div>
          </DataConnectorPropertyValue>
        </>
      ) : (
        <DataConnectorPropertyValue title="Owner">
          <div className={cx("align-items-center", "d-flex", "gap-1")}>
            {scope === "project" ? (
              <>
                <Folder className={cx("bi", "flex-shrink-0")} />
                <Link to={namespaceUrl ?? ""}>@{dataConnector.namespace}</Link>
              </>
            ) : (
              <>
                <UserAvatar namespace={dataConnector.namespace as string} />
                <Link to={namespaceUrl ?? ""}>@{dataConnector.namespace}</Link>
                {isLoadingNamespace ? (
                  <Loader inline size={16} />
                ) : namespace?.namespace_kind === "user" ? (
                  <EntityPill
                    entityType="User"
                    size="sm"
                    tooltipPlacement="bottom"
                  />
                ) : namespace?.namespace_kind === "group" ? (
                  <EntityPill
                    entityType="Group"
                    size="sm"
                    tooltipPlacement="bottom"
                  />
                ) : null}
              </>
            )}
          </div>
        </DataConnectorPropertyValue>
      )}

      <DataConnectorPropertyValue title="Visibility">
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
        {dataConnectorPotentiallyInaccessible && (
          <WarnAlert className="mt-2" timeout={0} dismissible={false}>
            {DATA_CONNECTORS_VISIBILITY_WARNING}
          </WarnAlert>
        )}
      </DataConnectorPropertyValue>

      {dataConnector.keywords && dataConnector.keywords.length > 0 && (
        <DataConnectorPropertyValue title="Keywords">
          <KeywordContainer>
            {sortedKeywords.map((keyword, index) => (
              <KeywordBadge key={index} searchKeyword={keyword}>
                {keyword}
              </KeywordBadge>
            ))}
          </KeywordContainer>
        </DataConnectorPropertyValue>
      )}

      <DataConnectorPropertyValue title={<MountPointHead />}>
        {storageDefinition.target_path}
      </DataConnectorPropertyValue>
      <DataConnectorPropertyValue title="Access mode">
        {storageDefinition.readonly
          ? "Force Read-only"
          : "Allow Read-Write (requires adequate privileges on the storage)"}
      </DataConnectorPropertyValue>
    </section>
  );
}

function MountPointHead() {
  const ref = useRef(null);
  return (
    <>
      <span>Mount Point</span>
      <span ref={ref}>
        <InfoCircle className={cx("bi ms-1")} />
      </span>
      <UncontrolledTooltip target={ref} placement="bottom">
        This is where the data connector will be mounted during sessions.
      </UncontrolledTooltip>
    </>
  );
}
