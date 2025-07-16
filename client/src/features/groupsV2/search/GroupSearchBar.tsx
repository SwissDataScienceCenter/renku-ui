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
import { useCallback, useEffect } from "react";
import { Search, XCircleFill } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { Button, Form, InputGroup } from "reactstrap";
import { FILTER_PAGE, FILTER_QUERY } from "./groupsSearch.constants";

interface SearchBarForm {
  query: string;
}
export default function GroupSearchBar() {
  // Set the input properly
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(FILTER_QUERY.name) ?? "";

  const { control, register, handleSubmit, reset, setFocus } =
    useForm<SearchBarForm>({
      defaultValues: { query },
    });

  // Reset the input to match the URL query
  useEffect(() => {
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
    (data: SearchBarForm) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(FILTER_QUERY.name, data.query);
      const page_default_value = (
        FILTER_PAGE.defaultValue as number
      ).toString();
      if (newParams.get(FILTER_PAGE.name) !== page_default_value) {
        newParams.set(FILTER_PAGE.name, page_default_value);
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
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
                data-cy="group-search-query-input"
                id="group-search-query-input"
                type="text"
                placeholder="Search..."
                {...register("query", {
                  onBlur: handleSubmit(onSubmit),
                })}
                {...field}
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
