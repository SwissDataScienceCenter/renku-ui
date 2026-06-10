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

import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import SubmitJobFormModal from "./SubmitJobFormModal";
import SubmitJobPrerequisiteModals from "./SubmitJobPrerequisiteModals";
import useSubmitJobFlow from "./useSubmitJobFlow";

export type { SubmitJobForm } from "./useSubmitJobForm";

interface SubmitJobModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
  toggle: () => void;
}

function SubmitJobModalOpen({
  launcher,
  project,
  toggle,
}: Omit<SubmitJobModalProps, "isOpen">) {
  const {
    cancelValidation,
    configsNeedingCredentials,
    dataConnectorConfigs,
    handleSubmitAttempt,
    isCheckingLaunchPrerequisites,
    onDataConnectorsComplete,
    onRepositoriesSkip,
    onSaveCredentialsComplete,
    onSecretsSkip,
    postSessionResult,
    sessionSecretSlotsWithSecrets,
    validationStep,
  } = useSubmitJobFlow({ launcher, project });

  return (
    <>
      <SubmitJobFormModal
        isCheckingLaunchPrerequisites={isCheckingLaunchPrerequisites}
        isOpen
        launcher={launcher}
        onSubmitJob={handleSubmitAttempt}
        postSessionResult={postSessionResult}
        toggle={toggle}
      />
      <SubmitJobPrerequisiteModals
        configsNeedingCredentials={configsNeedingCredentials}
        dataConnectorConfigs={dataConnectorConfigs}
        launcher={launcher}
        onCancel={cancelValidation}
        onDataConnectorsComplete={onDataConnectorsComplete}
        onRepositoriesSkip={onRepositoriesSkip}
        onSaveCredentialsComplete={onSaveCredentialsComplete}
        onSecretsSkip={onSecretsSkip}
        project={project}
        sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
        validationStep={validationStep}
      />
    </>
  );
}

export default function SubmitJobModal({
  isOpen,
  launcher,
  project,
  toggle,
}: SubmitJobModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <SubmitJobModalOpen launcher={launcher} project={project} toggle={toggle} />
  );
}
