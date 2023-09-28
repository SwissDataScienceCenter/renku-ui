/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { ResourcePool } from "../../../dataServices/dataServices";
import { setSessionClass } from "../../startSessionOptionsSlice";
import { setError } from "../../startSession.slice";

interface UseDefaultSessionClassOptionArgs {
  resourcePools: ResourcePool[] | undefined;
}

export default function useDefaultSessionClassOption({
  resourcePools,
}: UseDefaultSessionClassOptionArgs): void {
  const dispatch = useDispatch();

  const defaultSessionClass = useMemo(
    () =>
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      null,
    [resourcePools]
  );

  // Set initial session class for autostart
  // Order of preference:
  // 1. Default session class if it satisfies the compute requirements
  // 2. The first session class from the default pool which satisfies
  //    the compute requirements
  useEffect(() => {
    if (resourcePools == null) {
      return;
    }

    const initialSessionClassId =
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id && c.matching)?.id ??
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.matching)?.id ??
      0;

    if (initialSessionClassId == 0) {
      dispatch(setError({ error: "session-class" }));
      return;
    }

    dispatch(setSessionClass(initialSessionClassId));
  }, [defaultSessionClass?.id, dispatch, resourcePools]);
}
