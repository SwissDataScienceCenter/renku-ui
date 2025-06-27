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
  FILTER_MEMBER,
  FILTER_PAGE,
  FILTER_PER_PAGE,
  FILTER_QUERY,
  FILTER_VISIBILITY,
  VALUE_SEPARATOR_AND,
} from "./groupsSearch.constants";
import { useGroup } from "../show/GroupPageContainer";
import { useGetGroupsByGroupSlugMembersQuery } from "~/features/projectsV2/api/namespace.api";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { Search, XCircleFill } from "react-bootstrap-icons";
import { ShowGlobalDataConnector } from "~/features/searchV2/components/SearchV2Results";

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
  const query = searchParams.get(FILTER_QUERY.name) ?? "";

  const { control, register, handleSubmit, setFocus } = useForm<SearchBarForm>({
    defaultValues: { query },
  });

  // focus search input when loading the component
  useEffect(() => {
    setFocus("query");
  }, [setFocus]);

  const onClick = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(FILTER_QUERY.name, "");
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const onSubmit = useCallback(
    (data: SearchBarForm) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(FILTER_QUERY.name, data.query);
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
            color="outline-secondary"
            className={cx(
              "border-0",
              "border-top",
              "border-bottom",
              "shadow-none"
            )}
            data-cy="group-search-button"
            onClick={onClick}
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

function GroupSearchResultRecap() {
  // Get the query and results data
  const [searchParams] = useSearchParams();
  const { data, isFetching } = useGroupSearch();
  const total = data?.pagingInfo.totalResult;
  const filters = getQueryHumanReadable(searchParams);
  const query = searchParams.get(FILTER_QUERY.name) ?? "";

  return (
    <p className="mb-0">
      {isFetching ? (
        "Fetching results"
      ) : (
        <span className={cx("mb-0", "fw-semibold")}>
          {total ? total : "No"} {total && total > 1 ? "results" : "result"}
        </span>
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
          (filtered by <>{filters}</>)
        </>
      )}
    </p>
  );
}

interface GroupFilterKeywordRenderingProps {
  label: string;
  quantity: number;
}
function GroupFilterKeywordRendering({
  label,
  quantity,
}: GroupFilterKeywordRenderingProps) {
  return (
    <div className={cx("align-items-center", "d-flex")}>
      <div className="fs-5">
        <KeywordBadge className="text-wrap">{label}</KeywordBadge>
      </div>
      <Badge className="ms-1">{quantity}</Badge>
    </div>
  );
}

function GroupSearchFilters() {
  const [searchParams] = useSearchParams();
  const { data: search } = useGroupSearch();
  const { data: searchAnyType } = useGroupSearch([FILTER_CONTENT.name]);
  const { group } = useGroup();
  const { data: groupMembers } = useGetGroupsByGroupSlugMembersQuery({
    groupSlug: group.slug,
  });

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

  // Create the enum filter for keywords with quantities.
  const hydratedFilterKeywordAllowedValues = useMemo(() => {
    return Object.entries(search?.facets?.keywords ?? {})
      .map(([value, quantity]) => ({
        value,
        label: (
          <GroupFilterKeywordRendering label={value} quantity={quantity} />
        ),
        _label: value,
        _quantity: quantity,
      }))
      .sort((a, b) => {
        // sort by quantity first, then by value
        const qtyDiff = b._quantity - a._quantity;
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
          (v) => v._label === keyword.trim()
        )
      ) {
        hydratedFilterKeywordAllowedValues.unshift({
          value: keyword.trim(),
          label: (
            <GroupFilterKeywordRendering label={keyword.trim()} quantity={0} />
          ),
          _label: keyword.trim(),
          _quantity: 0,
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

  // Create the enum filter for members
  const hydratedFilterMembersAllowedValues = useMemo(() => {
    return (
      groupMembers?.map((member) => ({
        value: `@${member.namespace}`,
        label: (
          <div className={cx("align-items-center", "d-flex", "gap-1")}>
            <UserAvatar namespace={member.namespace ?? ""} />{" "}
            {member.first_name} {member.last_name}
          </div>
        ),
      })) ?? []
    );
  }, [groupMembers]);
  const filterMembersWithValues = useMemo<Filter>(() => {
    return {
      ...FILTER_MEMBER,
      allowedValues: [
        { value: "", label: "Any" },
        ...hydratedFilterMembersAllowedValues,
      ],
    };
  }, [hydratedFilterMembersAllowedValues]);

  return (
    <div className={cx("d-flex", "flex-column", "gap-3", "mb-3")}>
      <h4 className={cx("d-sm-none", "mb-0")}>Filters</h4>

      <GroupSearchFilter filter={filterContentWithQuantities} />
      <GroupSearchFilter filter={filterMembersWithValues} />
      <GroupSearchFilter
        defaultElementsToShow={10}
        filter={filterKeywordWithQuantities}
      />
      <GroupSearchFilter filter={FILTER_VISIBILITY} />
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
  // Do not show invalid filter, but give the opportunity to reset it.
  const [searchParams, setSearchParams] = useSearchParams();
  const searchedType = searchParams.get(FILTER_CONTENT.name);

  const resetFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete(filter.name);
    setSearchParams(params);
  }, [filter.name, searchParams, setSearchParams]);

  const isInvalid = useMemo(() => {
    return (
      filter.validFor &&
      !filter.validFor.includes(searchedType as GroupSearchEntity["type"])
    );
  }, [filter.validFor, searchedType]);
  if (isInvalid && searchParams.get(filter.name) === null) return null;

  return (
    <>
      <UncontrolledAccordion
        className={cx("d-block", "d-sm-none")}
        defaultOpen={[]}
        toggle={() => {}}
      >
        <AccordionItem data-cy="search-group-filter-content">
          <AccordionHeader targetId="search-group-filter-content">
            <h6
              className={cx("fw-semibold", "mb-0", isInvalid && "text-danger")}
            >
              {filter.label}
            </h6>
          </AccordionHeader>
          <AccordionBody accordionId="search-group-filter-content">
            <Row className={cx("g-2", "g-sm-0")}>
              {isInvalid ? (
                <Col xs={12}>
                  <p className={cx("fst-italic", "mb-3", "text-muted")}>
                    This filter is set, not valid for the current Content.
                  </p>
                  <Button
                    className="w-100"
                    color="outline-danger"
                    onClick={resetFilter}
                    data-cy={`group-search-filter-${filter.name}-reset`}
                  >
                    <XCircleFill className={cx("bi", "me-1")} />
                    Reset filter
                  </Button>
                </Col>
              ) : (
                <GroupSearchFilterContent
                  defaultElementsToShow={defaultElementsToShow}
                  filter={filter}
                  visualization="accordion"
                />
              )}
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
          {isInvalid ? (
            <>
              <p className={cx("fst-italic", "mb-2", "text-muted")}>
                This filter is set, not valid for the current Content.
              </p>
              <Button
                color="outline-danger"
                onClick={resetFilter}
                data-cy={`group-search-filter-${filter.name}-reset`}
                size="sm"
              >
                <XCircleFill className={cx("bi", "me-1")} />
                Reset filter
              </Button>
            </>
          ) : (
            <GroupSearchFilterContent
              defaultElementsToShow={defaultElementsToShow}
              filter={filter}
              visualization="list"
            />
          )}
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
                  identifier={`group-search-filter-${filter.name}-${element.value}`}
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
            : ["cursor-pointer", "form-check-input", "my-auto"]
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
      <ShowGlobalDataConnector />
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

  const url =
    item.type === "Project"
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: item.namespace?.path ?? "",
          slug: item.slug,
        })
      : item.type === "DataConnector"
      ? `${location.search}#data-connector-${item.id}`
      : "";

  return (
    <Link
      className={cx(
        "link-primary",
        "text-body",
        "text-decoration-none",
        "list-group-item",
        "list-group-item-action"
      )}
      to={url}
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
