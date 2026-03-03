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

import { useCallback } from "react";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import {
  setContentType,
  setCreated,
  setDirectMember,
  setKeywords,
  setRole,
  setVisibility,
} from "../searchV2.slice";

/**
 * Redux-based replacement for useSearchFilterParam.
 */
export function useReduxFilterParam(filterName: string) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(({ searchV2 }) => searchV2);

  const currentValue =
    filterName === "type"
      ? state.contentType
      : filterName === "visibility"
      ? state.visibility
      : filterName === "role"
      ? state.role
      : filterName === "keyword"
      ? state.keywords
      : filterName === "direct_member"
      ? state.directMember
      : filterName === "created"
      ? state.created
      : "";

  const updateParam = useCallback(
    (newValue: string) => {
      switch (filterName) {
        case "type":
          dispatch(setContentType(newValue));
          break;
        case "visibility":
          dispatch(setVisibility(newValue));
          break;
        case "role":
          dispatch(setRole(newValue));
          break;
        case "keyword":
          dispatch(setKeywords(newValue));
          break;
        case "direct_member":
          dispatch(setDirectMember(newValue));
          break;
        case "created":
          dispatch(setCreated(newValue));
          break;
      }
    },
    [dispatch, filterName]
  );

  return { currentValue, updateParam };
}
