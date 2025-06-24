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
// import { useGroup } from "../show/GroupPageContainer";
import { useSearchParams } from "react-router";
import { Loader } from "~/components/Loader";
import { useGetSearchQueryQuery } from "~/features/searchV2/api/searchV2Api.api.ts";
import {
  generateQueryParams,
  getSearchQueryMissingFilters,
} from "./groupSearch.utils";

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
        <Col>
          <GroupSearchQueryInput />
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

// ! TODO: add this back
{
  /* <GroupSearchResultRecap
        query={query}
        total={data?.pagingInfo.totalResult}
        isFetching={isFetching}
      /> */
}

// interface GroupSearchResultRecapProps {
//   query?: string;
//   total?: number;
//   isFetching: boolean;
// }
// function GroupSearchResultRecap({
//   query,
//   total,
//   isFetching,
// }: GroupSearchResultRecapProps) {
//   return (
//     <p className="mb-0">
//       {isFetching ? (
//         "Loading results"
//       ) : (
//         <>
//           {total ? total : "No"} {total && total > 1 ? "results" : "result"}
//         </>
//       )}
//       {query && (
//         <>
//           {" "}
//           for <span className="fw-bold">{`"${query}"`}</span>
//         </>
//       )}
//     </p>
//   );
// }

function GroupSearchFilters() {
  return (
    <div>
      <h4 className="d-sm-none">Filters</h4>

      <GroupSearchFilterContent />
    </div>
  );
}

function GroupSearchFilterContent() {
  return (
    <>
      <UncontrolledAccordion
        className={cx("d-block", "d-sm-none")}
        defaultOpen={[]}
        toggle={() => {}}
      >
        <AccordionItem data-cy="search-group-filter-content">
          <AccordionHeader targetId="search-group-filter-content">
            <h6 className={cx("fw-semibold", "mb-0")}>Content</h6>
          </AccordionHeader>
          <AccordionBody accordionId="search-group-filter-content">
            <Row className={cx("g-3", "g-sm-0")}>
              <GroupSearchFilterContentMain visualization="accordion" />
            </Row>
          </AccordionBody>
        </AccordionItem>
      </UncontrolledAccordion>
      <ListGroup flush className={cx("d-none", "d-sm-block")}>
        <ListGroupItem
          className={cx("mb-3", "px-0", "pt-0")}
          data-cy="search-group-filter-content"
        >
          <h6 className="fw-semibold">Content</h6>
          <GroupSearchFilterContentMain visualization="list" />
        </ListGroupItem>
      </ListGroup>
    </>
  );
}

interface GroupSearchFilterPropsMain {
  visualization: "accordion" | "list";
}
function GroupSearchFilterContentMain({
  visualization,
}: GroupSearchFilterPropsMain) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get("type") ?? "";

  const onChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("type", value);
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  return (
    <div data-cy="group-search-filter-content">
      <GroupSearchFilterRadioElement
        identifier="group-search-filter-content-project"
        isChecked={current === "project"}
        visualization={visualization}
        onChange={() => onChange("project")}
      >
        Project
      </GroupSearchFilterRadioElement>
      <GroupSearchFilterRadioElement
        identifier="group-search-filter-content-dataconnector"
        isChecked={current === "dataconnector"}
        visualization={visualization}
        onChange={() => onChange("dataconnector")}
      >
        Data
      </GroupSearchFilterRadioElement>
    </div>
  );
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
    // <div>
    //   <h6 className={cx("fw-semibold", "mb-0")}>Content</h6>
    //   <div className={cx("form-check")}>
    //     <input
    //       className={cx("form-check-input")}
    //       data-cy="group-search-filter-content"
    //       id="group-search-filter-content"
    //       type="checkbox"
    //     />
    //     <label
    //       className={cx("form-check-label", "ps-2")}
    //       htmlFor="group-search-filter-content"
    //     >
    //       Content Filter
    //     </label>
    //   </div>
    // </div>

    <div className={cx(visualization === "accordion" ? "w-100" : "d-flex")}>
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
  const params = useMemo(
    () => generateQueryParams(searchParams),
    [searchParams]
  );

  const { data } = useGetSearchQueryQuery({
    params,
  });

  // ! TODO: Add some visualization

  return (
    <div>
      <h4>Results</h4>
      {data?.items?.length && (
        <ul>
          {data.items.map((item) => (
            <li key={item.id}>
              <p>{item.slug}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ! TODO: implement the useGetQuery hook to get the search query from the URL
// ! Check what we do in the search page and, hopefully, re-use that
// function useGetQuery(): string {
//   const [searchParams] = useSearchParams();
//   return searchParams.get("q") ?? "";
// }
