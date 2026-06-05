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

import type { SessionSecretSlotWithSecret } from "../../../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.types";
import { allSessionSecretsReady } from "../../sessionLaunchValidation.utils";

export interface SubmitJobGates {
  repositoriesReady: boolean;
  userSecretsReady: boolean;
  dataConnectorsResolved: boolean;
  credentialsSaved: boolean;
}

export const INITIAL_SUBMIT_JOB_GATES: SubmitJobGates = {
  repositoriesReady: false,
  userSecretsReady: false,
  dataConnectorsResolved: false,
  credentialsSaved: false,
};

export type SubmitJobValidationStep =
  | "repositories"
  | "sessionSecrets"
  | "dataConnectors"
  | "saveCredentials"
  | "complete";

export interface GetSubmitJobValidationStepArgs {
  isValidating: boolean;
  isLoadingPrerequisites: boolean;
  gates: SubmitJobGates;
  repositoriesNeedAttention: boolean;
  secretsNeedAttention: boolean;
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null;
  needsCredentials: boolean;
  shouldSaveCredentials: boolean;
}

function isUserSecretsReadyForSubmit(
  gates: SubmitJobGates,
  isValidating: boolean,
  sessionSecretSlotsWithSecrets: SessionSecretSlotWithSecret[] | null
): boolean {
  return (
    gates.userSecretsReady ||
    (isValidating &&
      !!sessionSecretSlotsWithSecrets &&
      allSessionSecretsReady(sessionSecretSlotsWithSecrets))
  );
}

export function getSubmitJobValidationStep({
  isValidating,
  isLoadingPrerequisites,
  gates,
  repositoriesNeedAttention,
  secretsNeedAttention,
  sessionSecretSlotsWithSecrets,
  needsCredentials,
  shouldSaveCredentials,
}: GetSubmitJobValidationStepArgs): SubmitJobValidationStep | null {
  if (!isValidating || isLoadingPrerequisites) {
    return null;
  }
  if (!gates.repositoriesReady && repositoriesNeedAttention) {
    return "repositories";
  }
  if (
    !isUserSecretsReadyForSubmit(
      gates,
      isValidating,
      sessionSecretSlotsWithSecrets
    ) &&
    secretsNeedAttention &&
    sessionSecretSlotsWithSecrets
  ) {
    return "sessionSecrets";
  }
  if (!gates.dataConnectorsResolved && needsCredentials) {
    return "dataConnectors";
  }
  if (shouldSaveCredentials && !gates.credentialsSaved) {
    return "saveCredentials";
  }
  return "complete";
}
