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

import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom-v5-compat";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { setInitialQuery, setPage, setPerPage } from "../searchV2.slice";
import { parseSearchQuery } from "../searchV2.utils";
import {
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE,
  MAX_PAGE_SIZE,
} from "../searchV2.constants";

export default function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const { initialQuery, query } = useAppSelector(({ searchV2 }) => searchV2);

  // Used to prevent double history pushes
  const queryRef = useRef<string>(query);

  useEffect(() => {
    const query = searchParams.get("q") ?? "";

    const { canonicalQuery, dateFilters, filters, searchBarQuery, sortBy } =
      parseSearchQuery(query);

    if (query !== canonicalQuery) {
      setSearchParams(
        (prev) => {
          prev.set("q", canonicalQuery);
          return prev;
        },
        { replace: true }
      );
      return;
    }

    dispatch(
      setInitialQuery({
        dateFilters,
        filters,
        query,
        searchBarQuery,
        sortBy,
      })
    );
    queryRef.current = query;
  }, [dispatch, searchParams, setSearchParams]);

  useEffect(() => {
    const pageRaw = searchParams.get("page");

    const page = parseInt(pageRaw ?? "", 10);
    if (isNaN(page) || page < 1) {
      setSearchParams(
        (prev) => {
          prev.set("page", FIRST_PAGE);
          return prev;
        },
        { replace: true }
      );
      return;
    }

    dispatch(setPage(page));
  }, [dispatch, searchParams, setSearchParams]);

  useEffect(() => {
    const perPageRaw = searchParams.get("perPage");

    const perPage = parseInt(perPageRaw ?? "", 10);
    if (isNaN(perPage) || perPage < 1) {
      setSearchParams(
        (prev) => {
          prev.set("perPage", DEFAULT_PAGE_SIZE);
          return prev;
        },
        { replace: true }
      );
      return;
    }

    if (perPage > 100) {
      setSearchParams(
        (prev) => {
          prev.set("perPage", MAX_PAGE_SIZE);
          return prev;
        },
        { replace: true }
      );
      return;
    }

    dispatch(setPerPage(perPage));
  }, [dispatch, searchParams, setSearchParams]);

  useEffect(() => {
    if (query != initialQuery) {
      if (queryRef.current === query) {
        return;
      }

      setSearchParams((prev) => {
        prev.set("q", query);
        prev.set("page", FIRST_PAGE);
        prev.set("perPage", DEFAULT_PAGE_SIZE);
        return prev;
      });
      queryRef.current = query;
    }
  }, [initialQuery, query, setSearchParams]);
}
