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

import { Modal, ModalBody, ModalHeader } from "reactstrap";

import type { DataConnectorConfiguration } from "../../../dataConnectorsV2/components/useDataConnectorConfiguration.hook";
import type { SessionSecretSlotWithSecret } from "../../../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import DataConnectorSecretsModal from "../../DataConnectorSecretsModal";
import SaveCloudStorageCredentials from "../../SaveCloudStorageCredentials";
import SessionRepositoriesModal from "../../SessionRepositoriesModal";
import SessionSecretsModal from "../../SessionSecretsModal";
import type { SessionStartDataConnectorConfiguration } from "../../startSessionOptionsV2.types";
import type { SubmitJobValidationStep } from "./submitJobValidation.utils";

interface SubmitJobPrerequisiteModalsProps {
  validationStep: SubmitJobValidationStep | null;
  project: Project;
  launcher: SessionLauncher;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null;
  configsNeedingCredentials: DataConnectorConfiguration[];
  dataConnectorConfigs: SessionStartDataConnectorConfiguration[] | undefined;
  onCancel: () => void;
  onRepositoriesSkip: () => void;
  onSecretsSkip: () => void;
  onDataConnectorsComplete: (configs: DataConnectorConfiguration[]) => void;
  onSaveCredentialsComplete: (
    configs: SessionStartDataConnectorConfiguration[],
  ) => void;
}

export default function SubmitJobPrerequisiteModals({
  validationStep,
  project,
  launcher,
  sessionSecretSlotsWithSecrets,
  configsNeedingCredentials,
  dataConnectorConfigs,
  onCancel,
  onRepositoriesSkip,
  onSecretsSkip,
  onDataConnectorsComplete,
  onSaveCredentialsComplete,
}: SubmitJobPrerequisiteModalsProps) {
  return (
    <>
      {validationStep === "repositories" && (
        <SessionRepositoriesModal
          continueLabel="Submit anyway"
          isOpen
          onCancel={onCancel}
          onSkip={onRepositoriesSkip}
          project={project}
          title="Project repositories not accessible"
          warningIntro="your attention before submitting the job"
        />
      )}

      {validationStep === "sessionSecrets" && sessionSecretSlotsWithSecrets && (
        <SessionSecretsModal
          isOpen
          onCancel={onCancel}
          onSkip={onSecretsSkip}
          project={project}
          sessionSecretSlotsWithSecrets={sessionSecretSlotsWithSecrets}
          title="Job secrets"
        />
      )}

      {validationStep === "dataConnectors" && (
        <DataConnectorSecretsModal
          context="job"
          dataConnectorConfigs={configsNeedingCredentials}
          isOpen
          onCancel={onCancel}
          onStart={onDataConnectorsComplete}
        />
      )}

      {validationStep === "saveCredentials" && dataConnectorConfigs && (
        <Modal
          backdrop="static"
          centered
          data-cy="submit-job-save-credentials-modal"
          isOpen
          toggle={onCancel}
        >
          <ModalHeader tag="h2">Saving credentials</ModalHeader>
          <ModalBody>
            <SaveCloudStorageCredentials
              dataConnectors={dataConnectorConfigs}
              onComplete={onSaveCredentialsComplete}
              title={`Submitting job ${launcher.name}`}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
