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

import { SuccessAlert } from "../../../../components/Alert";
export type AuxiliaryCommandStatus = "failure" | "none" | "success" | "trying";

interface DataConnectorModalResultProps {
  alreadyExisted: boolean;
  credentialSaveStatus: AuxiliaryCommandStatus;
  dataConnectorResultName: string | undefined;
  projectLinkStatus: AuxiliaryCommandStatus;
}

export default function DataConnectorModalResult({
  alreadyExisted,
  credentialSaveStatus,
  dataConnectorResultName,
  projectLinkStatus,
}: DataConnectorModalResultProps) {
  const dataConnectorFragment = (
    <>
      The data connector <b>{dataConnectorResultName}</b> has been successfully{" "}
      {alreadyExisted ? "updated" : "added"}
    </>
  );
  return (
    <SuccessAlert dismissible={false} timeout={0}>
      <DataConnectorResultAlertContent
        dataConnectorFragment={dataConnectorFragment}
        credentialSaveStatus={credentialSaveStatus}
        projectLinkStatus={projectLinkStatus}
      />
    </SuccessAlert>
  );
}

interface DataConnectorResultAlertContentProps
  extends Pick<
    DataConnectorModalResultProps,
    "credentialSaveStatus" | "projectLinkStatus"
  > {
  dataConnectorFragment: React.ReactNode;
}
function DataConnectorResultAlertContent({
  credentialSaveStatus,
  dataConnectorFragment,
  projectLinkStatus,
}: DataConnectorResultAlertContentProps) {
  if (credentialSaveStatus == "none" && projectLinkStatus == "none") {
    return <p className="mb-0">{dataConnectorFragment}.</p>;
  }

  const credentialSaveFragment =
    credentialSaveStatus == "trying" ? (
      <li>saving the credentials...</li>
    ) : credentialSaveStatus == "success" ? (
      <li>credentials were saved</li>
    ) : credentialSaveStatus == "failure" ? (
      <li>
        <b>credentials were not saved</b>, you can re-enter them and save by
        editing the storage
      </li>
    ) : null;
  const projectLinkFragment =
    projectLinkStatus == "trying" ? (
      <li>linking the project...</li>
    ) : projectLinkStatus == "success" ? (
      <li>project was linked</li>
    ) : projectLinkStatus == "failure" ? (
      <li>
        <b>project was not linked</b>, you can link the existing data connector
      </li>
    ) : null;
  return (
    <p className="mb-0">
      {dataConnectorFragment}
      {credentialSaveFragment && <ul>{credentialSaveFragment}</ul>}
      {projectLinkFragment && <ul>{projectLinkFragment}</ul>}
    </p>
  );
}
