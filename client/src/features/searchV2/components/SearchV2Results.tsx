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
import { Button, Card, CardBody, Col, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { searchV2Api, Project, User } from "../api/searchV2Api.api";
import { setCreatedBy, setPage } from "../searchV2.slice";

// import searchV2Api from "../searchV2.api";
// import { ProjectSearchResult, UserSearchResult } from "../searchV2.types";

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
    } else if (entity.type === "User") {
      return (
        <SearchV2ResultUser key={`user-result-${entity.id}`} user={entity} />
      );
    }
    // Unknown entity type, in case backend introduces new types before the UI catches up
    return (
      <SearchV2ResultsUnknown key={`unknown-result-${index}`} index={index} />
    );
  });

  return <Row className="gy-4">{resultsOutput}</Row>;
}

interface SearchV2ResultsCardProps {
  cardId: string;
  children: React.ReactNode;
  url?: string;
}
function SearchV2ResultsCard({ cardId, children }: SearchV2ResultsCardProps) {
  return (
    <Col key={cardId} xs={12} lg={6}>
      <div data-cy="search-card">
        <Card className={cx("border", "rounded")}>
          <CardBody>{children}</CardBody>
        </Card>
      </div>
    </Col>
  );
}

interface SearchV2ResultProjectProps {
  project: Project;
  searchByUser: (userId: string) => void;
}
function SearchV2ResultProject({
  project,
  searchByUser,
}: SearchV2ResultProjectProps) {
  const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: project.namespace ?? "",
    slug: project.slug,
  });
  return (
    <SearchV2ResultsCard
      key={`project-${project.id}`}
      cardId={`project-card-${project.id}`}
    >
      <Link to={url}>
        <h4 className="mb-0">{project.name}</h4>
      </Link>
      <p className={cx("form-text", "mb-0")}>
        {project.slug} - {project.visibility}
      </p>
      <p className={cx("form-text", "text-rk-green")}>
        <Button
          className="pe-0 ps-1 pt-0 pb-0 mb-1"
          color="link"
          onClick={() => searchByUser(project.createdBy.id)}
        >
          user-{project.createdBy.id}
        </Button>
      </p>
      <p>{project.description}</p>
      <p className="form-text mb-0">
        <TimeCaption datetime={project.creationDate} prefix="Created" />
      </p>
    </SearchV2ResultsCard>
  );
}

interface SearchV2ResultUserProps {
  user: User;
}
function SearchV2ResultUser({ user }: SearchV2ResultUserProps) {
  return (
    <SearchV2ResultsCard
      key={`user-${user.id}`}
      cardId={`user-card-${user.id}`}
    >
      <p className="form-text mb-0">{user.id}</p>
      <h4 className="mb-0">
        {user.firstName} {user.lastName}
      </h4>
      {/* <p className="form-text mb-0">{user.email}</p> */}
    </SearchV2ResultsCard>
  );
}

interface SearchV2ResultsUnknownProps {
  index: number;
}
function SearchV2ResultsUnknown({ index }: SearchV2ResultsUnknownProps) {
  return (
    <SearchV2ResultsCard
      key={`unknown-${index}`}
      cardId={`unknown-card-${index}`}
      url="#"
    >
      <h4 className="mb-0">Unknown entity</h4>
      <p className="form-text mb-0">This entity type is not supported yet.</p>
    </SearchV2ResultsCard>
  );
}
