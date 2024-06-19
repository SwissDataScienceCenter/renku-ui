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
import { ArrowLeft } from "react-bootstrap-icons";
import { Offcanvas, OffcanvasBody } from "reactstrap";
import { CredentialMoreInfo } from "../../../project/components/cloudStorage/CloudStorageItem";
import { getCredentialFieldDefinitions } from "../../../project/utils/projectCloudStorage.utils";
import type { CloudStorageGetRead } from "../../../projectsV2/api/storagesV2.api";
import { DataSourceActions } from "./DataSourceDisplay";

interface DataSourceViewProps {
  storage: CloudStorageGetRead;
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

  const credentialFieldDefinitions = useMemo(
    () => getCredentialFieldDefinitions(storage),
    [storage]
  );
  const requiredCredentials = useMemo(
    () =>
      credentialFieldDefinitions?.filter((field) => field.requiredCredential),
    [credentialFieldDefinitions]
  );

  return (
    <Offcanvas
      key={`data-source-details-${storageDefinition.storage_id}`}
      className="bg-white"
      toggle={setToggleView}
      isOpen={toggleView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody>
        <div
          className="d-flex justify-content-start gap-2 align-items-center mb-4"
          role="button"
          onClick={setToggleView}
          data-cy="data-source-view-back-button"
        >
          <ArrowLeft size={24} />
          Back
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <label className="fst-italic fs-small">Data source</label>
            <h2 className="fw-bold" data-cy="data-source-title">
              {storageDefinition.name}
            </h2>
          </div>
          <DataSourceActions storage={storage} projectId={projectId} />
        </div>
        <section data-cy="data-source-details-section">
          <div className="mt-3">
            <div className={cx("fs-small", "fw-bold")}>
              Mount point {"("}this is where the storage will be mounted during
              sessions{")"}
            </div>
            <div>{storageDefinition.target_path}</div>
          </div>
          {Object.keys(storageDefinition.configuration).map((key) => (
            <div className="mt-2" key={key}>
              <div>
                <small className="text-capitalize fw-bold">{key}</small>
              </div>
              <div>{storageDefinition.configuration[key]?.toString()}</div>
            </div>
          ))}
          <div className="mt-3">
            <div>
              <small className="fw-bold">Source path</small>
            </div>
            <div>{storageDefinition.source_path}</div>
          </div>
          <div className="mt-3" data-cy="requires-credentials-section">
            <div>
              <small className="fw-bold">Requires credentials</small>
            </div>
            <div>{anySensitiveField ? "Yes" : "No"}</div>
          </div>
          {anySensitiveField &&
            requiredCredentials &&
            requiredCredentials.length > 0 && (
              <div className="mt-3">
                <div>
                  <small className="fw-bold">Required credentials</small>
                </div>
                <ul className={cx("ps-4", "mb-0")}>
                  {requiredCredentials.map(({ name, help }, index) => (
                    <li key={index}>
                      {name}
                      {help && <CredentialMoreInfo help={help} />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          <div className="mt-3">
            <div>
              <small className="fw-bold">Access mode</small>
            </div>
            <div>
              {storageDefinition.readonly
                ? "Force Read-only"
                : "Allow Read-Write (requires adequate privileges on the storage)"}
            </div>
          </div>
        </section>
      </OffcanvasBody>
    </Offcanvas>
  );
}
