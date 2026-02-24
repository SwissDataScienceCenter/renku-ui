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
import { useCallback, useEffect, useMemo } from "react";
import { Search, XCircleFill } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, InputGroup } from "reactstrap";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { applyParsedSearch, reset as resetSearch } from "../searchV2.slice";
import {
  buildSearchBarDisplay,
  parsedResultToSliceParams,
  parseSearchQuery,
} from "../searchV2.utils";

interface SearchBarForm {
  query: string;
}

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(({ searchV2 }) => searchV2);

  const displayQuery = useMemo(() => buildSearchBarDisplay(state), [state]);

  const { control, handleSubmit, reset, setFocus } = useForm<SearchBarForm>({
    defaultValues: { query: displayQuery },
  });

  // Keep the search bar text in sync with the full Redux state.
  // When any filter changes (via sidebar OR search bar submit), the
  // display text updates and the input resets to match.
  useEffect(() => {
    reset({ query: displayQuery });
  }, [displayQuery, reset]);

  useEffect(() => {
    setFocus("query");
  }, [setFocus]);

  const onClear = useCallback(() => {
    dispatch(resetSearch());
  }, [dispatch]);

  const onSubmit = useCallback(
    (data: SearchBarForm) => {
      const parsed = parseSearchQuery(data.query);
      const params = parsedResultToSliceParams(parsed);
      dispatch(applyParsedSearch(params));
    },
    [dispatch]
  );

  return (
    <>
      <Form className="mb-3" noValidate onSubmit={handleSubmit(onSubmit)}>
        <InputGroup>
          <Controller
            control={control}
            name="query"
            render={({ field }) => (
              <input
                className="form-control"
                data-cy="search-query-input"
                id="search-query-input"
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
            data-cy="search-clear-button"
            onClick={onClear}
            id="search-button"
            type="button"
          >
            <XCircleFill className={cx("bi")} />
          </Button>
          <Button
            color="primary"
            data-cy="search-query-button"
            id="search-button"
            type="submit"
          >
            <Search className={cx("bi", "me-1")} /> Search
          </Button>
        </InputGroup>
      </Form>
    </>
  );
}
