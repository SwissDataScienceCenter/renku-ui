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

interface JobSubmitModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
  toggle: () => void;
}

function JobSubmitModalOpen({
  launcher,
  project,
  toggle,
}: Omit<JobSubmitModalProps, "isOpen">) {
  const submitJobFlow = useSubmitJobFlow({ launcher, project });

  return (
    <>
      <SubmitJobFormModal
        isOpen
        launcher={launcher}
        submitJobFlow={submitJobFlow}
        toggle={toggle}
      />
      <SubmitJobPrerequisiteModals
        configsNeedingCredentials={submitJobFlow.configsNeedingCredentials}
        dataConnectorConfigs={submitJobFlow.dataConnectorConfigs}
        launcher={launcher}
        onCancel={submitJobFlow.cancelValidation}
        onDataConnectorsComplete={submitJobFlow.onDataConnectorsComplete}
        onRepositoriesSkip={submitJobFlow.onRepositoriesSkip}
        onSaveCredentialsComplete={submitJobFlow.onSaveCredentialsComplete}
        onSecretsSkip={submitJobFlow.onSecretsSkip}
        project={project}
        sessionSecretSlotsWithSecrets={
          submitJobFlow.sessionSecretSlotsWithSecrets
        }
        validationStep={submitJobFlow.validationStep}
      />
    </>
  );
}

export default function JobSubmitModal({
  isOpen,
  launcher,
  project,
  toggle,
}: JobSubmitModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <JobSubmitModalOpen launcher={launcher} project={project} toggle={toggle} />
  );
}
