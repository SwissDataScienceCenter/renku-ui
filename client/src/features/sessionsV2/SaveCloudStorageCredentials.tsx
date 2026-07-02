/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useEffect, useMemo, useRef, useState } from "react";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ProgressStepsIndicator, {
  ProgressStyle,
  ProgressType,
  StatusStepProgressBar,
  StepsProgressBar,
} from "~/components/progress/ProgressSteps";
import { storageDefinitionAfterSavingCredentialsFromConfig } from "../cloudStorage/projectCloudStorage.utils";
import { usePatchDataConnectorsByDataConnectorIdSecretsMutation } from "../dataConnectorsV2/api/data-connectors.enhanced-api";
import { shouldCloudStorageSaveCredentials } from "./sessionLaunchValidation.utils";
import type { SessionStartDataConnectorConfiguration } from "./startSessionOptionsV2.types";

import progressBoxStyles from "~/components/progress/ProgressBox.module.scss";

interface SaveCloudStorageCredentialsProps {
  dataConnectors: SessionStartDataConnectorConfiguration[];
  onComplete: (configs: SessionStartDataConnectorConfiguration[]) => void;
  title?: string;
}

export default function SaveCloudStorageCredentials({
  dataConnectors,
  onComplete,
  title = "Saving credentials",
}: SaveCloudStorageCredentialsProps) {
  const [steps, setSteps] = useState<StepsProgressBar[]>([]);
  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();

  const credentialsToSave = useMemo(() => {
    return dataConnectors
      .filter(shouldCloudStorageSaveCredentials)
      .map((cs) => ({
        storageName: cs.dataConnector.name,
        storageId: cs.dataConnector.id,
        secrets: cs.sensitiveFieldValues,
      }));
  }, [dataConnectors]);

  const [results, setResults] = useState<StatusStepProgressBar[]>(
    credentialsToSave.map(() => StatusStepProgressBar.WAITING),
  );

  const [index, setIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);
  const [failedError, setFailedError] =
    useState<typeof saveCredentialsResult.error>(undefined);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const theSteps = credentialsToSave.map((cs, i) => ({
      id: i,
      status: results[i],
      step: `Saving credentials for ${cs.storageName}`,
    }));
    // TODO: fix react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSteps(theSteps);
  }, [credentialsToSave, results]);

  useEffect(() => {
    if (
      hasFailed ||
      credentialsToSave.length < 1 ||
      index >= credentialsToSave.length
    )
      return;
    // TODO: fix react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = StatusStepProgressBar.EXECUTING;
      return newResults;
    });
    const storage = credentialsToSave[index];
    saveCredentials({
      dataConnectorId: storage.storageId,
      dataConnectorSecretPatchList: Object.entries(storage.secrets).map(
        ([key, value]) => ({
          name: key,
          value,
        }),
      ),
    });
  }, [credentialsToSave, hasFailed, index, saveCredentials]);

  useEffect(() => {
    if (
      saveCredentialsResult.isUninitialized ||
      saveCredentialsResult.isLoading
    )
      return;
    if (saveCredentialsResult.data != null) {
      // TODO: fix react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults((prev) => {
        const newResults = [...prev];
        newResults[index] = StatusStepProgressBar.READY;
        return newResults;
      });
      saveCredentialsResult.reset();
      setIndex((prev) => prev + 1);
      return;
    }
    if (saveCredentialsResult.error != null) {
      setResults((prev) => {
        const newResults = [...prev];
        newResults[index] = StatusStepProgressBar.FAILED;
        return newResults;
      });
      setFailedError(saveCredentialsResult.error);
      setHasFailed(true);
      saveCredentialsResult.reset();
    }
  }, [index, saveCredentialsResult]);

  useEffect(() => {
    if (
      hasFailed ||
      saveCredentialsResult.isLoading ||
      hasCompletedRef.current
    ) {
      return;
    }
    if (index >= credentialsToSave.length) {
      hasCompletedRef.current = true;
      const cloudStorageConfigs = dataConnectors.map((cs) =>
        storageDefinitionAfterSavingCredentialsFromConfig(cs),
      );
      onComplete(cloudStorageConfigs);
    }
  }, [
    credentialsToSave.length,
    dataConnectors,
    hasFailed,
    index,
    onComplete,
    saveCredentialsResult.isLoading,
  ]);

  return (
    <div
      className={cx(
        progressBoxStyles.progressBoxSmall,
        progressBoxStyles.progressBoxSmallSteps,
      )}
    >
      {hasFailed && failedError != null && (
        <RtkOrDataServicesError
          dismissible={false}
          error={failedError as never}
        />
      )}
      <ProgressStepsIndicator
        description="Saving credentials..."
        type={ProgressType.Determinate}
        style={ProgressStyle.Light}
        title={title}
        status={steps}
      />
    </div>
  );
}
