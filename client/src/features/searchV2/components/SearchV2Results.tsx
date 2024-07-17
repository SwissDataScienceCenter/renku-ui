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
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useDispatch } from "react-redux";
import { Link, generatePath } from "react-router-dom-v5-compat";
import { Badge, Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import { ReactNode } from "react";
import { Globe2, Lock } from "react-bootstrap-icons";
import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { Group, Project, User, searchV2Api } from "../api/searchV2Api.api";
import { setCreatedBy, setPage } from "../searchV2.slice";

export default function SearchV2Results() {
  const searchState = useAppSelector((state) => state.searchV2);
  const dispatch = useDispatch();

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
          currentPage={searchState.search.page}
          perPage={searchState.search.perPage}
          totalItems={searchState.search.totalResults}
          onPageChange={(page: number) => {
            dispatch(setPage(page));
          }}
          showDescription={true}
          className="rk-search-pagination"
        />
      </Col>
    </Row>
  );
}

function SearchV2ResultsContent() {
  const dispatch = useDispatch();
  // get the search state
  const { search } = useAppSelector((state) => state.searchV2);
  const searchResults = searchV2Api.endpoints.$get.useQueryState(
    search.lastSearch != null
      ? {
          q: search.lastSearch,
          page: search.page,
          perPage: search.perPage,
        }
      : skipToken
  );

  if (searchResults.isFetching) {
    return <Loader />;
  }
  if (search.lastSearch == null) {
    return <p>Start searching by typing in the search bar above.</p>;
  }

  if (!searchResults.data?.items?.length) {
    return (
      <>
        <p>
          No results for{" "}
          <span className="fw-bold">{`"${search.lastSearch}"`}</span>.
        </p>
        <p>You can try another search, or change some filters.</p>
      </>
    );
  }

  const resultsOutput = searchResults.data.items.map((entity, index) => {
    if (entity.type === "Project") {
      return (
        <SearchV2ResultProject
          searchByUser={(userId) => {
            dispatch(setCreatedBy(userId));
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

  return <Row className="g-3">{resultsOutput}</Row>;
}

interface SearchV2ResultsCardProps {
  children?: ReactNode;
}
function SearchV2ResultsContainer({ children }: SearchV2ResultsCardProps) {
  return (
    <Col xs={12} lg={6} xxl={4} data-cy="search-card">
      <Card className="h-100">{children}</Card>
    </Col>
  );
}

interface SearchV2CardTitleProps {
  name: string;
  nameUrl: string;
  namespace: string;
  namespaceUrl: string;
  entityType?: "Project" | "Group" | "User";
}
function SearchV2CardTitle({
  entityType,
  name,
  nameUrl,
  namespace,
  namespaceUrl,
}: SearchV2CardTitleProps) {
  return (
    <CardHeader className={cx("d-flex", "gap-2")}>
      <div>
        <h5 className="mb-1">
          <Link to={nameUrl}>{name}</Link>
        </h5>
        <p className="mb-0">
          <Link to={namespaceUrl}>@{namespace}</Link>
        </p>
      </div>
      {entityType && (
        <div className={cx("mb-auto", "ms-auto")}>
          <Badge
            pill
            className={cx(
              "border",
              "border-dark-subtle",
              "bg-light",
              "text-dark-emphasis"
            )}
          >
            {entityType}
          </Badge>
        </div>
      )}
    </CardHeader>
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
    <SearchV2ResultsContainer>
      <SearchV2CardTitle
        entityType="Project"
        name={name}
        nameUrl={projectUrl}
        namespace={namespace?.namespace ?? ""}
        namespaceUrl={namespaceUrl}
      />
      <CardBody className={cx("d-flex", "flex-column", "h-100")}>
        {description && (
          <p
            style={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}
          >
            {description}
          </p>
        )}
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "flex-wrap",
            "gap-2",
            "justify-content-between",
            "mt-auto"
          )}
        >
          <div>
            {visibility.toLowerCase() === "private" ? (
              <>
                <Lock className={cx("me-2", "text-icon")} />
                Private
              </>
            ) : (
              <>
                <Globe2 className={cx("me-2", "text-icon")} />
                Public
              </>
            )}
          </div>
          <TimeCaption datetime={creationDate} prefix="Created" enableTooltip />
        </div>
      </CardBody>
    </SearchV2ResultsContainer>
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
    <SearchV2ResultsContainer>
      <SearchV2CardTitle
        entityType="Group"
        name={name}
        nameUrl={groupUrl}
        namespace={namespace}
        namespaceUrl={groupUrl}
      />

      <CardBody className={cx("d-flex", "flex-column", "h-100")}>
        {description && (
          <p
            className="mb-0"
            style={{
              display: "-webkit-box",
              overflow: "hidden",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
            }}
          >
            {description}
          </p>
        )}
      </CardBody>
    </SearchV2ResultsContainer>
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
    <SearchV2ResultsContainer>
      <SearchV2CardTitle
        entityType="User"
        name={displayName || "unknown"}
        nameUrl={userUrl}
        namespace={namespace || "unknown"}
        namespaceUrl={userUrl}
      />
      <CardBody />
    </SearchV2ResultsContainer>
  );
}

function SearchV2ResultsUnknown() {
  return (
    <SearchV2ResultsContainer>
      <CardHeader>
        <h5 className="mb-0">Unknown entity</h5>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "h-100")}>
        <p className="mb-0">This entity type is not supported yet.</p>
      </CardBody>
    </SearchV2ResultsContainer>
  );
}
