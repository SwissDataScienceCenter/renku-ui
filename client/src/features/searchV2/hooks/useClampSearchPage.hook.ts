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

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom-v5-compat";

interface UseClampSearchPageArgs {
  totalPages?: number | null | undefined;
}

export default function useClampSearchPage({
  totalPages,
}: UseClampSearchPageArgs) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (totalPages == null || totalPages <= 0) {
      return;
    }

    const pageRaw = searchParams.get("page");

    const page = parseInt(pageRaw ?? "", 10);
    if (page > totalPages) {
      setSearchParams(
        (prev) => {
          prev.set("page", `${totalPages}`);
          return prev;
        },
        { replace: true }
      );
      return;
    }
  }, [searchParams, setSearchParams, totalPages]);
}
