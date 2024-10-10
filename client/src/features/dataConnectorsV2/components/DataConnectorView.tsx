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
import {
  Offcanvas,
  OffcanvasBody,
  PopoverBody,
  UncontrolledPopover,
} from "reactstrap";
import {
  Database,
  InfoCircleFill,
  Link45deg,
  UniversalAccessCircle,
} from "react-bootstrap-icons";

import { Clipboard } from "../../../components/clipboard/Clipboard";
import CrosshairIcon from "../../../components/icons/CrosshairIcon";
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

import DataConnectorActions from "./DataConnectorActions";
import useDataConnectorProjects from "./useDataConnectorProjects.hook";

function ConfigurationKeyIcon({ configKey }: { configKey: string }) {
  if (configKey === "type") {
    return <Database className={cx("bi", "me-1")} />;
  }
  if (configKey === "url" || configKey === "endpoint") {
    return <Link45deg className={cx("bi", "me-1")} />;
  }
  if (configKey === "accessMode") {
    return <UniversalAccessCircle className={cx("bi", "me-1")} />;
  }
  if (configKey === "mountPoint") {
    return <CrosshairIcon className={cx("bi", "me-1")} />;
  }
  return <span className={cx("bi", "me-1")} />;
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
      className={cx("border-top", "pt-3")}
      data-cy="data-connector-details-section"
    >
      <div>
        <h4>Access</h4>
      </div>
      <div className="mt-3" data-cy="requires-credentials-section">
        <table>
          <tbody>
            <tr>
              <td>
                <ConfigurationKeyIcon configKey="accessMode" />
              </td>
              <td>Access mode</td>
            </tr>
            <tr>
              <td></td>
              <td className={cx("fw-bold", "m-0")}>
                {storageDefinition.readonly
                  ? "Force Read-only"
                  : "Allow Read-Write (requires adequate privileges on the storage)"}
              </td>
            </tr>
            <tr>
              <td>
                <ConfigurationKeyIcon configKey="requiresCredentials" />
              </td>
              <td>Requires credentials</td>
            </tr>
            <tr>
              <td></td>
              <td className={cx("fw-bold", "m-0")}>
                {anySensitiveField ? "Yes" : "No"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
    </section>
  );
}

function DataConnectorViewConfiguration({
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
    <section
      className={cx("border-top", "pt-3")}
      data-cy="data-connector-configuration-section"
    >
      <div>
        <h4>Configuration</h4>
      </div>
      <div>
        <table>
          <tbody>
            {nonRequiredCredentialConfigurationKeys.map((key) => {
              const value =
                storageDefinition.configuration[key]?.toString() ?? "";
              return (
                <NonCredentialConfigurationRows
                  key={key}
                  keyName={key}
                  value={value}
                />
              );
            })}
            <tr>
              <td>
                <ConfigurationKeyIcon configKey="mountPoint" />
              </td>
              <td>
                <MountPointHead />
              </td>
            </tr>
            <tr>
              <td></td>
              <td className={cx("fw-bold", "m-0")}>
                {storageDefinition.target_path}
              </td>
            </tr>
            <tr>
              <td>
                <ConfigurationKeyIcon configKey="sourcePath" />
              </td>
              <td>Source path</td>
            </tr>
            <tr>
              <td></td>
              <td className={cx("fw-bold", "m-0")}>
                {storageDefinition.source_path}
              </td>
            </tr>
          </tbody>
        </table>
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
      <div
        className={cx("fw-bold", "mx-0", "my-1")}
        data-cy="data-connector-title"
      >
        {dataConnector.namespace}/{dataConnector.slug}
        <Clipboard
          className={cx("border-0", "btn", "ms-1", "p-0")}
          clipboardText={`${dataConnector.namespace}/${dataConnector.slug}`}
        ></Clipboard>
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
      className={cx("border-top", "pt-3")}
      data-cy="data-connector-projects-section"
    >
      <div>
        <h4>Projects</h4>
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

function MountPointHead() {
  const ref = useRef(null);
  return (
    <>
      <span>Mount Point</span>
      <span ref={ref}>
        <InfoCircleFill className={cx("bi ms-1")} />
      </span>
      <UncontrolledPopover target={ref} trigger="hover" placement="bottom">
        <PopoverBody>
          This is where the storage will be mounted during sessions.
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

function NonCredentialConfigurationRows({
  keyName,
  value,
}: {
  keyName: string;
  value: string;
}) {
  return (
    <>
      <tr>
        <td className="mx-5">
          <ConfigurationKeyIcon configKey={keyName} />
        </td>
        <td>{keyName}</td>
      </tr>
      <tr>
        <td></td>
        <td className={cx("fw-bold", "m-0")}>{value}</td>
      </tr>
    </>
  );
}
