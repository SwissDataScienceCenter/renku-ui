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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { DataConnectorConfiguration } from "../../../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import { usePostSessionsMutation } from "../../api/sessionsV2.api";
import { buildJobSessionPostRequest } from "../../session.utils";
import {
  dataConnectorsShouldSaveCredentials,
  doesCloudStorageNeedCredentials,
} from "../../sessionLaunchValidation.utils";
import type { SessionStartDataConnectorConfiguration } from "../../startSessionOptionsV2.types";
import useSessionLaunchPrerequisites from "../../useSessionLaunchPrerequisites.hook";
import {
  getSubmitJobValidationStep,
  INITIAL_SUBMIT_JOB_GATES,
  type SubmitJobGates,
  type SubmitJobValidationStep,
} from "./submitJobValidation.utils";
import type { SubmitJobForm } from "./useSubmitJobForm";

interface UseSubmitJobFlowArgs {
  launcher: SessionLauncher;
  project: Project;
}

export default function useSubmitJobFlow({
  launcher,
  project,
}: UseSubmitJobFlowArgs) {
  const prerequisites = useSessionLaunchPrerequisites({
    project,
    enabled: true,
  });

  const [postSession, postSessionResult] = usePostSessionsMutation();
  const hasSubmittedRef = useRef(false);
  const [gates, setGates] = useState<SubmitJobGates>(INITIAL_SUBMIT_JOB_GATES);
  const [dataConnectorConfigs, setDataConnectorConfigs] = useState<
    SessionStartDataConnectorConfiguration[] | undefined
  >();
  const [pendingSubmit, setPendingSubmit] = useState<SubmitJobForm | null>(
    null,
  );
  const [isValidating, setIsValidating] = useState(false);
  const [buildRequestError, setBuildRequestError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    postSessionResult.reset();
    // Clear stale mutation state when the submit modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const configsWithCredentials = useMemo(
    () =>
      (prerequisites.dataConnectorConfigs ?? []).filter(
        (config) => !doesCloudStorageNeedCredentials(config),
      ),
    [prerequisites.dataConnectorConfigs],
  );

  const shouldSaveCredentials =
    dataConnectorConfigs != null &&
    dataConnectorsShouldSaveCredentials(dataConnectorConfigs);

  const validationStep = useMemo(
    (): SubmitJobValidationStep | null =>
      getSubmitJobValidationStep({
        isValidating,
        isLoadingPrerequisites: prerequisites.isLoading,
        gates,
        repositoriesNeedAttention: prerequisites.repositoriesNeedAttention,
        secretsNeedAttention: prerequisites.secretsNeedAttention,
        sessionSecretSlotsWithSecrets:
          prerequisites.sessionSecretSlotsWithSecrets,
        needsCredentials: prerequisites.needsCredentials,
        shouldSaveCredentials,
      }),
    [
      gates,
      isValidating,
      prerequisites.isLoading,
      prerequisites.needsCredentials,
      prerequisites.repositoriesNeedAttention,
      prerequisites.secretsNeedAttention,
      prerequisites.sessionSecretSlotsWithSecrets,
      shouldSaveCredentials,
    ],
  );

  useEffect(() => {
    if (validationStep !== "complete") {
      hasSubmittedRef.current = false;
      return;
    }
    if (!pendingSubmit?.resourceClass) {
      return;
    }
    if (
      postSessionResult.isLoading ||
      postSessionResult.isSuccess ||
      postSessionResult.isError
    ) {
      return;
    }
    if (hasSubmittedRef.current) {
      return;
    }
    let sessionPostRequest;
    try {
      sessionPostRequest = buildJobSessionPostRequest({
        launcher,
        submissionId: pendingSubmit.submissionId,
        resourceClass: pendingSubmit.resourceClass,
        diskStorage: pendingSubmit.diskStorage,
        command: pendingSubmit.command,
        args: pendingSubmit.args,
        dataConnectors: dataConnectorConfigs,
      });
    } catch (error) {
      setBuildRequestError(
        error instanceof Error ? error.message : "Unable to submit job",
      );
      return;
    }
    setBuildRequestError(null);
    hasSubmittedRef.current = true;
    postSession({ sessionPostRequest });
  }, [
    dataConnectorConfigs,
    launcher,
    pendingSubmit,
    postSession,
    postSessionResult.isError,
    postSessionResult.isLoading,
    postSessionResult.isSuccess,
    validationStep,
  ]);

  const cancelValidation = useCallback(() => {
    setIsValidating(false);
  }, []);

  const handleSubmitAttempt = useCallback(
    (data: SubmitJobForm) => {
      if (prerequisites.isLoading) {
        return;
      }
      hasSubmittedRef.current = false;
      if (postSessionResult.isError) {
        postSessionResult.reset();
      }
      setBuildRequestError(null);
      setPendingSubmit(data);
      setIsValidating(true);
      setGates({
        repositoriesReady: !prerequisites.repositoriesNeedAttention,
        userSecretsReady: !prerequisites.secretsNeedAttention,
        dataConnectorsResolved: !prerequisites.needsCredentials,
        credentialsSaved: false,
      });
      if (
        !prerequisites.needsCredentials &&
        prerequisites.dataConnectorConfigs
      ) {
        setDataConnectorConfigs(prerequisites.dataConnectorConfigs);
      } else {
        setDataConnectorConfigs(undefined);
      }
    },
    [
      postSessionResult,
      prerequisites.dataConnectorConfigs,
      prerequisites.isLoading,
      prerequisites.needsCredentials,
      prerequisites.repositoriesNeedAttention,
      prerequisites.secretsNeedAttention,
    ],
  );

  const onDataConnectorsComplete = useCallback(
    (configs: DataConnectorConfiguration[]) => {
      const cloudStorageConfigs = [
        ...configsWithCredentials,
        ...configs,
      ] as SessionStartDataConnectorConfiguration[];
      setDataConnectorConfigs(cloudStorageConfigs);
      setGates((prev) => ({
        ...prev,
        dataConnectorsResolved: true,
        credentialsSaved:
          !dataConnectorsShouldSaveCredentials(cloudStorageConfigs),
      }));
    },
    [configsWithCredentials],
  );

  const onSaveCredentialsComplete = useCallback(
    (configs: SessionStartDataConnectorConfiguration[]) => {
      setDataConnectorConfigs(configs);
      setGates((prev) => ({ ...prev, credentialsSaved: true }));
    },
    [],
  );

  const onRepositoriesSkip = useCallback(() => {
    setGates((prev) => ({ ...prev, repositoriesReady: true }));
  }, []);

  const onSecretsSkip = useCallback(() => {
    setGates((prev) => ({ ...prev, userSecretsReady: true }));
  }, []);

  return {
    buildRequestError,
    cancelValidation,
    configsNeedingCredentials: prerequisites.configsNeedingCredentials,
    dataConnectorConfigs,
    handleSubmitAttempt,
    isCheckingLaunchPrerequisites: prerequisites.isLoading,
    onDataConnectorsComplete,
    onRepositoriesSkip,
    onSaveCredentialsComplete,
    onSecretsSkip,
    postSessionResult,
    sessionSecretSlotsWithSecrets: prerequisites.sessionSecretSlotsWithSecrets,
    validationStep,
  };
}
