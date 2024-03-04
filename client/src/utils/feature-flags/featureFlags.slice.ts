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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  FEATURE_FLAG_LOCAL_STORAGE_KEY_PREFIX,
} from "./featureFlags.constants";
import { FeatureFlags } from "./featureFlags.types";

const featureFlagsSlice = createSlice({
  name: "featureFlags",
  initialState:
    typeof window === "undefined"
      ? DEFAULT_FEATURE_FLAGS
      : readFlagsFromLocalStorage,
  reducers: {
    setFlag: (state, action: PayloadAction<SetFlagPayload>) => {
      const { flag, value } = action.payload;
      state[flag] = value;

      const localStorageKey = `${FEATURE_FLAG_LOCAL_STORAGE_KEY_PREFIX}${flag}`;
      window.localStorage.setItem(localStorageKey, value ? "1" : "0");
    },
    reset: () => readFlagsFromLocalStorage(),
  },
});

interface SetFlagPayload {
  flag: keyof FeatureFlags;
  value: boolean;
}

export default featureFlagsSlice;
export const { setFlag, reset } = featureFlagsSlice.actions;

function readFlagsFromLocalStorage(): FeatureFlags {
  const keyValuePairs = FEATURE_FLAG_KEYS.map((flag) => {
    const localStorageKey = `${FEATURE_FLAG_LOCAL_STORAGE_KEY_PREFIX}${flag}`;
    const value = !!window.localStorage.getItem(localStorageKey);
    return [flag, value] as [keyof FeatureFlags, boolean];
  });
  return keyValuePairs.reduce(
    (featureFlags, [key, value]) => ({ ...featureFlags, [key]: value }),
    { ...DEFAULT_FEATURE_FLAGS } as FeatureFlags
  );
}
