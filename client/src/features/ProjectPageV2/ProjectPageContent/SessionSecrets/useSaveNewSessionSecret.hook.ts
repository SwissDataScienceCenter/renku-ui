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

import { useCallback, useState } from "react";

import type { SessionSecretSlot } from "../../../projectsV2/api/projectV2.api";
import {
  useGetProjectsByProjectIdQuery,
  usePatchProjectsByProjectIdSessionSecretsMutation,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import { usePatchUserSecretMutation } from "../../../usersV2/api/users.api";

type SaveStatus = "idle" | "saving" | "saved" | "renameFailed";

interface SaveNewSessionSecretArgs {
  name: string;
  value: string;
}

/** Save a new value for a session secret slot, then give the new user secret a name. */
export default function useSaveNewSessionSecret(secretSlot: SessionSecretSlot) {
  const { id: slotId, name: slotName, project_id: projectId } = secretSlot;

  const [patchSessionSecrets, { error, reset: resetPatch }] =
    usePatchProjectsByProjectIdSessionSecretsMutation();
  const [patchUserSecret, { error: renameError, reset: resetRename }] =
    usePatchUserSecretMutation();
  const [status, setStatus] = useState<SaveStatus>("idle");

  const save = useCallback(
    async ({ name, value }: SaveNewSessionSecretArgs) => {
      setStatus("saving");
      let secretId: string | undefined;
      try {
        const saved = await patchSessionSecrets({
          projectId,
          sessionSecretPatchList: [{ secret_slot_id: slotId, value }],
        }).unwrap();
        secretId = saved.find(
          ({ secret_slot }) => secret_slot.id === slotId,
        )?.secret_id;
      } catch {
        setStatus("idle");
        return;
      }

      const newName = name.trim();
      if (secretId == null || newName === "" || newName === slotName) {
        setStatus("saved");
        return;
      }
      try {
        await patchUserSecret({
          secretId,
          secretPatch: { name: newName },
        }).unwrap();
        setStatus("saved");
      } catch {
        setStatus("renameFailed");
      }
    },
    [patchSessionSecrets, patchUserSecret, projectId, slotId, slotName],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    resetPatch();
    resetRename();
  }, [resetPatch, resetRename]);

  return {
    error,
    isLoading: status === "saving",
    renameError,
    reset,
    save,
    status,
  };
}

/** Default user secret name for a slot: "<slot name> (<project name>)". */
export function useDefaultSecretName(secretSlot: SessionSecretSlot) {
  const { data: project } = useGetProjectsByProjectIdQuery({
    projectId: secretSlot.project_id,
  });
  return project ? `${secretSlot.name} (${project.name})` : undefined;
}
