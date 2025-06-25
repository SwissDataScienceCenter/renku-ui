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
import { Controller, useForm } from "react-hook-form";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Col,
  Form,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledAccordion,
} from "reactstrap";
import { useGroup } from "../show/GroupPageContainer";
import { useSearchParams } from "react-router";
import { Loader } from "~/components/Loader";
import { useGetSearchQueryQuery } from "~/features/searchV2/api/searchV2Api.api.ts";
import {
  generateQueryParams,
  getQueryHumanReadable,
  getSearchQueryMissingFilters,
} from "./groupSearch.utils";
import { Filter, GroupSearchEntity } from "./groupSearch.types";
import {
  FILTER_CONTENT,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_VISIBILITY,
} from "./groupsSearch.constants";
import Pagination from "~/components/Pagination";

export default function GroupV2Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Add any missing default parameter. There shouldn't be anything content-dependant.
  useEffect(() => {
    const missingParams = getSearchQueryMissingFilters(searchParams);
    if (Object.keys(missingParams).length > 0) {
      const newSearchParams = new URLSearchParams(searchParams);
      Object.entries(missingParams).forEach(([key, value]) => {
        newSearchParams.set(key, String(value));
      });
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // This prevents loading the page on semi-ready content and sending unnecessary requests.
  const missingParams = getSearchQueryMissingFilters(searchParams);
  if (Object.keys(missingParams).length > 0) {
    return <Loader />;
  }

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <Row>
        <Col xs={12}>
          <GroupSearchQueryInput />
        </Col>
        <Col xs={12}>
          <GroupSearchResultRecap />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={3} lg={2}>
          <GroupSearchFilters />
        </Col>
        <Col xs={12} sm={9} lg={10}>
          <GroupSearchResults />
        </Col>
      </Row>
    </div>
  );
}

interface SearchBarForm {
  query: string;
}

function GroupSearchQueryInput() {
  // Set the input properly
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const { control, register, handleSubmit, setFocus } = useForm<SearchBarForm>({
    defaultValues: { query },
  });

  // focus search input when loading the component
  useEffect(() => {
    setFocus("query");
  }, [setFocus]);

  const onSubmit = useCallback(
    (data: SearchBarForm) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("q", data.query);
      setSearchParams(newParams, { replace: true });

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
            color="primary"
            data-cy="group-search-button"
            id="group-search-button"
            type="submit"
          >
            Search
          </Button>
        </InputGroup>
      </Form>
    </>
  );
}

function GroupSearchResultRecap() {
  // Get the query and results data
  const [searchParams] = useSearchParams();
  const { group } = useGroup();
  const params = useMemo(
    () => generateQueryParams(searchParams, group.slug),
    [group.slug, searchParams]
  );

  const { data, isFetching } = useGetSearchQueryQuery({
    params,
  });
  const total = data?.pagingInfo.totalResult;

  const filters = getQueryHumanReadable(searchParams);
  const query = searchParams.get("q") ?? "";

  return (
    <p className="mb-0">
      {isFetching ? (
        "Fetching results"
      ) : (
        <>
          {total ? total : "No"} {total && total > 1 ? "results" : "result"}
        </>
      )}
      {query && (
        <>
          {" "}
          for <span className="fw-semibold">{`"${query}"`}</span>
        </>
      )}
      {filters && (
        <>
          {" "}
          (filtered by <span className="fst-italic">{`"${filters}"`}</span>)
        </>
      )}
    </p>
  );
}

function GroupSearchFilters() {
  return (
    <div className={cx("d-flex", "flex-column", "gap-3", "mb-3")}>
      <h4 className={cx("d-sm-none", "mb-0")}>Filters</h4>

      <GroupSearchFilter filter={FILTER_CONTENT} />
      <GroupSearchFilter filter={FILTER_VISIBILITY} />
    </div>
  );
}

interface GroupSearchFilterProps {
  filter: Filter;
}
function GroupSearchFilter({ filter }: GroupSearchFilterProps) {
  return (
    <>
      <UncontrolledAccordion
        className={cx("d-block", "d-sm-none")}
        defaultOpen={[]}
        toggle={() => {}}
      >
        <AccordionItem data-cy="search-group-filter-content">
          <AccordionHeader targetId="search-group-filter-content">
            <h6 className={cx("fw-semibold", "mb-0")}>{filter.label}</h6>
          </AccordionHeader>
          <AccordionBody accordionId="search-group-filter-content">
            <Row className={cx("g-2", "g-sm-0")}>
              <GroupSearchFilterContent
                filter={filter}
                visualization="accordion"
              />
            </Row>
          </AccordionBody>
        </AccordionItem>
      </UncontrolledAccordion>
      <ListGroup flush className={cx("d-none", "d-sm-block")}>
        <ListGroupItem
          className={cx("border-bottom", "px-0", "pt-0")}
          data-cy="search-group-filter-content"
        >
          <h6 className="fw-semibold">{filter.label}</h6>
          <GroupSearchFilterContent filter={filter} visualization="list" />
        </ListGroupItem>
      </ListGroup>
    </>
  );
}

interface GroupSearchFilterContentProps {
  filter: Filter;
  visualization?: "accordion" | "list";
}
function GroupSearchFilterContent({
  filter,
  visualization = "list",
}: GroupSearchFilterContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get(filter.name) ?? "";

  const onChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (filter.type === "enum" && filter.doNotPassEmpty && !value) {
        params.delete(filter.name);
      } else {
        params.set(filter.name, value);
      }
      const page_default_value = (
        FILTER_PAGE.defaultValue as number
      ).toString();
      if (params.get(FILTER_PAGE.name) !== page_default_value) {
        params.set(FILTER_PAGE.name, page_default_value);
      }
      setSearchParams(params);
    },
    [filter, searchParams, setSearchParams]
  );

  const content =
    filter.type === "enum" ? (
      <>
        {filter.allowedValues.map((radio) => (
          <GroupSearchFilterRadioElement
            key={radio.value}
            identifier={`group-search-filter-content-${filter.name}-${radio.value}`}
            isChecked={current === radio.value}
            visualization={visualization}
            onChange={() => onChange(radio.value)}
          >
            {radio.label}
          </GroupSearchFilterRadioElement>
        ))}
      </>
    ) : null;

  return content;
}

interface GroupSearchFilterRadioElementProps {
  children: React.ReactNode;
  identifier: string;
  isChecked: boolean;
  onChange?: () => void;
  visualization: "accordion" | "list";
}
function GroupSearchFilterRadioElement({
  children,
  identifier,
  isChecked,
  onChange,
  visualization,
}: GroupSearchFilterRadioElementProps) {
  return (
    <div
      className={cx(
        visualization === "accordion" ? "w-100" : "d-flex",
        "p-1",
        "rounded-2",
        isChecked && "bg-body-secondary"
      )}
    >
      <input
        checked={isChecked}
        className={cx(
          visualization === "accordion"
            ? "btn-check"
            : ["cursor-pointer", "form-check-input"]
        )}
        data-cy={identifier}
        id={identifier}
        onChange={onChange}
        type="radio"
      />
      <label
        className={cx(
          visualization === "accordion"
            ? ["btn", "btn-outline-primary", "w-100"]
            : ["cursor-pointer", "form-check-label", "ps-2"]
        )}
        htmlFor={identifier}
      >
        {children}
      </label>
    </div>
  );
}

function GroupSearchResults() {
  // Load and visualize the search results
  const [searchParams] = useSearchParams();
  const { group } = useGroup();
  const params = useMemo(
    () => generateQueryParams(searchParams, group.slug),
    [group.slug, searchParams]
  );

  const { data } = useGetSearchQueryQuery({
    params,
  });

  return (
    <div>
      <h4 className={cx("d-block", "d-sm-none")}>Results</h4>

      {data?.items?.length ? (
        <>
          <ListGroup className="mb-3">
            {data.items.map((item) => {
              return (
                <SearchResultListItem
                  key={item.id}
                  item={item as GroupSearchEntity}
                />
              );
            })}
          </ListGroup>
          <Pagination
            currentPage={
              (searchParams.get(FILTER_PAGE.name) ??
                FILTER_PAGE.defaultValue) as number
            }
            perPage={
              (searchParams.get(FILTER_PER_PAGE.name) ??
                FILTER_PER_PAGE.defaultValue) as number
            }
            totalItems={data?.pagingInfo.totalResult ?? 0}
            pageQueryParam="page"
            showDescription={true}
          />
        </>
      ) : (
        <p className="text-muted">Nothing here. Try another search.</p>
      )}
    </div>
  );
}

interface SearchResultListItemProps {
  item: GroupSearchEntity;
}
function SearchResultListItem({ item }: SearchResultListItemProps) {
  return (
    <ListGroupItem>
      <h5 className="mb-1">{item.name}</h5>
      <p>{item.path}</p>
      <p>{item.slug}</p>
    </ListGroupItem>
  );
}
