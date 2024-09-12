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

import { Loader } from "../../../components/Loader";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";

import { CLOUD_STORAGE_TOTAL_STEPS } from "../../project/components/cloudStorage/projectCloudStorage.constants";
import type {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageSchema,
} from "../../project/components/cloudStorage/projectCloudStorage.types";
import {
  AddCloudStorageSuccessAlert,
  type AddCloudStorageBodyContentProps,
} from "../../project/components/cloudStorage/cloudStorageModalComponents";
import {
  AddStorageAdvanced,
  AddStorageAdvancedToggle,
  AddStorageMount,
  AddStorageOptions,
  AddStorageType,
} from "../../project/components/cloudStorage/AddOrEditCloudStorage";
import type { CloudStorageSecretGet } from "../../projectsV2/api/storagesV2.api";

interface AddOrEditCloudStorageProps {
  schema: CloudStorageSchema[];
  setStorage: (newDetails: Partial<CloudStorageDetails>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storage: CloudStorageDetails;
  storageSecrets: CloudStorageSecretGet[];
}

interface AddOrEditCloudStoragePropsV2 extends AddOrEditCloudStorageProps {
  validationSucceeded: boolean;
}

export default function DataConnectorModalBody({
  addResultStorageName,
  credentialSaveStatus,
  redraw,
  schema,
  schemaError,
  schemaIsFetching,
  setStateSafe,
  setStorageDetailsSafe,
  state,
  storageDetails,
  storageId,
  storageSecrets,
  success,
  validationSucceeded,
}: AddCloudStorageBodyContentProps) {
  if (redraw) return <Loader />;
  if (success) {
    return (
      <AddCloudStorageSuccessAlert
        {...{ addResultStorageName, storageId, credentialSaveStatus }}
      />
    );
  }
  if (schemaIsFetching || !schema) return <Loader />;
  if (schemaError) return <RtkOrNotebooksError error={schemaError} />;
  return (
    <>
      {!storageId && (
        <p>
          Add published datasets from data repositories for use in your project.
          Or, connect to cloud storage to read and write custom data.
        </p>
      )}
      <AddOrEditCloudStorageV2
        schema={schema}
        setState={setStateSafe}
        setStorage={setStorageDetailsSafe}
        state={state}
        storage={storageDetails}
        storageSecrets={storageSecrets}
        validationSucceeded={validationSucceeded}
      />
    </>
  );
}

function AddOrEditCloudStorageV2({
  schema,
  setStorage,
  setState,
  state,
  storage,
  storageSecrets,
  validationSucceeded,
}: AddOrEditCloudStoragePropsV2) {
  const ContentByStep =
    state.step >= 0 && state.step <= CLOUD_STORAGE_TOTAL_STEPS
      ? mapStepToElement[state.step]
      : null;

  if (ContentByStep)
    return (
      <>
        <div className={cx("d-flex", "justify-content-end")}>
          <AddStorageAdvancedToggle state={state} setState={setState} />
        </div>
        <ContentByStep
          schema={schema}
          state={state}
          storage={storage}
          setState={setState}
          setStorage={setStorage}
          storageSecrets={storageSecrets}
          isV2={true}
          validationSucceeded={validationSucceeded}
        />
      </>
    );
  return <p>Error - not implemented yet</p>;
}

// *** Add storage: helpers *** //
interface AddStorageStepProps {
  schema: CloudStorageSchema[];
  setStorage: (newDetails: Partial<CloudStorageDetails>) => void;
  setState: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  storage: CloudStorageDetails;
  storageSecrets: CloudStorageSecretGet[];
  isV2?: boolean;
  validationSucceeded: boolean;
}

const mapStepToElement: {
  [key: number]: React.ComponentType<AddStorageStepProps>;
} = {
  0: AddStorageAdvanced,
  1: AddStorageType,
  2: AddStorageOptions,
  3: AddStorageMount,
};
