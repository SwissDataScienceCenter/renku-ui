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
import { useMemo } from "react";
import { Offcanvas, OffcanvasBody } from "reactstrap";

import { CredentialMoreInfo } from "../../../project/components/cloudStorage/CloudStorageItem";
import { CLOUD_STORAGE_SAVED_SECRET_DISPLAY_VALUE } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import { getCredentialFieldDefinitions } from "../../../project/utils/projectCloudStorage.utils";
import type { CloudStorageGetV2Read } from "../../../projectsV2/api/storagesV2.api";
import { storageSecretNameToFieldName } from "../../../secrets/secrets.utils";
import { DataSourceActions } from "./DataSourceDisplay";

interface DataSourceViewProps {
  storage: CloudStorageGetV2Read;
  toggleView: boolean;
  setToggleView: () => void;
  projectId: string;
}
export function DataSourceView({
  projectId,
  storage,
  setToggleView,
  toggleView,
}: DataSourceViewProps) {
  const storageDefinition = storage.storage;
  const sensitiveFields = storage.sensitive_fields
    ? storage.sensitive_fields?.map((f) => f.name)
    : [];
  const anySensitiveField = Object.keys(storageDefinition.configuration).some(
    (key) => sensitiveFields.includes(key)
  );
  const storageSecrets = storage.secrets;
  const savedCredentialFields =
    storageSecrets?.reduce((acc: Record<string, string>, s) => {
      acc[storageSecretNameToFieldName(s)] = s.name;
      return acc;
    }, {}) ?? {};
  const credentialFieldDefinitions = useMemo(
    () => getCredentialFieldDefinitions(storage),
    [storage]
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
    <Offcanvas
      key={`data-source-details-${storageDefinition.storage_id}`}
      toggle={setToggleView}
      isOpen={toggleView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div className="mb-3">
          <button
            aria-label="Close"
            className="btn-close"
            data-cy="data-source-view-back-button"
            data-bs-dismiss="offcanvas"
            onClick={setToggleView}
          ></button>
        </div>

        <div className="mb-4">
          <div className={cx("d-flex", "justify-content-between")}>
            <h2 className="m-0" data-cy="data-source-title">
              {storageDefinition.name}
            </h2>
            <div className="my-auto">
              <DataSourceActions storage={storage} projectId={projectId} />
            </div>
          </div>

          <p className={cx("fst-italic", "m-0")}>Data source</p>
        </div>
        <section data-cy="data-source-details-section">
          <div>
            <p className={cx("fw-bold", "m-0")}>
              Mount point {"("}this is where the storage will be mounted during
              sessions{")"}
            </p>
            <p>{storageDefinition.target_path}</p>
          </div>
          {nonRequiredCredentialConfigurationKeys.map((key) => {
            const value = storageDefinition.configuration[key]?.toString();
            return (
              <div key={key}>
                <p className={cx("fw-bold", "m-0")}>{key}</p>
                <p>{value}</p>
              </div>
            );
          })}
          <div className="mt-3">
            <div>
              <small className="fw-bold">Source path</small>
            </div>
            <div>{storageDefinition.source_path}</div>
          </div>
          <div data-cy="requires-credentials-section">
            <p className={cx("fw-bold", "m-0")}>Requires credentials</p>
            <p>{anySensitiveField ? "Yes" : "No"}</p>
          </div>
          {anySensitiveField &&
            requiredCredentials &&
            requiredCredentials.length > 0 && (
              <div>
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
          <div className="mt-3">
            <p className={cx("fw-bold", "mb-0")}>Access mode</p>
            <p>
              {storageDefinition.readonly
                ? "Force Read-only"
                : "Allow Read-Write (requires adequate privileges on the storage)"}
            </p>
          </div>
        </section>
      </OffcanvasBody>
    </Offcanvas>
  );
}
