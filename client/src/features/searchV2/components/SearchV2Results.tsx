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
import {
  Folder2Open,
  Globe2,
  Icon,
  Lock,
  People,
  Person,
  Question,
} from "react-bootstrap-icons";
import {
  Link,
  generatePath,
  useSearchParams,
} from "react-router-dom-v5-compat";
import { Badge, Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import ClampedParagraph from "../../../components/clamped/ClampedParagraph";
import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import {
  Group,
  Project,
  SearchEntity,
  User,
  searchV2Api,
} from "../api/searchV2Api.api";
import useClampSearchPage from "../hooks/useClampSearchPage.hook";

export default function SearchV2Results() {
  const [, setSearchParams] = useSearchParams();

  const { page, perPage, query } = useAppSelector(({ searchV2 }) => searchV2);

  const [search, { data: searchResults }] =
    searchV2Api.endpoints.getQuery.useLazyQuery();

  useEffect(() => {
    search({ page, perPage, q: query });
  }, [page, perPage, query, search]);

  useClampSearchPage({ totalPages: searchResults?.pagingInfo.totalPages });

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
        <h4>Results</h4>
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

  if (!searchResults.data?.items?.length) {
    return (
      <>
        <p>
          No results
          {query && (
            <>
              {" "}
              for <span className="fw-bold">{`"${query}"`}</span>
            </>
          )}
        </p>
        {query && <p>You can try another search, or change some filters.</p>}
      </>
    );
  }

  const resultsOutput = searchResults.data.items.map((entity, index) => {
    if (entity.type === "Project") {
      return (
        <SearchV2ResultProject
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
    <Col xs={12} md={6} xl={4} data-cy="search-card">
      <Card className="h-100">{children}</Card>
    </Col>
  );
}

interface SearchV2CardTitleProps {
  entityType?: SearchEntity["type"];
  entityUrl: string;
  name: string;
  namespace: string;
  namespaceUrl: string;
}
function SearchV2CardTitle({
  entityType,
  entityUrl,
  name,
  namespace,
  namespaceUrl,
}: SearchV2CardTitleProps) {
  return (
    <CardHeader className={cx("d-flex", "gap-2")}>
      <div>
        <h5 className="mb-1">
          <Link to={entityUrl}>{name}</Link>
        </h5>
        <p className="mb-0">
          <Link to={namespaceUrl}>@{namespace}</Link>
        </p>
      </div>
      {entityType && (
        <div className={cx("mb-auto", "ms-auto")}>
          <SearchV2CardEntityPill entityType={entityType} size="sm" />
        </div>
      )}
    </CardHeader>
  );
}

interface SearchV2CardEntityPillProps {
  entityType: SearchEntity["type"];
  size?: "sm" | "md" | "lg" | "xl" | "auto";
}
function SearchV2CardEntityPill({
  entityType,
  size = "auto",
}: SearchV2CardEntityPillProps) {
  const IconComponent: Icon =
    entityType === "Project"
      ? Folder2Open
      : entityType === "Group"
      ? People
      : entityType === "User"
      ? Person
      : Question;
  const sizeClass =
    size == "sm"
      ? "fs-6"
      : size === "md"
      ? "fs-5"
      : size === "lg"
      ? "fs-4"
      : size === "xl"
      ? "fs-2"
      : null;
  return (
    <Badge
      pill
      className={cx(
        "bg-light",
        "border-dark-subtle",
        "border",
        "p-2",
        "text-dark-emphasis",
        sizeClass
      )}
    >
      <IconComponent />
    </Badge>
  );
}

interface SearchV2ResultProjectProps {
  project: Project;
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
        entityUrl={projectUrl}
        name={name}
        namespace={namespace?.namespace ?? ""}
        namespaceUrl={namespaceUrl}
      />
      <CardBody className={cx("d-flex", "flex-column", "h-100")}>
        {description && <ClampedParagraph>{description}</ClampedParagraph>}
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
                <Lock className={cx("bi", "me-1")} />
                Private
              </>
            ) : (
              <>
                <Globe2 className={cx("bi", "me-1")} />
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
        entityUrl={groupUrl}
        name={name}
        namespace={namespace}
        namespaceUrl={groupUrl}
      />

      <CardBody className={cx("d-flex", "flex-column", "h-100")}>
        {description && (
          <ClampedParagraph className="mb-0">{description}</ClampedParagraph>
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
        entityUrl={userUrl}
        name={displayName || "unknown"}
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
