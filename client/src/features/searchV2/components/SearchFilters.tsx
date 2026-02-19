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
import { DateTime } from "luxon";
import React, { useCallback, useMemo, useState } from "react";
import { XCircleFill } from "react-bootstrap-icons";
import { useSearchParams } from "react-router";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Badge,
  Button,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledAccordion,
} from "reactstrap";

import KeywordBadge from "~/components/keywords/KeywordBadge";
import { useGetGroupsByGroupSlugMembersQuery } from "~/features/projectsV2/api/namespace.api";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import {
  DEFAULT_ELEMENTS_LIMIT_IN_FILTERS,
  FILTER_CONTENT,
  FILTER_CONTENT_NAMESPACE,
  FILTER_DATE,
  FILTER_KEYWORD,
  FILTER_MEMBER,
  FILTER_MY_ROLE,
  FILTER_VISIBILITY,
  VALUE_SEPARATOR_AND,
} from "../contextSearch.constants";
import { Filter, GroupSearchEntity } from "../contextSearch.types";
import {
  buildCustomDateFilterValue,
  parseCustomDateFilter,
} from "../contextSearch.utils";
import { useContextSearch } from "../hooks/useContextSearch.hook";
import { useSearchFilterParam } from "../hooks/useSearchFilterParam.hook";

export default function SearchFilters() {
  const [searchParams] = useSearchParams();
  const { data: search } = useContextSearch();
  const { data: searchAnyType } = useContextSearch([FILTER_CONTENT.name]);
  const { namespace, kind } = useNamespaceContext();
  const { data: groupMembers } = useGetGroupsByGroupSlugMembersQuery(
    {
      groupSlug: namespace ?? "",
    },
    { skip: kind !== "group" || !namespace }
  );
  const isNamespace = kind == "group" || kind == "user";

  // Add numbers to the content types. Mind that this requires an additional request.
  const filterContentByType =
    kind === "group" || kind === "user"
      ? FILTER_CONTENT_NAMESPACE
      : FILTER_CONTENT;
  const hydratedFilterContentAllowedValues = useMemo(() => {
    return filterContentByType.allowedValues.map((option) => ({
      ...option,
      quantity: searchAnyType?.facets?.entityType?.[option.value] ?? 0,
    }));
  }, [searchAnyType?.facets?.entityType, filterContentByType.allowedValues]);
  const filterContentWithQuantities = useMemo<Filter>(() => {
    return {
      ...filterContentByType,
      allowedValues: hydratedFilterContentAllowedValues,
    };
  }, [hydratedFilterContentAllowedValues, filterContentByType]);

  // Create the enum filter for keywords with quantities.
  const selectedKeywords = useMemo(() => {
    return (
      searchParams.get(FILTER_KEYWORD.name)?.split(VALUE_SEPARATOR_AND) ?? []
    );
  }, [searchParams]);
  const hydratedFilterKeywordAllowedValues = useMemo(() => {
    return Object.entries(search?.facets?.keywords ?? {})
      .map(([value, quantity]) => ({
        value,
        label: (
          <FilterKeywordRendering
            label={value}
            quantity={quantity}
            selected={selectedKeywords.includes(value)}
          />
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
  }, [search?.facets?.keywords, selectedKeywords]);
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
            <FilterKeywordRendering
              label={keyword.trim()}
              quantity={0}
              selected={selectedKeywords.includes(keyword.trim())}
            />
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
        { value: "", label: "All members" },
        ...hydratedFilterMembersAllowedValues,
      ],
    };
  }, [hydratedFilterMembersAllowedValues]);

  return (
    <div className={cx("d-flex", "flex-column", "gap-3", "mb-3")}>
      <h4 className={cx("d-sm-none", "mb-0")}>Filters</h4>

      <SearchFilter filter={filterContentWithQuantities} />
      {kind == "group" && <SearchFilter filter={filterMembersWithValues} />}

      <SearchFilter
        defaultElementsToShow={10}
        filter={filterKeywordWithQuantities}
        hiddenDecoration
      />

      <SearchFilter filter={FILTER_VISIBILITY} />
      <SearchFilter
        filter={FILTER_DATE}
        renderAfterOptions={(visualization) => (
          <SearchDateFilterCustomOption
            filter={FILTER_DATE}
            visualization={visualization}
          />
        )}
      />
      {!isNamespace && <SearchFilter filter={FILTER_MY_ROLE} />}
    </div>
  );
}

interface FilterKeywordRenderingProps {
  label: string;
  quantity: number;
  selected?: boolean;
}
function FilterKeywordRendering({
  label,
  quantity,
  selected = false,
}: FilterKeywordRenderingProps) {
  return (
    <div className={cx("align-items-center", "d-flex")}>
      <div className="fs-3">
        <KeywordBadge
          className={cx(
            "align-items-center",
            "d-flex",
            "gap-1",
            "text-break",
            "text-wrap"
          )}
          highlighted={selected}
        >
          <span>{label}</span>
          <Badge>{quantity}</Badge>
        </KeywordBadge>
      </div>
    </div>
  );
}

interface SearchFilterProps {
  defaultElementsToShow?: number;
  filter: Filter;
  hiddenDecoration?: boolean;
  renderAfterOptions?: (visualization: "accordion" | "list") => React.ReactNode;
}
function SearchFilter({
  defaultElementsToShow = DEFAULT_ELEMENTS_LIMIT_IN_FILTERS,
  filter,
  hiddenDecoration = false,
  renderAfterOptions,
}: SearchFilterProps) {
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
            <h4
              className={cx("fw-semibold", "mb-0", isInvalid && "text-danger")}
            >
              {filter.label}
            </h4>
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
                    data-cy={`search-filter-${filter.name}-reset`}
                  >
                    <XCircleFill className={cx("bi", "me-1")} />
                    Reset filter
                  </Button>
                </Col>
              ) : (
                <SearchFilterContent
                  defaultElementsToShow={defaultElementsToShow}
                  filter={filter}
                  hiddenDecoration={hiddenDecoration}
                  renderAfterOptions={renderAfterOptions}
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
          <h4 className="fw-semibold">{filter.label}</h4>
          {isInvalid ? (
            <>
              <p className={cx("fst-italic", "mb-2", "text-muted")}>
                This filter is set, not valid for the current Content.
              </p>
              <Button
                color="outline-danger"
                onClick={resetFilter}
                data-cy={`search-filter-${filter.name}-reset`}
                size="sm"
              >
                <XCircleFill className={cx("bi", "me-1")} />
                Reset filter
              </Button>
            </>
          ) : (
            <SearchFilterContent
              defaultElementsToShow={defaultElementsToShow}
              filter={filter}
              hiddenDecoration={hiddenDecoration}
              renderAfterOptions={renderAfterOptions}
              visualization="list"
            />
          )}
        </ListGroupItem>
      </ListGroup>
    </>
  );
}

interface SearchFilterContentProps {
  defaultElementsToShow?: number;
  filter: Filter;
  hiddenDecoration?: boolean;
  renderAfterOptions?: (visualization: "accordion" | "list") => React.ReactNode;
  visualization?: "accordion" | "list";
}
function SearchFilterContent({
  defaultElementsToShow,
  filter,
  hiddenDecoration,
  renderAfterOptions,
  visualization = "list",
}: SearchFilterContentProps) {
  const [showAll, setShowAll] = useState(false);
  const { currentValue: current, updateParam } = useSearchFilterParam(
    filter.name
  );
  const allowSelectMany = filter.type === "enum" && filter.allowSelectMany;

  const onChange = useCallback(
    (value: string) => {
      if (filter.doNotPassEmpty && !value) {
        updateParam("");
      } else if (allowSelectMany) {
        const separator = filter.valueSeparator ?? VALUE_SEPARATOR_AND;
        const currentValues = current ? current.split(separator) : [];
        if (currentValues.includes(value)) {
          const newValues = currentValues.filter((v) => v !== value);
          updateParam(newValues.join(separator));
        } else {
          updateParam([...currentValues, value].join(separator));
        }
      } else {
        updateParam(value);
      }
    },
    [allowSelectMany, current, filter, updateParam]
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
                <SearchFilterRadioOrCheckboxElement
                  identifier={`search-filter-${filter.name}-${
                    element.id ?? element.value
                  }`}
                  isChecked={
                    allowSelectMany
                      ? current
                          .split(filter.valueSeparator ?? VALUE_SEPARATOR_AND)
                          .includes(element.value)
                      : current === element.value
                  }
                  hiddenDecoration={hiddenDecoration}
                  key={element.value}
                  onChange={() => onChange(element.value)}
                  visualization={visualization}
                  type={filter.allowSelectMany ? "checkbox" : "radio"}
                >
                  {element.label}
                  {element.quantity !== undefined ? (
                    <Badge className="ms-1">{element.quantity}</Badge>
                  ) : null}
                </SearchFilterRadioOrCheckboxElement>
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
        {renderAfterOptions?.(visualization)}
      </>
    );
  }

  return null;
}

interface SearchFilterRadioOrCheckboxElementProps {
  children: React.ReactNode;
  hiddenDecoration?: boolean;
  identifier: string;
  isChecked: boolean;
  onChange?: () => void;
  type: "radio" | "checkbox";
  visualization: "accordion" | "list";
}
function SearchFilterRadioOrCheckboxElement({
  children,
  hiddenDecoration,
  identifier,
  isChecked,
  onChange,
  type,
  visualization,
}: SearchFilterRadioOrCheckboxElementProps) {
  return (
    <div
      className={cx(
        visualization === "accordion" ? "w-100" : "d-flex",
        "p-1",
        "rounded-2",
        isChecked && !hiddenDecoration && "bg-body-secondary"
      )}
    >
      <input
        checked={isChecked}
        className={cx(
          hiddenDecoration
            ? "d-none"
            : visualization === "accordion"
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
          hiddenDecoration
            ? "cursor-pointer"
            : visualization === "accordion"
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

interface SearchDateInputProps {
  id: string;
  label: string;
  max?: string;
  min?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

function SearchDateInput({
  id,
  label,
  max,
  min,
  onChange,
  value,
}: SearchDateInputProps) {
  return (
    <div>
      <label className={cx("form-label", "small", "mb-1")} htmlFor={id}>
        {label}
      </label>
      <input
        className={cx("form-control", "form-control-sm")}
        data-cy={id}
        id={id}
        max={max}
        min={min}
        onChange={onChange}
        type="date"
        value={value}
      />
    </div>
  );
}

interface SearchDateFilterCustomOptionProps {
  filter: Filter;
  visualization: "accordion" | "list";
}

function SearchDateFilterCustomOption({
  filter,
  visualization,
}: SearchDateFilterCustomOptionProps) {
  const { currentValue, updateParam } = useSearchFilterParam(filter.name);

  const predefinedValues = useMemo(
    () =>
      filter.type === "enum" ? filter.allowedValues.map((v) => v.value) : [],
    [filter]
  );

  const isCustom =
    currentValue !== "" && !predefinedValues.includes(currentValue);

  const { afterDate, beforeDate } = useMemo(
    () =>
      isCustom
        ? parseCustomDateFilter(currentValue)
        : { afterDate: "", beforeDate: "" },
    [currentValue, isCustom]
  );

  const today = useMemo(() => DateTime.utc().toISODate() ?? "", []);

  const onSelectCustom = useCallback(() => {
    if (!isCustom) {
      updateParam(`<${today}`);
    }
  }, [isCustom, today, updateParam]);

  const onChangeAfter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParam(buildCustomDateFilterValue(e.target.value, beforeDate));
    },
    [beforeDate, updateParam]
  );

  const onChangeBefore = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParam(buildCustomDateFilterValue(afterDate, e.target.value));
    },
    [afterDate, updateParam]
  );

  const id = `search-filter-${filter.name}-custom`;

  return (
    <>
      <SearchFilterRadioOrCheckboxElement
        identifier={id}
        isChecked={isCustom}
        onChange={onSelectCustom}
        type="radio"
        visualization={visualization}
      >
        Custom
      </SearchFilterRadioOrCheckboxElement>
      {isCustom && (
        <div className={cx("d-flex", "flex-column", "gap-2", "mt-2", "ps-4")}>
          <SearchDateInput
            id={`${id}-after`}
            label="From:"
            max={beforeDate || today}
            onChange={onChangeAfter}
            value={afterDate}
          />
          <SearchDateInput
            id={`${id}-before`}
            label="To:"
            max={today}
            min={afterDate || undefined}
            onChange={onChangeBefore}
            value={beforeDate}
          />
        </div>
      )}
    </>
  );
}
