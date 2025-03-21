/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { useCallback, useMemo } from "react";
import { type NavigateOptions, useLocation, useNavigate } from "react-router";

/**
 * useLocationSearchParams() is a hook similar to react-router's useSearchParams but it preserves the location's hash.
 * See:
 *   - https://reactrouter.com/api/hooks/useLocation
 *   - https://reactrouter.com/en/main/hooks/use-search-params
 */
export default function useLocationSearchParams(): [
  URLSearchParams,
  SetLocationSearchParams
] {
  const location = useLocation();
  const navigate = useNavigate();

  const search = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const hash = useMemo(
    () =>
      location.hash.startsWith("#") ? location.hash.slice(1) : location.hash,
    [location.hash]
  );

  const setLocationSearchParams = useCallback<SetLocationSearchParams>(
    (next, options) => {
      const newSearch = typeof next === "function" ? next(search) : next;
      navigate({ hash, search: newSearch?.toString() ?? "" }, options);
    },
    [hash, navigate, search]
  );

  return [search, setLocationSearchParams];
}

export type SetLocationSearchParams = (
  next?: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  options?: NavigateOptions
) => void;
