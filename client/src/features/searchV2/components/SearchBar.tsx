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

import cx from "classnames";
import { useCallback, useEffect, useRef } from "react";
import { Search, XCircleFill } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { Button, Form, InputGroup } from "reactstrap";

import { FILTER_QUERY } from "../contextSearch.constants";
import { mapParsedQueryToSearchParams } from "../contextSearch.utils";
import { useContextSearch } from "../hooks/useContextSearch.hook";
import { parseSearchQuery } from "../searchV2.utils";

interface SearchBarForm {
  query: string;
}
export default function SearchBar() {
  // Set the input properly
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(FILTER_QUERY.name) ?? "";
  const { refetch } = useContextSearch();

  const { control, handleSubmit, reset, setFocus } = useForm<SearchBarForm>({
    defaultValues: { query },
  });

  // Track whether the URL change was triggered by the user's own submit,
  // so we can keep the raw input as-is in that case.
  const isSubmittingRef = useRef(false);

  // Reset the input to match the URL query, but only for external changes
  // (e.g., sidebar filter click, browser back). After user submit, the
  // search bar keeps the raw input including filter syntax.
  useEffect(() => {
    if (isSubmittingRef.current) {
      isSubmittingRef.current = false;
      return;
    }
    reset({ query });
  }, [query, reset]);

  // focus search input when loading the component
  useEffect(() => {
    setFocus("query");
  }, [setFocus]);

  const onClear = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(FILTER_QUERY.name, "");
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const onSubmit = useCallback(
    (data: SearchBarForm, forceRefresh = false) => {
      // Parse filter syntax from the raw input (e.g., "role:owner type:Group my text")
      const parsed = parseSearchQuery(data.query);
      const newParams = mapParsedQueryToSearchParams(parsed, searchParams);

      isSubmittingRef.current = true;

      // force a refetch even for the same query if explicitly asked for
      if (forceRefresh && searchParams.toString() === newParams.toString()) {
        refetch();
      } else {
        setSearchParams(newParams);
      }
    },
    [refetch, searchParams, setSearchParams]
  );

  return (
    <>
      <Form
        className="mb-3"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, true))}
      >
        <InputGroup>
          <Controller
            control={control}
            name="query"
            render={({ field }) => (
              <input
                className="form-control"
                data-cy="group-search-query-input"
                id="group-search-query-input"
                type="text"
                placeholder="Search..."
                {...field}
                onBlur={(e) => e.currentTarget.form?.requestSubmit()}
              ></input>
            )}
          />
          <Button
            color="outline-secondary"
            className={cx(
              "border-0",
              "border-top",
              "border-bottom",
              "shadow-none"
            )}
            data-cy="group-search-button"
            onClick={onClear}
            id="group-search-button"
            type="button"
          >
            <XCircleFill className={cx("bi")} />
          </Button>
          <Button
            color="primary"
            data-cy="group-search-button"
            id="group-search-button"
            type="submit"
          >
            <Search className={cx("bi", "me-1")} /> Search
          </Button>
        </InputGroup>
      </Form>
    </>
  );
}
