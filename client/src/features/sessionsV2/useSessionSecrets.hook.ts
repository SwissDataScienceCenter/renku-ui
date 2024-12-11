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

import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo } from "react";

import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import { getSessionSecretSlotsWithSecrets } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.utils";
import {
  useGetProjectsByProjectIdSessionSecretSlotsQuery,
  useGetProjectsByProjectIdSessionSecretsQuery,
} from "../projectsV2/api/projectV2.enhanced-api";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface UseSessionSecretsArgs {
  projectId: string;
}

export default function useSessionSecrets({
  projectId,
}: UseSessionSecretsArgs) {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const {
    currentData: sessionSecretSlots,
    isFetching: isFetchingSessionSecretSlots,
    error: sessionSecretSlotsError,
  } = useGetProjectsByProjectIdSessionSecretSlotsQuery({ projectId });
  const {
    currentData: sessionSecrets,
    isFetching: isFetchingSessionSecrets,
    error: sessionSecretsError,
  } = useGetProjectsByProjectIdSessionSecretsQuery(
    userLogged ? { projectId } : skipToken
  );

  const isFetching = isFetchingSessionSecretSlots || isFetchingSessionSecrets;
  const error = sessionSecretSlotsError ?? sessionSecretsError;

  const sessionSecretSlotsWithSecrets = useMemo(() => {
    if (error || !sessionSecretSlots || (userLogged && !sessionSecrets)) {
      return null;
    }
    return getSessionSecretSlotsWithSecrets({
      sessionSecretSlots,
      sessionSecrets: sessionSecrets ?? [],
    });
  }, [error, sessionSecretSlots, sessionSecrets, userLogged]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      !userLogged ||
      sessionSecretSlotsWithSecrets?.every(({ secretId }) => secretId)
    ) {
      dispatch(startSessionOptionsV2Slice.actions.setUserSecretsReady(true));
    }
  }, [dispatch, sessionSecretSlotsWithSecrets, userLogged]);

  return {
    sessionSecretSlotsWithSecrets,
    isFetching,
    error,
  };
}
