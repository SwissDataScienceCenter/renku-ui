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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { generatePath, Link, useSearchParams } from "react-router";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
  Button,
  Col,
  Form,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledAccordion,
} from "reactstrap";
import { Loader } from "~/components/Loader";
import Pagination from "~/components/Pagination";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { useGroupSearch } from "./groupSearch.hook";
import { Filter, GroupSearchEntity } from "./groupSearch.types";
import {
  getQueryHumanReadable,
  getSearchQueryMissingFilters,
} from "./groupSearch.utils";
import {
  DEFAULT_ELEMENTS_LIMIT_IN_FILTERS,
  FILTER_CONTENT,
  FILTER_KEYWORD,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_VISIBILITY,
  VALUE_SEPARATOR_AND,
} from "./groupsSearch.constants";

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
  const { data, isFetching } = useGroupSearch();

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
  const [searchParams] = useSearchParams();
  const { data: search } = useGroupSearch();
  const { data: searchAnyType } = useGroupSearch([FILTER_CONTENT.name]);

  // Add numbers to the content types. Mind that this requires an additional request.
  const hydratedFilterContentAllowedValues = useMemo(() => {
    return FILTER_CONTENT.allowedValues.map((option) => ({
      ...option,
      quantity: searchAnyType?.facets?.entityType?.[option.value] ?? 0,
    }));
  }, [searchAnyType?.facets?.entityType]);
  const filterContentWithQuantities = useMemo<Filter>(() => {
    return {
      ...FILTER_CONTENT,
      allowedValues: hydratedFilterContentAllowedValues,
    };
  }, [hydratedFilterContentAllowedValues]);

  // Create the enum element for keywords with quantities.
  const hydratedFilterKeywordAllowedValues = useMemo(() => {
    return Object.entries(search?.facets?.keywords ?? {})
      .map(([value, quantity]) => ({
        value,
        label: value,
        quantity,
      }))
      .sort((a, b) => {
        // sort by quantity first, then by value
        const qtyDiff = b.quantity - a.quantity;
        if (qtyDiff !== 0) return qtyDiff;
        return a.value.localeCompare(b.value);
      });
  }, [search?.facets?.keywords]);
  // Add the current keywords if missing so users can always de-select.
  if (searchParams.get(FILTER_KEYWORD.name)) {
    const existingKeywords =
      searchParams.get(FILTER_KEYWORD.name)?.split(VALUE_SEPARATOR_AND) ?? [];
    existingKeywords.forEach((keyword) => {
      if (
        !hydratedFilterKeywordAllowedValues.some(
          (v) => v.label === keyword.trim()
        )
      ) {
        hydratedFilterKeywordAllowedValues.unshift({
          value: keyword.trim(),
          label: keyword.trim(),
          quantity: 0,
        });
      }
    });
  }
  const filterKeywordWithQuantities = useMemo<Filter>(() => {
    return {
      ...FILTER_KEYWORD,
      allowedValues: hydratedFilterKeywordAllowedValues,
    };
  }, [hydratedFilterKeywordAllowedValues]);

  return (
    <div className={cx("d-flex", "flex-column", "gap-3", "mb-3")}>
      <h4 className={cx("d-sm-none", "mb-0")}>Filters</h4>

      <GroupSearchFilter filter={filterContentWithQuantities} />
      <GroupSearchFilter filter={FILTER_VISIBILITY} />
      <GroupSearchFilter
        defaultElementsToShow={10}
        filter={filterKeywordWithQuantities}
      />
    </div>
  );
}

interface GroupSearchFilterProps {
  defaultElementsToShow?: number;
  filter: Filter;
}
function GroupSearchFilter({
  defaultElementsToShow = DEFAULT_ELEMENTS_LIMIT_IN_FILTERS,
  filter,
}: GroupSearchFilterProps) {
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
                defaultElementsToShow={defaultElementsToShow}
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
          <GroupSearchFilterContent
            defaultElementsToShow={defaultElementsToShow}
            filter={filter}
            visualization="list"
          />
        </ListGroupItem>
      </ListGroup>
    </>
  );
}

interface GroupSearchFilterContentProps {
  defaultElementsToShow?: number;
  filter: Filter;
  visualization?: "accordion" | "list";
}
function GroupSearchFilterContent({
  defaultElementsToShow,
  filter,
  visualization = "list",
}: GroupSearchFilterContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAll, setShowAll] = useState(false);
  const current = searchParams.get(filter.name) ?? "";
  const allowSelectMany = filter.type === "enum" && filter.allowSelectMany;

  const onChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (filter.doNotPassEmpty && !value) {
        params.delete(filter.name);
      } else if (allowSelectMany) {
        // Move logic to handle multiple values to a utility function?
        const currentValues =
          params.get(filter.name)?.split(VALUE_SEPARATOR_AND) ?? [];
        if (currentValues.includes(value)) {
          const newValues = currentValues.filter((v) => v !== value);
          if (newValues.length > 0) {
            params.set(filter.name, newValues.join(VALUE_SEPARATOR_AND));
          } else {
            params.delete(filter.name);
          }
        } else {
          currentValues.push(value);
          params.set(filter.name, currentValues.join(VALUE_SEPARATOR_AND));
        }
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
    [allowSelectMany, filter, searchParams, setSearchParams]
  );

  if (filter.type === "enum") {
    const elementsToShow =
      !defaultElementsToShow || showAll
        ? filter.allowedValues
        : filter.allowedValues.slice(0, defaultElementsToShow);
    return (
      <>
        {elementsToShow.length > 0 ? (
          <>
            {elementsToShow.map((element) => {
              return (
                <GroupSearchFilterRadioOrCheckboxElement
                  identifier={`group-search-filter-content-${filter.name}-${element.value}`}
                  isChecked={
                    allowSelectMany
                      ? current
                          .split(VALUE_SEPARATOR_AND)
                          .includes(element.value)
                      : current === element.value
                  }
                  key={element.value}
                  onChange={() => onChange(element.value)}
                  visualization={visualization}
                  type={filter.allowSelectMany ? "checkbox" : "radio"}
                >
                  {element.label}
                  {element.quantity !== undefined ? (
                    <Badge className="ms-1">{element.quantity}</Badge>
                  ) : null}
                </GroupSearchFilterRadioOrCheckboxElement>
              );
            })}
            {defaultElementsToShow &&
              defaultElementsToShow < filter.allowedValues.length && (
                <Button
                  className={cx("m-1", "p-0")}
                  color="link"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show less" : "Show all"}
                </Button>
              )}
          </>
        ) : (
          <p className={cx("fst-italic", "mb-0", "text-muted")}>None</p>
        )}
      </>
    );
  }

  return null;
}

interface GroupSearchFilterRadioOrCheckboxElementProps {
  children: React.ReactNode;
  identifier: string;
  isChecked: boolean;
  onChange?: () => void;
  type: "radio" | "checkbox";
  visualization: "accordion" | "list";
}
function GroupSearchFilterRadioOrCheckboxElement({
  children,
  identifier,
  isChecked,
  onChange,
  type,
  visualization,
}: GroupSearchFilterRadioOrCheckboxElementProps) {
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
        type={type}
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
  const { data } = useGroupSearch();

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
  const sortedKeywords = useMemo(() => {
    if (!item.keywords) return [];
    return item.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [item.keywords]);

  return (
    <Link
      className={cx(
        "link-primary",
        "text-body",
        "text-decoration-none",
        "list-group-item",
        "list-group-item-action"
      )}
      to={generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
        namespace: item.namespace?.path ?? "",
        slug: item.slug,
      })}
    >
      <ListGroupItem>
        <h5 className="mb-1">{item.name}</h5>
        <p>{item.path}</p>
        <p>{item.slug}</p>
        <KeywordContainer>
          {sortedKeywords.map((keyword, index) => (
            <KeywordBadge key={index}>{keyword}</KeywordBadge>
          ))}
        </KeywordContainer>
      </ListGroupItem>
    </Link>
  );
}
