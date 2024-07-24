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
 * limitations under the License.
 */

import cx from "classnames";
import { ReactNode, useCallback, useEffect } from "react";
import { Globe2, LockFill } from "react-bootstrap-icons";
import {
  Link,
  generatePath,
  useSearchParams,
} from "react-router-dom-v5-compat";
import { Card, CardBody, Col, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { Group, Project, User, searchV2Api } from "../api/searchV2Api.api";

export default function SearchV2Results() {
  const [, setSearchParams] = useSearchParams();

  const { page, perPage, query } = useAppSelector(({ searchV2 }) => searchV2);

  const [search, { data: searchResults }] =
    searchV2Api.endpoints.getQuery.useLazyQuery();

  useEffect(() => {
    if (query != null) {
      search({ page, perPage, q: query });
    }
  }, [page, perPage, query, search]);

  const onPageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        prev.set("page", `${page}`);
        return prev;
      });
    },
    [setSearchParams]
  );

  return (
    <Row data-cy="search-results">
      <Col className="d-sm-none" xs={12}>
        <h3>Results</h3>
      </Col>
      <Col xs={12}>
        <SearchV2ResultsContent />
      </Col>
      <Col className="mt-4" xs={12}>
        <Pagination
          currentPage={page}
          perPage={perPage}
          totalItems={searchResults?.pagingInfo.totalResult ?? 0}
          onPageChange={onPageChange}
          showDescription={true}
          className="rk-search-pagination"
        />
      </Col>
    </Row>
  );
}

function SearchV2ResultsContent() {
  const { page, perPage, query } = useAppSelector(({ searchV2 }) => searchV2);

  const searchResults = searchV2Api.endpoints.getQuery.useQueryState({
    page,
    perPage,
    q: query,
  });

  if (searchResults.isFetching) {
    return <Loader />;
  }

  // if (search.lastSearch == null) {
  if (query == null) {
    return <p>Start searching by typing in the search bar above.</p>;
  }

  if (!searchResults.data?.items?.length) {
    return (
      <>
        <p>
          No results for <span className="fw-bold">{`"${query}"`}</span>.
        </p>
        <p>You can try another search, or change some filters.</p>
      </>
    );
  }

  const resultsOutput = searchResults.data.items.map((entity, index) => {
    if (entity.type === "Project") {
      return (
        <SearchV2ResultProject
          searchByUser={(_userId) => {
            // dispatch(setCreatedBy(userId));
          }}
          key={`project-result-${entity.id}`}
          project={entity}
        />
      );
    } else if (entity.type === "Group") {
      return (
        <SearchV2ResultGroup key={`group-result-${entity.id}`} group={entity} />
      );
    } else if (entity.type === "User") {
      return (
        <SearchV2ResultUser key={`user-result-${entity.id}`} user={entity} />
      );
    }
    // Unknown entity type, in case backend introduces new types before the UI catches up
    return <SearchV2ResultsUnknown key={`unknown-result-${index}`} />;
  });

  return <Row className="gy-4">{resultsOutput}</Row>;
}

interface SearchV2ResultsCardProps {
  children?: ReactNode;
}
function SearchV2ResultsCard({ children }: SearchV2ResultsCardProps) {
  return (
    <Col xs={12} lg={6}>
      <Card className={cx("border", "rounded", "h-100")} data-cy="search-card">
        <CardBody className={cx("d-flex", "flex-column")}>{children}</CardBody>
      </Card>
    </Col>
  );
}

interface SearchV2CardTitleProps {
  children?: ReactNode;
  entityType: ReactNode;
  url: string;
}
function SearchV2CardTitle({
  children,
  entityType,
  url,
}: SearchV2CardTitleProps) {
  return (
    <div
      className={cx(
        "d-flex",
        "flex-row",
        "flex-wrap",
        "flex-sm-nowrap",
        "align-items-start",
        "h3"
      )}
    >
      <h3 className={cx("card-title", "fw-medium", "me-2")}>
        <Link className={cx("link-offset-1")} to={url}>
          {children}
        </Link>
      </h3>
      <div
        className={cx(
          "ms-auto",
          "pt-1",
          "fst-italic",
          "fs-6",
          "text-dark-emphasis"
        )}
      >
        {entityType}
      </div>
    </div>
  );
}

interface SearchV2ResultProjectProps {
  project: Project;
  searchByUser: (userId: string) => void;
}
function SearchV2ResultProject({ project }: SearchV2ResultProjectProps) {
  const { creationDate, description, name, namespace, slug, visibility } =
    project;

  const namespaceUrl =
    namespace?.type === "User"
      ? generatePath(ABSOLUTE_ROUTES.v2.users.show, {
          username: namespace?.namespace ?? "",
        })
      : generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: namespace?.namespace ?? "",
        });
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: namespace?.namespace ?? "",
    slug,
  });

  return (
    <SearchV2ResultsCard>
      <SearchV2CardTitle url={projectUrl} entityType="Project">
        {name}
      </SearchV2CardTitle>
      <p className={cx("mb-2", "card-text")}>
        <Link to={namespaceUrl}>
          {"@"}
          {namespace?.namespace}
        </Link>
      </p>
      {description && <p className={cx("mb-2", "card-text")}>{description}</p>}
      <div
        className={cx("mt-auto", "mb-0", "card-text", "d-flex", "flex-wrap")}
      >
        <div className={cx("flex-grow-1", "me-2")}>
          {visibility.toLowerCase() === "private" ? (
            <>
              <LockFill className={cx("bi", "me-1")} />
              Private
            </>
          ) : (
            <>
              <Globe2 className={cx("bi", "me-1")} />
              Public
            </>
          )}
        </div>
        <div>
          <TimeCaption datetime={creationDate} prefix="Created" enableTooltip />
        </div>
      </div>
    </SearchV2ResultsCard>
  );
}

interface SearchV2ResultGroupProps {
  group: Group;
}
function SearchV2ResultGroup({ group }: SearchV2ResultGroupProps) {
  const { name, namespace, description } = group;

  const groupUrl = generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
    slug: namespace,
  });

  return (
    <SearchV2ResultsCard>
      <SearchV2CardTitle url={groupUrl} entityType="Group">
        {name}
      </SearchV2CardTitle>
      <p className={cx("mb-2", "card-text")}>
        {"@"}
        {namespace}
      </p>
      {description && <p className={cx("mb-0", "card-text")}>{description}</p>}
    </SearchV2ResultsCard>
  );
}

interface SearchV2ResultUserProps {
  user: User;
}
function SearchV2ResultUser({ user }: SearchV2ResultUserProps) {
  const { firstName, lastName, namespace } = user;

  const userUrl = generatePath(ABSOLUTE_ROUTES.v2.users.show, {
    username: namespace ?? "",
  });

  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || namespace;

  return (
    <SearchV2ResultsCard>
      <SearchV2CardTitle url={userUrl} entityType="User">
        {displayName}
      </SearchV2CardTitle>
      <p className={cx("mb-0", "card-text")}>
        {"@"}
        {namespace}
      </p>
    </SearchV2ResultsCard>
  );
}

function SearchV2ResultsUnknown() {
  return (
    <SearchV2ResultsCard>
      <h4 className="mb-0">Unknown entity</h4>
      <p className="form-text mb-0">This entity type is not supported yet.</p>
    </SearchV2ResultsCard>
  );
}
