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
import { useCallback, useEffect } from "react";
import {
  ArrowRepeat,
  ChevronLeft,
  ChevronRight,
  PencilSquare,
  PlusLg,
  XLg,
} from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";

import { SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";

import { useTestCloudStorageConnectionMutation } from "../../../project/components/cloudStorage/projectCloudStorage.api";
import { CLOUD_STORAGE_TOTAL_STEPS } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import {
  AddCloudStorageState,
  CloudStorageDetailsOptions,
  TestCloudStorageConnectionParams,
} from "../../../project/components/cloudStorage/projectCloudStorage.types";

import dataConnectorFormSlice from "../../state/dataConnectors.slice";

interface DataConnectorModalForwardBackButtonProps {}

interface DataConnectorModalBackButtonProps
  extends DataConnectorModalForwardBackButtonProps {
  success: boolean;
  toggle: () => void;
}
export function DataConnectorModalBackButton({
  success,
  toggle,
}: DataConnectorModalBackButtonProps) {
  const { cloudStorageState, isActionOngoing } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
  useAppSelector((state) => state.dataConnectorFormSlice);
  const dispatch = useAppDispatch();
  if (cloudStorageState.step <= 1 || success)
    return (
      <Button
        color="outline-primary"
        data-cy="data-connector-edit-close-button"
        onClick={() => toggle()}
      >
        <XLg className={cx("bi", "me-1")} />
        {success ? "Close" : "Cancel"}
      </Button>
    );
  return (
    <Button
      color="outline-primary"
      data-cy="data-connector-edit-back-button"
      disabled={isActionOngoing}
      onClick={() => {
        dispatch(
          dataConnectorFormSlice.actions.setCloudStorageState({
            cloudStorageState: {
              step: cloudStorageState.advancedMode
                ? 0
                : cloudStorageState.step - 1,
            },
            validationResult: null,
          })
        );
      }}
    >
      <ChevronLeft className={cx("bi", "me-1")} />
      Back
    </Button>
  );
}

interface DataConnectorModalContinueButtonProps
  extends DataConnectorModalForwardBackButtonProps {
  addButtonDisableReason: string;
  addOrEditStorage: () => void;
  disableAddButton: boolean;
  disableContinueButton: boolean;
  hasStoredCredentialsInConfig: boolean;
  isResultLoading: boolean;
  dataConnectorId: string | null;
  selectedSchemaHasAccessMode: boolean;
}
export function DataConnectorModalContinueButton({
  addButtonDisableReason,
  addOrEditStorage,
  disableAddButton,
  disableContinueButton,
  hasStoredCredentialsInConfig,
  isResultLoading,
  dataConnectorId,
  selectedSchemaHasAccessMode,
}: DataConnectorModalContinueButtonProps) {
  const addButtonId = "add-data-connector-continue";
  const continueButtonId = "add-data-connector-next";
  const { cloudStorageState, flatDataConnector } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );
  const dispatch = useAppDispatch();
  const setState = useCallback(
    (newState: Partial<AddCloudStorageState>) => {
      dispatch(
        dataConnectorFormSlice.actions.setCloudStorageState({
          cloudStorageState: newState,
        })
      );
    },
    [dispatch]
  );
  if (cloudStorageState.step === 3 && cloudStorageState.completedSteps >= 2) {
    return (
      <div id={`${addButtonId}-div`} className="d-inline-block">
        <Button
          color="primary"
          data-cy="data-connector-edit-update-button"
          id={`${addButtonId}-button`}
          disabled={disableAddButton}
          onClick={() => addOrEditStorage()}
        >
          {isResultLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : dataConnectorId ? (
            <PencilSquare className={cx("bi", "me-1")} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          {dataConnectorId ? "Update" : "Add"} connector
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
    cloudStorageState.step === 2 &&
    cloudStorageState.completedSteps >= 1 &&
    !hasStoredCredentialsInConfig
  ) {
    return (
      <div id={`${continueButtonId}-div`} className="d-inline-block">
        <TestConnectionAndContinueButtons
          continueId="add-data-connector-continue"
          step={cloudStorageState.step}
          testId="test-data-connector"
        />
        {disableContinueButton && (
          <UncontrolledTooltip
            placement="top"
            target={`${continueButtonId}-div`}
          >
            {!flatDataConnector.schema
              ? "Please select a storage type"
              : selectedSchemaHasAccessMode
              ? "Please select a mode or change storage type"
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
        data-cy="data-connector-edit-next-button"
        disabled={disableContinueButton}
        onClick={() => {
          setState({
            completedSteps:
              cloudStorageState.step === 0
                ? CLOUD_STORAGE_TOTAL_STEPS - 1
                : cloudStorageState.step > cloudStorageState.completedSteps
                ? cloudStorageState.step
                : cloudStorageState.completedSteps,
            step:
              cloudStorageState.step === 0
                ? CLOUD_STORAGE_TOTAL_STEPS
                : cloudStorageState.step + 1,
          });
        }}
      >
        Next <ChevronRight className={cx("bi", "ms-1")} />
      </Button>
      {disableContinueButton && (
        <UncontrolledTooltip placement="top" target={`${continueButtonId}-div`}>
          {!flatDataConnector.schema
            ? "Please select a storage type"
            : selectedSchemaHasAccessMode
            ? "Please select a mode or change storage type"
            : "Please select a provider or change storage type"}
        </UncontrolledTooltip>
      )}
    </div>
  );
}

export function DataConnectorConnectionTestResult() {
  const { cloudStorageState, isActionOngoing, success, validationResult } =
    useAppSelector((state) => state.dataConnectorFormSlice);
  if (
    cloudStorageState.step !== 2 ||
    cloudStorageState.completedSteps < 1 ||
    success ||
    validationResult == null ||
    isActionOngoing
  )
    return null;
  if (validationResult.error)
    return (
      <div
        className={cx("w-100", "my-0")}
        data-cy="cloud-storage-connection-failure"
      >
        <RtkOrNotebooksError error={validationResult.error} />
      </div>
    );
  return (
    <div
      className={cx("w-100", "my-0")}
      data-cy="cloud-storage-connection-success"
    >
      <SuccessAlert timeout={0}>
        <p className="p-0">The connection to the storage works correctly.</p>
      </SuccessAlert>
    </div>
  );
}

interface TestConnectionAndContinueButtonsProps
  extends DataConnectorModalForwardBackButtonProps {
  continueId: string;
  step: number;
  testId: string;
}
function TestConnectionAndContinueButtons({
  continueId,
  step,
  testId,
}: TestConnectionAndContinueButtonsProps) {
  const dispatch = useAppDispatch();
  const { flatDataConnector, isActionOngoing, validationResultIsCurrent } =
    useAppSelector((state) => state.dataConnectorFormSlice);

  const [validateCloudStorageConnection, validationResult] =
    useTestCloudStorageConnectionMutation();

  useEffect(() => {
    if (
      !isActionOngoing &&
      !validationResultIsCurrent &&
      validationResult != null
    ) {
      dispatch(
        dataConnectorFormSlice.actions.setValidationResult({
          validationResult: null,
        })
      );
      validationResult.reset();
    }
  }, [dispatch, isActionOngoing, validationResult, validationResultIsCurrent]);

  const validateConnection = useCallback(() => {
    const validateParameters: TestCloudStorageConnectionParams = {
      configuration: {
        type: flatDataConnector.schema,
      },
      source_path: flatDataConnector.sourcePath ?? "/",
    };
    if (flatDataConnector.provider) {
      validateParameters.configuration.provider = flatDataConnector.provider;
    }
    if (
      flatDataConnector.options &&
      Object.keys(flatDataConnector.options).length > 0
    ) {
      const options = flatDataConnector.options as CloudStorageDetailsOptions;
      Object.entries(options).forEach(([key, value]) => {
        if (value != undefined && value !== "") {
          validateParameters.configuration[key] = value;
        }
      });
    }
    dispatch(
      dataConnectorFormSlice.actions.setActionOngoing({ isActionOngoing: true })
    );
    validateCloudStorageConnection(validateParameters).then((result) => {
      const validationResult =
        "data" in result
          ? { isSuccess: true, isError: false, error: null }
          : { isSuccess: false, isError: true, error: result.error };

      dispatch(
        dataConnectorFormSlice.actions.setValidationResult({
          validationResult,
          isActionOngoing: false,
        })
      );
    });
  }, [dispatch, flatDataConnector, validateCloudStorageConnection]);
  const buttonTestId = `${testId}-button`;
  const divTestId = `${testId}-div`;
  const testConnectionContent =
    validationResult.isSuccess || validationResult.isError ? (
      <>
        Re-test <ArrowRepeat className="bi" />
      </>
    ) : validationResult.isLoading ? (
      <>
        Test connection <Loader inline size={16} />
      </>
    ) : (
      <>
        Test connection <ChevronRight className={cx("bi", "me-1")} />
      </>
    );
  const testConnectionColor = validationResult.isSuccess
    ? "outline-primary"
    : validationResult.isError
    ? "danger"
    : "outline-primary";
  const testConnectionSection = (
    <div id={divTestId} className="d-inline-block">
      <Button
        color={testConnectionColor}
        id={buttonTestId}
        data-cy={buttonTestId}
        disabled={validationResult.isLoading}
        onClick={() => validateConnection()}
      >
        {testConnectionContent}
      </Button>
    </div>
  );

  const buttonContinueId = `${continueId}-button`;
  const divContinueId = `${continueId}-div`;
  const continueContent = validationResult.isSuccess ? (
    <>
      Continue <ChevronRight className="bi" />
    </>
  ) : validationResult.isError ? (
    <>
      Skip Test <ChevronRight className="bi" />
    </>
  ) : null;
  const continueColorClass = validationResult.isSuccess
    ? "btn-primary"
    : validationResult.isError
    ? "btn-outline-danger"
    : "btn-primary";
  const continueSection =
    !validationResult.isError && !validationResult.isSuccess ? null : (
      <div id={divContinueId} className={cx("d-inline-block", "ms-2")}>
        <Button
          color=""
          id={buttonContinueId}
          data-cy={buttonContinueId}
          className={cx(continueColorClass)}
          disabled={validationResult.isLoading}
          onClick={() => {
            dispatch(
              dataConnectorFormSlice.actions.setValidationResult({
                validationResult: {
                  isSuccess: validationResult.isSuccess,
                  isError: validationResult.isError,
                  error: validationResult.error,
                },
              })
            );
            if (validationResult.isError || validationResult.isSuccess) {
              validationResult.reset();
            }
            dispatch(
              dataConnectorFormSlice.actions.setCloudStorageState({
                cloudStorageState: {
                  step: step === 0 ? CLOUD_STORAGE_TOTAL_STEPS : step + 1,
                  completedSteps:
                    step === 0 ? CLOUD_STORAGE_TOTAL_STEPS - 1 : step,
                },
              })
            );
          }}
        >
          {continueContent}
        </Button>
        {validationResult.isError && (
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
