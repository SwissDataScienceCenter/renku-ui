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

import { useEffect, useMemo, useRef } from "react";
import { useLocation, useSearchParams } from "react-router";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import {
  DEFAULT_CONTENT_TYPE,
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE,
  MAX_PAGE_SIZE,
} from "../searchV2.constants";
import { initFromUrl, reset, setNamespace } from "../searchV2.slice";
import type { InitFromUrlParams, SearchV2State } from "../searchV2.types";
import { useNamespaceContext } from "./useNamespaceContext.hook";

const URL_PARAM_NAMES = {
  q: "q",
  type: "type",
  page: "page",
  perPage: "perPage",
  visibility: "visibility",
  role: "role",
  keyword: "keyword",
  directMember: "direct_member",
  created: "created",
} as const;

function parseUrlToState(searchParams: URLSearchParams): InitFromUrlParams {
  const query = searchParams.get(URL_PARAM_NAMES.q) ?? "";
  const contentType =
    searchParams.get(URL_PARAM_NAMES.type) || DEFAULT_CONTENT_TYPE;
  const visibility = searchParams.get(URL_PARAM_NAMES.visibility) ?? "";
  const role = searchParams.get(URL_PARAM_NAMES.role) ?? "";
  const keywords = searchParams.get(URL_PARAM_NAMES.keyword) ?? "";
  const directMember = searchParams.get(URL_PARAM_NAMES.directMember) ?? "";
  const created = searchParams.get(URL_PARAM_NAMES.created) ?? "";

  let page = parseInt(searchParams.get(URL_PARAM_NAMES.page) ?? "", 10);
  if (isNaN(page) || page < 1) page = FIRST_PAGE;

  let perPage = parseInt(searchParams.get(URL_PARAM_NAMES.perPage) ?? "", 10);
  if (isNaN(perPage) || perPage < 1) perPage = DEFAULT_PAGE_SIZE;
  if (perPage > MAX_PAGE_SIZE) perPage = MAX_PAGE_SIZE;

  return {
    query,
    contentType,
    visibility,
    role,
    keywords,
    directMember,
    created,
    page,
    perPage,
  };
}

function stateToUrlParams(state: SearchV2State): URLSearchParams {
  const params = new URLSearchParams();

  params.set(URL_PARAM_NAMES.type, state.contentType || DEFAULT_CONTENT_TYPE);
  params.set(URL_PARAM_NAMES.page, state.page.toString());
  params.set(URL_PARAM_NAMES.perPage, state.perPage.toString());

  if (state.query) params.set(URL_PARAM_NAMES.q, state.query);
  if (state.visibility)
    params.set(URL_PARAM_NAMES.visibility, state.visibility);
  if (state.role) params.set(URL_PARAM_NAMES.role, state.role);
  if (state.keywords) params.set(URL_PARAM_NAMES.keyword, state.keywords);
  if (state.directMember)
    params.set(URL_PARAM_NAMES.directMember, state.directMember);
  if (state.created) params.set(URL_PARAM_NAMES.created, state.created);

  return params;
}

function paramsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  const aStr = new URLSearchParams([...a.entries()].sort()).toString();
  const bStr = new URLSearchParams([...b.entries()].sort()).toString();
  return aStr === bStr;
}

export default function useSearchSync() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const state = useAppSelector(({ searchV2 }) => searchV2);
  const { namespace } = useNamespaceContext();

  const syncSourceRef = useRef<"url" | "state" | null>(null);
  const hydratedRef = useRef(false);
  // Track route/context transitions (global/user/group search contexts).
  const searchContextKey = useMemo(
    () => `${pathname}::${namespace ?? ""}`,
    [pathname, namespace]
  );

  // Reset slice defaults when entering a different search context.
  useEffect(() => {
    hydratedRef.current = false;
    syncSourceRef.current = null;
    dispatch(reset());
  }, [dispatch, searchContextKey]);

  useEffect(() => {
    dispatch(setNamespace(namespace));
  }, [dispatch, namespace]);

  useEffect(() => {
    if (syncSourceRef.current === "state") {
      syncSourceRef.current = null;
      return;
    }

    const fromUrl = parseUrlToState(searchParams);

    // Check if URL has missing defaults and fill them in
    const canonical = stateToUrlParams({
      ...state,
      ...fromUrl,
    } as SearchV2State);
    if (!paramsEqual(searchParams, canonical)) {
      syncSourceRef.current = "url";
      setSearchParams(canonical, { replace: true });
      return;
    }

    syncSourceRef.current = "url";
    dispatch(initFromUrl(fromUrl));
    hydratedRef.current = true;
  }, [dispatch, searchContextKey, searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }
    if (syncSourceRef.current === "url") {
      syncSourceRef.current = null;
      return;
    }

    const fromState = stateToUrlParams(state);
    if (!paramsEqual(searchParams, fromState)) {
      syncSourceRef.current = "state";
      setSearchParams(fromState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.query,
    state.contentType,
    state.visibility,
    state.role,
    state.keywords,
    state.directMember,
    state.created,
    state.page,
    state.perPage,
    searchParams,
    setSearchParams,
  ]);
}
