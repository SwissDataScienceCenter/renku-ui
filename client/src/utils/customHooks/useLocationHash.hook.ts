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

import { useCallback, useMemo } from "react";
import {
  type NavigateOptions,
  useLocation,
  useNavigate,
} from "react-router-dom-v5-compat";

/**
 * useLocationHash() is a hook similar to react-router's useSearchParams but for the URL hash.
 * See: https://reactrouter.com/en/main/hooks/use-search-params
 */
export default function useLocationHash(): [string, SetLocationHash] {
  const location = useLocation();
  const navigate = useNavigate();

  const hash = useMemo(
    () =>
      location.hash.startsWith("#") ? location.hash.slice(1) : location.hash,
    [location.hash]
  );

  const setLocationHash = useCallback<SetLocationHash>(
    (next, options) => {
      const newHash = typeof next === "function" ? next(hash) : next;
      navigate({ hash: newHash ?? "" }, options);
    },
    [hash, navigate]
  );

  return [hash, setLocationHash];
}

export type SetLocationHash = (
  next?: string | ((prev: string) => string),
  options?: NavigateOptions
) => void;
