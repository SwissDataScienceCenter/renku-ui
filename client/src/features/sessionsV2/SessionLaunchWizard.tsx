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

import { useCallback, useMemo, useState, type ReactNode } from "react";

import PrerequisitesWizard from "~/components/prerequisitesWizard/PrerequisitesWizard";
import type { WizardStep } from "~/components/prerequisitesWizard/prerequisitesWizard.types";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import useAppSelector from "~/utils/customHooks/useAppSelector.hook";
import type { DataConnectorConfiguration } from "../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import type { SessionSecretSlotWithSecret } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import type { Project } from "../projectsV2/api/projectV2.api";
import type { GetRepositoriesApiResponse } from "../repositories/api/repositories.api";
import type { ResourceClassWithId } from "./api/computeResources.api";
import type { SessionLauncher } from "./api/sessionLaunchersV2.api";
import { SelectResourceClassModal } from "./components/SessionModals/SelectResourceClass";
import SessionExpiredDataConnectorsModal from "./SessionExpiredDataConnectorsModal";
import SessionImageModal from "./SessionImageModal";
import {
  doesCloudStorageNeedCredentials,
  isDataConnectorExpired,
  repositoriesNeedAttention,
} from "./sessionLaunchValidation.utils";
import {
  applyLaunchSkips,
  type SessionLaunchSnapshot,
  type SessionLaunchSnapshotStep,
  type SessionLaunchStepId,
} from "./sessionLaunchWizard.utils";
import SessionRepositoriesModal from "./SessionRepositoriesModal";
import SessionSecretsModal from "./SessionSecretsModal";
import SessionSshKeyRequiredModal from "./SessionSshKeyRequiredModal";
import SessionStorageCredentials from "./SessionStorageCredentials";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import type { StartSessionOptionsV2 } from "./startSessionOptionsV2.types";

const STEP_LABELS: Record<SessionLaunchStepId, string> = {
  resourceClass: "Resource class",
  image: "Environment image",
  repositories: "Repositories",
  expiredDataConnectors: "Expired data connectors",
  sessionSecrets: "Session secrets",
  sshKey: "SSH key",
  storageCredentials: "Storage credentials",
};

interface SessionLaunchWizardProps {
  hasWritePermission: boolean;
  isCustomLaunch: boolean;
  isPendingResourceClass: boolean;
  launcher: SessionLauncher;
  onCancel: () => void;
  onLaunch: () => void;
  onResourceClass: (
    resourceClass: ResourceClassWithId,
    diskStorage: number | undefined,
  ) => void;
  project: Project;
  projectUrl: string;
  repositories: GetRepositoriesApiResponse[] | undefined;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
  snapshot: SessionLaunchSnapshot;
}

export default function SessionLaunchWizard({
  hasWritePermission,
  isCustomLaunch,
  isPendingResourceClass,
  launcher,
  onCancel,
  onLaunch,
  onResourceClass,
  project,
  projectUrl,
  repositories,
  sessionSecretSlotsWithSecrets,
  snapshot,
}: SessionLaunchWizardProps) {
  const dispatch = useAppDispatch();
  const options = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2,
  );
  const dataConnectors = useMemo(
    () => options.dataConnectors ?? [],
    [options.dataConnectors],
  );
  const [resourceClassDiskValid, setResourceClassDiskValid] = useState(true);
  const [storageTesting, setStorageTesting] = useState(false);
  const onResourceClassDiskValidChange = useCallback((valid: boolean) => {
    setResourceClassDiskValid(valid);
  }, []);
  const onStorageTestingChange = useCallback((testing: boolean) => {
    setStorageTesting(testing);
  }, []);
  const storeCredentials = useCallback(
    (configs: DataConnectorConfiguration[]) => {
      dispatch(
        startSessionOptionsV2Slice.actions.setDataConnectorsOverrides(configs),
      );
    },
    [dispatch],
  );

  const markStepReady = useCallback(
    (stepId: SessionLaunchStepId, configs: DataConnectorConfiguration[]) => {
      if (stepId === "image") {
        dispatch(startSessionOptionsV2Slice.actions.setImageReady(true));
      } else if (stepId === "repositories") {
        dispatch(startSessionOptionsV2Slice.actions.setRepositoriesReady(true));
      } else if (stepId === "expiredDataConnectors") {
        dispatch(
          startSessionOptionsV2Slice.actions.setDataConnectorsExpirationReady(
            true,
          ),
        );
        return applyLaunchSkips(configs, [stepId]);
      } else if (stepId === "sessionSecrets") {
        dispatch(startSessionOptionsV2Slice.actions.setUserSecretsReady(true));
      } else if (stepId === "sshKey") {
        dispatch(startSessionOptionsV2Slice.actions.setSshKeysReady(true));
      } else if (stepId === "storageCredentials") {
        return applyLaunchSkips(configs, [stepId]);
      }
      return configs;
    },
    [dispatch],
  );

  const skipStep = useCallback(
    (stepId: SessionLaunchStepId) => {
      const nextConfigs = markStepReady(stepId, dataConnectors);
      if (nextConfigs !== dataConnectors) {
        storeCredentials(nextConfigs);
      }
    },
    [dataConnectors, markStepReady, storeCredentials],
  );

  const onSubmit = useCallback(() => {
    if (storageTesting) {
      return;
    }
    const nextConfigs = snapshot.steps.reduce(
      (configs, step) => markStepReady(step.id, configs),
      dataConnectors,
    );
    if (nextConfigs !== dataConnectors) {
      storeCredentials(nextConfigs);
    }
    onLaunch();
  }, [
    dataConnectors,
    markStepReady,
    onLaunch,
    snapshot.steps,
    storageTesting,
    storeCredentials,
  ]);

  const progress = {
    hasWritePermission,
    isPendingResourceClass,
    options,
    repositories,
    resourceClassDiskValid,
    sessionSecretSlotsWithSecrets,
  };

  return (
    <PrerequisitesWizard
      isOpen
      isSubmitDisabled={storageTesting}
      onCancel={onCancel}
      onContinue={(stepId) => skipStep(stepId as SessionLaunchStepId)}
      onSubmit={onSubmit}
      skipAllLabel="Launch now"
      steps={snapshot.steps.map((step) =>
        toWizardStep(
          step,
          progress,
          <SessionLaunchStepContent
            dataConnectors={dataConnectors}
            isCustomLaunch={isCustomLaunch}
            launcher={launcher}
            onCredentialsFinished={storeCredentials}
            onCredentialsResolved={storeCredentials}
            onResourceClass={onResourceClass}
            onResourceClassDiskValidChange={onResourceClassDiskValidChange}
            onStorageTestingChange={onStorageTestingChange}
            options={options}
            project={project}
            projectUrl={projectUrl}
            sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
            step={step}
          />,
        ),
      )}
      submitLabel="Launch session"
      submitOutcome="launches the session"
      summaryTitle={launcher.name}
      title="Launch session"
    />
  );
}

function toWizardStep(
  step: SessionLaunchSnapshotStep,
  progress: StepProgressArgs,
  content: ReactNode,
): WizardStep {
  const label = STEP_LABELS[step.id];
  if (step.id === "resourceClass") {
    const { isPendingResourceClass, options, resourceClassDiskValid } =
      progress;
    return {
      id: step.id,
      kind: "single",
      label,
      isRequired: true,
      isSatisfied:
        !isPendingResourceClass &&
        options.sessionClass !== 0 &&
        resourceClassDiskValid,
      content,
    };
  }
  return {
    id: step.id,
    kind: "multi",
    label,
    resolved: resolvedItemCount(step, progress),
    total: step.items.length,
    content,
  };
}

interface StepProgressArgs {
  hasWritePermission: boolean;
  isPendingResourceClass: boolean;
  options: StartSessionOptionsV2;
  repositories: GetRepositoriesApiResponse[] | undefined;
  resourceClassDiskValid: boolean;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
}

function resolvedItemCount(
  step: SessionLaunchSnapshotStep,
  {
    hasWritePermission,
    options,
    repositories,
    sessionSecretSlotsWithSecrets,
  }: StepProgressArgs,
): number {
  if (step.id === "repositories") {
    if (options.repositoriesReady) return step.items.length;
    return step.items.filter(
      (item) =>
        !repositoriesNeedAttention(
          repositories?.filter((repository) => repository.url === item.id),
          hasWritePermission,
        ),
    ).length;
  }
  if (step.id === "expiredDataConnectors") {
    if (options.dataConnectorsExpirationReady) return step.items.length;
    return step.items.filter((item) => {
      const config = options.dataConnectors?.find(
        (candidate) => candidate.dataConnector.id === item.id,
      );
      return config == null || !isDataConnectorExpired(config);
    }).length;
  }
  if (step.id === "sessionSecrets") {
    if (options.userSecretsReady) return step.items.length;
    return step.items.filter((item) =>
      sessionSecretSlotsWithSecrets.some(
        (slot) => slot.secretSlot.id === item.id && slot.secretId != null,
      ),
    ).length;
  }
  if (step.id === "image") {
    return options.imageReady ? step.items.length : 0;
  }
  if (step.id === "sshKey") {
    return options.sshKeysReady ? step.items.length : 0;
  }
  if (step.id !== "storageCredentials") {
    return 0;
  }
  return step.items.filter((item) => {
    const config = options.dataConnectors?.find(
      (candidate) => candidate.dataConnector.id === item.id,
    );
    return config == null || !doesCloudStorageNeedCredentials(config);
  }).length;
}

function SessionLaunchStepContent({
  dataConnectors,
  isCustomLaunch,
  launcher,
  onCredentialsFinished,
  onCredentialsResolved,
  onResourceClass,
  onResourceClassDiskValidChange,
  onStorageTestingChange,
  options,
  project,
  projectUrl,
  sessionSecretSlotsWithSecrets,
  step,
}: {
  dataConnectors: DataConnectorConfiguration[];
  isCustomLaunch: boolean;
  launcher: SessionLauncher;
  onCredentialsFinished: (configs: DataConnectorConfiguration[]) => void;
  onCredentialsResolved: (configs: DataConnectorConfiguration[]) => void;
  onResourceClass: SessionLaunchWizardProps["onResourceClass"];
  onResourceClassDiskValidChange: (valid: boolean) => void;
  onStorageTestingChange: (testing: boolean) => void;
  options: StartSessionOptionsV2;
  project: Project;
  projectUrl: string;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[];
  step: SessionLaunchSnapshotStep;
}) {
  if (step.id === "resourceClass") {
    return (
      <SelectResourceClassModal
        embedded
        isCustom={isCustomLaunch}
        isOpen
        onContinue={onResourceClass}
        onDiskValidChange={onResourceClassDiskValidChange}
        projectUrl={projectUrl}
        resourceClassId={launcher.resource_class_id}
      />
    );
  }
  if (step.id === "image") {
    return (
      <SessionImageModal
        embedded
        isOpen
        launcher={launcher}
        project={project}
      />
    );
  }
  if (step.id === "repositories") {
    return (
      <SessionRepositoriesModal
        embedded
        isOpen
        project={project}
        repositoriesReady={options.repositoriesReady}
        visibleItems={step.items}
      />
    );
  }
  if (step.id === "expiredDataConnectors") {
    return (
      <SessionExpiredDataConnectorsModal
        dataConnectors={dataConnectors}
        embedded
        isOpen
        project={project}
        visibleItems={step.items}
      />
    );
  }
  if (step.id === "sessionSecrets") {
    return (
      <SessionSecretsModal
        embedded
        isOpen
        project={project}
        sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
        userSecretsReady={options.userSecretsReady}
        visibleItems={step.items}
      />
    );
  }
  if (step.id === "sshKey") {
    return <SessionSshKeyRequiredModal embedded isOpen project={project} />;
  }
  return (
    <SessionStorageCredentials
      dataConnectorConfigs={dataConnectors}
      onCredentialResolved={onCredentialsResolved}
      onFinished={onCredentialsFinished}
      onTestingChange={onStorageTestingChange}
    />
  );
}
