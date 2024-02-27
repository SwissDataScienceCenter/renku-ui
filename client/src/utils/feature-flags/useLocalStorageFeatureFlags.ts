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

import { useCallback, useEffect, useState } from "react";

import { FeatureFlags } from "./featureFlags.types";
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
} from "./featureFlags.constants";

const localStorageKeyPrefix = "RENKU_FEATURE_FLAG__";

export default function useLocalStorageFeatureFlags() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(
    DEFAULT_FEATURE_FLAGS
  );

  const setFlag = useCallback((flag: keyof FeatureFlags, value: boolean) => {
    const localStorageKey = `${localStorageKeyPrefix}${flag}`;
    window.localStorage.setItem(localStorageKey, value ? "1" : "0");
  }, []);

  useEffect(() => {
    function listener(event: StorageEvent) {
      if (event.key == null) {
        setFeatureFlags(DEFAULT_FEATURE_FLAGS);
        return;
      }
      if (!event.key.startsWith(localStorageKeyPrefix)) {
        return;
      }

      setFeatureFlags(readFlagsFromLocalStorage());
    }

    window.addEventListener("storage", listener);

    return () => {
      window.removeEventListener("storage", listener);
    };
  }, []);

  return [featureFlags, { setFlag }] as const;
}

function readFlagsFromLocalStorage(): FeatureFlags {
  const keyValuePairs = FEATURE_FLAG_KEYS.map((flag) => {
    const localStorageKey = `${localStorageKeyPrefix}${flag}`;
    const value = !!window.localStorage.getItem(localStorageKey);
    return [flag, value] as [keyof FeatureFlags, boolean];
  });
  return keyValuePairs.reduce(
    (featureFlags, [key, value]) => ({ ...featureFlags, [key]: value }),
    { ...DEFAULT_FEATURE_FLAGS } as FeatureFlags
  );
}
