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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import { useCallback, useEffect, useState } from "react";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import { useGetResourceClassByIdQuery } from "../dataServices/computeResources.api";
import {
  ResourceClass,
  ResourcePool,
} from "../dataServices/dataServices.types";
import { SessionLauncher } from "./sessionsV2.types";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";

interface UseSessionResourceClassProps {
  isCustomLaunch: boolean;
  launcher: SessionLauncher;
  resourcePools: ResourcePool[] | undefined;
}
export default function useSessionResourceClass({
  isCustomLaunch,
  launcher,
  resourcePools,
}: UseSessionResourceClassProps) {
  const dispatch = useAppDispatch();
  const startSessionOptionsV2 = useAppSelector(
    ({ startSessionOptionsV2 }) => startSessionOptionsV2
  );
  const { data: launcherClass, isLoading: isLoadingLauncherClass } =
    useGetResourceClassByIdQuery(launcher?.resource_class_id ?? skipToken);
  const [isPendingResourceClass, setIsPendingResourceClass] =
    useState<boolean>(false);
  const setResourceClass = useCallback(
    (envClass: ResourceClass) => {
      if (envClass) {
        dispatch(
          startSessionOptionsV2Slice.actions.setSessionClass(envClass.id)
        );
        setIsPendingResourceClass(false);
      }
    },
    [dispatch]
  );

  // Select the default session class only if it is not a custom launch and
  // the launcher resource class exists in the user resource pool.
  useEffect(() => {
    if (resourcePools == null || isLoadingLauncherClass) {
      return;
    }
    const initialSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id == launcherClass?.id && c.matching);

    const hasSessionClassAssigned = startSessionOptionsV2.sessionClass != 0;

    if (
      (!initialSessionClass ||
        initialSessionClass?.id == 0 ||
        isCustomLaunch) &&
      !hasSessionClassAssigned
    ) {
      setIsPendingResourceClass(true);
      return;
    }

    if (initialSessionClass && !isCustomLaunch)
      setResourceClass(initialSessionClass);
  }, [
    isCustomLaunch,
    isLoadingLauncherClass,
    launcherClass,
    resourcePools,
    setResourceClass,
    startSessionOptionsV2,
  ]);

  return {
    isPendingResourceClass,
    setResourceClass,
  };
}
