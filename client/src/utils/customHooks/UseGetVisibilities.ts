/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { useEffect, useState } from "react";
import { computeVisibilities } from "../helpers/HelperFunctions";
import { useGetGroupByPathQuery } from "../../features/projects/ProjectApi";

/**
 *  useGetVisibilities custom hook
 *
 *  UseGetVisibilities.ts
 *  hook to get visibilities and fetch groups if the namespace is of type group
 */
function useGetVisibilities(namespace: any) {
  const { data, isFetching, isLoading } =
    useGetGroupByPathQuery(namespace?.full_path, { skip: !namespace || namespace?.kind !== "group" });
  const [availableVisibilities, setAvailableVisibilities] = useState<any>(null);

  useEffect(() => {
    if (isFetching || isLoading || !namespace)
      return;

    let options: string[] = [];
    if (namespace?.kind === "user") {
      options.push("public");
      setAvailableVisibilities(computeVisibilities(options));
    }
    else if (namespace?.kind === "group") {
      options.push(data.visibility);
      setAvailableVisibilities(computeVisibilities(options));
    }
  }, [isFetching, isLoading, data, namespace]);

  return { availableVisibilities, isFetchingVisibilities: isFetching };
}

export default useGetVisibilities;
