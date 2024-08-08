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
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, Form, InputGroup } from "reactstrap";

import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { setSearchBarQuery } from "../searchV2.slice";

export default function SearchV2Bar() {
  const dispatch = useAppDispatch();
  const { searchBarQuery } = useAppSelector(({ searchV2 }) => searchV2);

  const { register, handleSubmit, setFocus, setValue } = useForm<SearchBarForm>(
    {
      defaultValues: { searchBarQuery: searchBarQuery ?? "" },
    }
  );

  useEffect(() => {
    setValue("searchBarQuery", searchBarQuery ?? "");
  }, [searchBarQuery, setValue]);

  const onSubmitInner = useCallback(
    (data: SearchBarForm) => {
      dispatch(setSearchBarQuery(data.searchBarQuery));
    },
    [dispatch]
  );
  const onSubmit = useMemo(
    () => handleSubmit(onSubmitInner),
    [handleSubmit, onSubmitInner]
  );

  // focus search input when loading the component
  useEffect(() => {
    setFocus("searchBarQuery");
  }, [setFocus]);

  return (
    <Form noValidate onSubmit={onSubmit}>
      <InputGroup data-cy="search-bar">
        <input
          autoComplete="renku-search"
          className="form-control"
          data-cy="search-input"
          id="search-input"
          placeholder="Search..."
          type="text"
          {...register("searchBarQuery", { onBlur: onSubmit })}
        />
        <Button
          color="primary"
          data-cy="search-button"
          id="search-button"
          type="submit"
        >
          Search
        </Button>
      </InputGroup>
    </Form>
  );
}

interface SearchBarForm {
  searchBarQuery: string;
}
