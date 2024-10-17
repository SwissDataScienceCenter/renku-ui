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
import cx from "classnames";
import { useMemo, useRef } from "react";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Offcanvas, OffcanvasBody, UncontrolledTooltip } from "reactstrap";
import {
  InfoCircleFill,
  Folder,
  Gear,
  PersonBadge,
} from "react-bootstrap-icons";

import { Clipboard } from "../../../components/clipboard/Clipboard";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

import { CredentialMoreInfo } from "../../project/components/cloudStorage/CloudStorageItem";
import { CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE } from "../../project/components/cloudStorage/projectCloudStorage.constants";
import { getCredentialFieldDefinitions } from "../../project/utils/projectCloudStorage.utils";
import type {
  DataConnectorRead,
  DataConnectorToProjectLink,
} from "../api/data-connectors.api";
import { useGetDataConnectorsByDataConnectorIdSecretsQuery } from "../api/data-connectors.enhanced-api";
import { storageSecretNameToFieldName } from "../../secrets/secrets.utils";
import { toCapitalized } from "../../../utils/helpers/HelperFunctions";

import DataConnectorActions from "./DataConnectorActions";
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
}
export default function DataConnectorView({
  dataConnector,
  dataConnectorLink,
  showView,
  toggleView,
}: DataConnectorViewProps) {
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
          {...{ dataConnector, dataConnectorLink, toggleView }}
        />
        <DataConnectorViewMetadata dataConnector={dataConnector} />
        <DataConnectorViewConfiguration dataConnector={dataConnector} />
        <DataConnectorViewProjects dataConnector={dataConnector} />
        <DataConnectorViewAccess dataConnector={dataConnector} />
      </OffcanvasBody>
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
      <h4 className="mb-4">
        <PersonBadge className={cx("bi", "me-1")} />
        Credentials
      </h4>
      <div>
        <DataConnectorPropertyValue title="Requires credentials">
          <span data-cy="requires-credentials-section">
            {anySensitiveField ? "Yes" : "No"}
          </span>
        </DataConnectorPropertyValue>
        {anySensitiveField &&
          requiredCredentials &&
          requiredCredentials.length > 0 && (
            <div className="mt-3">
              <p className={cx("fw-bold", "m-0")}>Required credentials</p>
              <table className={cx("ps-4", "mb-0", "table", "table-sm")}>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredCredentials.map(({ name, help }, index) => {
                    const value =
                      name == null
                        ? "unknown"
                        : savedCredentialFields[name]
                        ? CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE
                        : storageDefinition.configuration[name]?.toString();
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
        <DataConnectorPropertyValue title="Access mode">
          {storageDefinition.readonly
            ? "Force Read-only"
            : "Allow Read-Write (requires adequate privileges on the storage)"}
        </DataConnectorPropertyValue>
      </div>
    </section>
  );
}

function DataConnectorViewConfiguration({
  dataConnector,
}: Pick<DataConnectorViewProps, "dataConnector">) {
  const storageDefinition = dataConnector.storage;

  return (
    <section
      className={cx(SECTION_CLASSES)}
      data-cy="data-connector-configuration-section"
    >
      <div>
        <h4 className="mb-4">
          <Gear className={cx("bi", "me-1")} />
          Configuration
        </h4>
      </div>
      <div>
        <DataConnectorPropertyValue title="Source path">
          {storageDefinition.source_path}
        </DataConnectorPropertyValue>
        <DataConnectorPropertyValue title={<MountPointHead />}>
          {storageDefinition.target_path}
        </DataConnectorPropertyValue>
      </div>
    </section>
  );
}

function DataConnectorViewHeader({
  dataConnector,
  dataConnectorLink,
  toggleView,
}: Omit<DataConnectorViewProps, "showView">) {
  return (
    <div className="mb-4">
      <div className={cx("d-flex", "justify-content-between")}>
        <h2 className="m-0" data-cy="data-connector-title">
          {dataConnector.name}
        </h2>
        <div className="my-auto">
          <DataConnectorActions
            dataConnector={dataConnector}
            dataConnectorLink={dataConnectorLink}
            toggleView={toggleView}
          />
        </div>
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
      <div>
        <h4>
          <Folder className={cx("bi", "me-1")} /> Projects
        </h4>
      </div>
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
                  <th scope="row">
                    <Link to={projectUrl}>
                      {project.namespace}/{project.slug}
                    </Link>
                  </th>
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

function DataConnectorViewMetadata({
  dataConnector,
}: Pick<DataConnectorViewProps, "dataConnector">) {
  const storageDefinition = dataConnector.storage;
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

  return (
    <section className={cx("pt-3")} data-cy="data-connector-metadata-section">
      <DataConnectorPropertyValue title="ID">
        <div className={cx("d-flex", "justify-content-between", "mx-0")}>
          <div>
            {dataConnector.namespace}/{dataConnector.slug}
          </div>
          <div>
            <Clipboard
              className={cx("border-0", "btn", "ms-1", "p-0")}
              clipboardText={`${dataConnector.namespace}/${dataConnector.slug}`}
            ></Clipboard>
          </div>
        </div>
      </DataConnectorPropertyValue>
      <DataConnectorPropertyValue title="Owner">
        {dataConnector.namespace}
      </DataConnectorPropertyValue>
      {nonRequiredCredentialConfigurationKeys.map((key) => {
        const title = toCapitalized(key);
        const value = storageDefinition.configuration[key]?.toString() ?? "";
        return (
          <DataConnectorPropertyValue key={key} title={title}>
            {value}
          </DataConnectorPropertyValue>
        );
      })}
    </section>
  );
}

function MountPointHead() {
  const ref = useRef(null);
  return (
    <>
      <span>Mount Point</span>
      <span ref={ref}>
        <InfoCircleFill className={cx("bi ms-1")} />
      </span>
      <UncontrolledTooltip target={ref} placement="bottom">
        This is where the data connector will be mounted during sessions.
      </UncontrolledTooltip>
    </>
  );
}
