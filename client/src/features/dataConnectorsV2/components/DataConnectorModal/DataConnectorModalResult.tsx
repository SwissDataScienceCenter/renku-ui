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
export type CredentialSaveStatus = "failure" | "none" | "success" | "trying";

interface DataConnectorModalResultProps {
  alreadyExisted: boolean;
  credentialSaveStatus: CredentialSaveStatus;
  dataConnectorResultName: string | undefined;
}

export default function DataConnectorModalResult({
  dataConnectorResultName,
  credentialSaveStatus,
  alreadyExisted,
}: DataConnectorModalResultProps) {
  if (credentialSaveStatus == "trying")
    return (
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          The data connector <b>{dataConnectorResultName}</b> has been
          successfully {alreadyExisted ? "updated" : "added"}; saving the
          credentials...
        </p>
      </SuccessAlert>
    );

  if (credentialSaveStatus == "success")
    return (
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          The data connector <b>{dataConnectorResultName}</b> has been
          successfully {alreadyExisted ? "updated" : "added"}, along with its
          credentials.
        </p>
      </SuccessAlert>
    );
  if (credentialSaveStatus == "failure")
    return (
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          The data connector <b>{dataConnectorResultName}</b> has been
          successfully {alreadyExisted ? "updated" : "added"},{" "}
          <b>but the credentials were not saved</b>. You can re-enter them and
          save by editing the storage.
        </p>
      </SuccessAlert>
    );

  return (
    <SuccessAlert dismissible={false} timeout={0}>
      <p className="mb-0">
        The data connector <b>{dataConnectorResultName}</b> has been
        successfully {alreadyExisted ? "updated" : "added"}.
      </p>
    </SuccessAlert>
  );
}
