/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import {
  ArrowRepeat,
  ChevronLeft,
  ChevronRight,
  CloudFill,
  Database,
  PencilSquare,
  PlusLg,
  XLg,
} from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";

import { SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import AddOrEditCloudStorage, {
  AddOrEditCloudStorageV2,
} from "./AddOrEditCloudStorage";
import { useTestCloudStorageConnectionMutation } from "./projectCloudStorage.api";
import { CLOUD_STORAGE_TOTAL_STEPS } from "./projectCloudStorage.constants";
import {
  AddCloudStorageState,
  CloudStorageDetails,
  CloudStorageSchema,
  CredentialSaveStatus,
} from "./projectCloudStorage.types";
import type { CloudStorageSecretGet } from "../../../../features/projectsV2/api/storagesV2.api";

import { SerializedError } from "@reduxjs/toolkit";

interface AddCloudStorageForwardBackButtonProps {
  setStateSafe: (newState: Partial<AddCloudStorageState>) => void;
  state: AddCloudStorageState;
  validationResult: ReturnType<typeof useTestCloudStorageConnectionMutation>[1];
}

interface AddCloudStorageBackButtonProps
  extends AddCloudStorageForwardBackButtonProps {
  success: boolean;
  toggle: () => void;
}
export function AddCloudStorageBackButton({
  setStateSafe,
  state,
  success,
  toggle,
  validationResult,
}: AddCloudStorageBackButtonProps) {
  if (state.step <= 1 || success)
    return (
      <Button
        color="outline-primary"
        data-cy="cloud-storage-edit-close-button"
        onClick={() => toggle()}
      >
        <XLg className={cx("bi", "me-1")} />
        {success ? "Close" : "Cancel"}
      </Button>
    );
  return (
    <Button
      color="outline-primary"
      data-cy="cloud-storage-edit-back-button"
      disabled={validationResult.isLoading}
      onClick={() => {
        if (!validationResult.isUninitialized) validationResult.reset();
        setStateSafe({
          step: state.advancedMode ? 0 : state.step - 1,
        });
      }}
    >
      <ChevronLeft className={cx("bi", "me-1")} />
      Back
    </Button>
  );
}

interface AddCloudStorageBodyContentProps
  extends AddCloudStorageHeaderContentProps {
  addResultStorageName: string | undefined;
  credentialSaveStatus: CredentialSaveStatus;
  redraw: boolean;
  schema: CloudStorageSchema[] | undefined;
  schemaError: FetchBaseQueryError | SerializedError | undefined;
  schemaIsFetching: boolean;
  setStateSafe: (newState: Partial<AddCloudStorageState>) => void;
  setStorageDetailsSafe: (
    newStorageDetails: Partial<CloudStorageDetails>
  ) => void;
  state: AddCloudStorageState;
  storageDetails: CloudStorageDetails;
  storageSecrets: CloudStorageSecretGet[];
  success: boolean;
  validationSucceeded: boolean;
}
export function AddCloudStorageBodyContent({
  addResultStorageName,
  credentialSaveStatus,
  isV2,
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
  if (!isV2) {
    return (
      <AddOrEditCloudStorage
        schema={schema}
        setState={setStateSafe}
        setStorage={setStorageDetailsSafe}
        state={state}
        storage={storageDetails}
        storageSecrets={[]}
      />
    );
  }
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

interface AddCloudStorageHeaderContentProps {
  isV2: boolean;
  storageId: string | null;
}
export function AddCloudStorageHeaderContent({
  storageId,
  isV2,
}: AddCloudStorageHeaderContentProps) {
  if (isV2)
    return (
      <>
        <Database className={cx("bi", "me-1")} /> {storageId ? "Edit" : "Add"}{" "}
        data source
      </>
    );
  return (
    <>
      <CloudFill className={cx("bi", "me-1")} />
      {storageId ? "Edit" : "Add"} Cloud Storage
    </>
  );
}

interface AddCloudStorageContinueButtonProps
  extends AddCloudStorageForwardBackButtonProps {
  addButtonDisableReason: string;
  addOrEditStorage: () => void;
  disableAddButton: boolean;
  disableContinueButton: boolean;
  hasStoredCredentialsInConfig: boolean;
  isResultLoading: boolean;
  setValidationSucceeded: (succeeded: boolean) => void;
  storageDetails: CloudStorageDetails;
  storageId: string | null;
  validateConnection: () => void;
}
export function AddCloudStorageContinueButton({
  addButtonDisableReason,
  addOrEditStorage,
  disableAddButton,
  disableContinueButton,
  hasStoredCredentialsInConfig,
  isResultLoading,
  setStateSafe,
  setValidationSucceeded,
  state,
  storageDetails,
  storageId,
  validateConnection,
  validationResult,
}: AddCloudStorageContinueButtonProps) {
  const addButtonId = "add-cloud-storage-continue";
  const continueButtonId = "add-cloud-storage-next";
  if (state.step === 3 && state.completedSteps >= 2) {
    return (
      <div id={`${addButtonId}-div`} className="d-inline-block">
        <Button
          color="primary"
          data-cy="cloud-storage-edit-update-button"
          id={`${addButtonId}-button`}
          disabled={disableAddButton}
          onClick={() => addOrEditStorage()}
        >
          {isResultLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : storageId ? (
            <PencilSquare className={cx("bi", "me-1")} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          {storageId ? "Update" : "Add"} storage
        </Button>
        {disableAddButton && (
          <UncontrolledTooltip placement="top" target={`${addButtonId}-div`}>
            {addButtonDisableReason}
          </UncontrolledTooltip>
        )}
      </div>
    );
  }
  if (
    state.step === 2 &&
    state.completedSteps >= 1 &&
    !hasStoredCredentialsInConfig
  ) {
    return (
      <div id={`${continueButtonId}-div`} className="d-inline-block">
        <TestConnectionAndContinueButtons
          actionState={setStateSafe}
          actionTest={validateConnection}
          continueId="add-cloud-storage-continue"
          resetTest={validationResult.reset}
          setValidationSucceeded={setValidationSucceeded}
          step={state.step}
          testId="test-cloud-storage"
          testIsFailure={validationResult.isError}
          testIsOngoing={validationResult.isLoading}
          testIsSuccess={validationResult.isSuccess}
        />
        {disableContinueButton && (
          <UncontrolledTooltip
            placement="top"
            target={`${continueButtonId}-div`}
          >
            {!storageDetails.schema
              ? "Please select a storage type"
              : "Please select a provider or change storage type"}
          </UncontrolledTooltip>
        )}
      </div>
    );
  }
  return (
    <div id={`${continueButtonId}-div`} className="d-inline-block">
      <Button
        color="primary"
        id={`${continueButtonId}-button`}
        data-cy="cloud-storage-edit-next-button"
        disabled={disableContinueButton}
        onClick={() => {
          setStateSafe({
            completedSteps:
              state.step === 0
                ? CLOUD_STORAGE_TOTAL_STEPS - 1
                : state.step > state.completedSteps
                ? state.step
                : state.completedSteps,
            step: state.step === 0 ? CLOUD_STORAGE_TOTAL_STEPS : state.step + 1,
          });
        }}
      >
        Next <ChevronRight className={cx("bi", "ms-1")} />
      </Button>
      {disableContinueButton && (
        <UncontrolledTooltip placement="top" target={`${continueButtonId}-div`}>
          {!storageDetails.schema
            ? "Please select a storage type"
            : "Please select a provider or change storage type"}
        </UncontrolledTooltip>
      )}
    </div>
  );
}

interface AddCloudStorageConnectionTestResultProps {
  validationResult: ReturnType<typeof useTestCloudStorageConnectionMutation>[1];
}

export function AddCloudStorageConnectionTestResult({
  validationResult,
}: AddCloudStorageConnectionTestResultProps) {
  if (validationResult.isUninitialized || validationResult.isLoading)
    return null;
  if (validationResult.error)
    return (
      <div className={cx("w-100", "my-0")}>
        <RtkOrNotebooksError error={validationResult.error} />
      </div>
    );
  return (
    <div className={cx("w-100", "my-0")}>
      {" "}
      <SuccessAlert timeout={0}>
        <p className="p-0">The connection to the storage works correctly.</p>
      </SuccessAlert>
    </div>
  );
}

type AddCloudStorageSuccessAlertProps = Pick<
  AddCloudStorageBodyContentProps,
  "addResultStorageName" | "credentialSaveStatus" | "storageId"
>;

function AddCloudStorageSuccessAlert({
  addResultStorageName,
  credentialSaveStatus,
  storageId,
}: AddCloudStorageSuccessAlertProps) {
  if (credentialSaveStatus == "trying")
    return (
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          The storage {addResultStorageName} has been successfully{" "}
          {storageId ? "updated" : "added"}; saving the credentials...
        </p>
      </SuccessAlert>
    );

  if (credentialSaveStatus == "success")
    return (
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          The storage {addResultStorageName} has been successfully{" "}
          {storageId ? "updated" : "added"}, along with its credentials.
        </p>
      </SuccessAlert>
    );
  if (credentialSaveStatus == "failure")
    return (
      <SuccessAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          The storage {addResultStorageName} has been successfully{" "}
          {storageId ? "updated" : "added"},{" "}
          <b>but the credentials were not saved</b>. You can re-enter them and
          save by editing the storage.
        </p>
      </SuccessAlert>
    );

  return (
    <SuccessAlert dismissible={false} timeout={0}>
      <p className="mb-0">
        The storage {addResultStorageName} has been successfully{" "}
        {storageId ? "updated" : "added"}.
      </p>
    </SuccessAlert>
  );
}

interface TestConnectionAndContinueButtonsProps {
  actionState: (newState: Partial<AddCloudStorageState>) => void;
  actionTest: () => void;
  continueId: string;
  resetTest: () => void;
  setValidationSucceeded: AddCloudStorageContinueButtonProps["setValidationSucceeded"];
  step: number;
  testId: string;
  testIsFailure: boolean;
  testIsOngoing: boolean;
  testIsSuccess: boolean;
}
function TestConnectionAndContinueButtons({
  actionState,
  actionTest,
  continueId,
  resetTest,
  setValidationSucceeded,
  step,
  testId,
  testIsFailure,
  testIsOngoing,
  testIsSuccess,
}: TestConnectionAndContinueButtonsProps) {
  const buttonTestId = `${testId}-button`;
  const divTestId = `${testId}-div`;
  const testConnectionContent =
    testIsSuccess || testIsFailure ? (
      <>
        Re-test <ArrowRepeat className="bi" />
      </>
    ) : testIsOngoing ? (
      <>
        Testing connection <Loader inline size={16} />
      </>
    ) : (
      <>
        Test connection <ChevronRight className={cx("bi", "me-1")} />
      </>
    );
  const testConnectionColor = testIsSuccess
    ? "outline-primary"
    : testIsFailure
    ? "danger"
    : "outline-primary";
  const testConnectionSection = (
    <div id={divTestId} className="d-inline-block">
      <Button
        color={testConnectionColor}
        id={buttonTestId}
        data-cy={buttonTestId}
        disabled={testIsOngoing}
        onClick={() => actionTest()}
      >
        {testConnectionContent}
      </Button>
    </div>
  );

  const buttonContinueId = `${continueId}-button`;
  const divContinueId = `${continueId}-div`;
  const continueContent = testIsSuccess ? (
    <>
      Continue <ChevronRight className="bi" />
    </>
  ) : testIsFailure ? (
    <>
      Skip Test <ChevronRight className="bi" />
    </>
  ) : null;
  const continueColorClass = testIsSuccess
    ? "btn-primary"
    : testIsFailure
    ? "btn-outline-danger"
    : "btn-primary";
  const continueSection =
    !testIsFailure && !testIsSuccess ? null : (
      <div id={divContinueId} className={cx("d-inline-block", "ms-2")}>
        <Button
          color=""
          id={buttonContinueId}
          data-cy={buttonContinueId}
          className={cx(continueColorClass)}
          disabled={testIsOngoing}
          onClick={() => {
            setValidationSucceeded(testIsSuccess);
            if (testIsFailure || testIsSuccess) {
              resetTest();
            }
            actionState({
              step: step === 0 ? CLOUD_STORAGE_TOTAL_STEPS : step + 1,
              completedSteps: step === 0 ? CLOUD_STORAGE_TOTAL_STEPS - 1 : step,
            });
          }}
        >
          {continueContent}
        </Button>
        {testIsFailure && (
          <UncontrolledTooltip placement="top" target={divContinueId}>
            The connection is not working as configured. You can make changes
            and try again, or skip and continue.
          </UncontrolledTooltip>
        )}
      </div>
    );

  return (
    <div className="d-inline-block">
      {testConnectionSection}
      {continueSection}
    </div>
  );
}
