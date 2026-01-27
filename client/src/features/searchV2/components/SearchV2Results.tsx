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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Database,
  Folder2Open,
  Globe2,
  Icon,
  Lock,
  People,
  Person,
  Question,
} from "react-bootstrap-icons";
import { generatePath, Link, useLocation } from "react-router";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import ClampedParagraph from "../../../components/clamped/ClampedParagraph";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { useGetDataConnectorsByDataConnectorIdQuery } from "../../dataConnectorsV2/api/data-connectors.api";
import DataConnectorView from "../../dataConnectorsV2/components/DataConnectorView";
import {
  searchV2Api,
  type DataConnector,
  type Group,
  type Project,
  type SearchEntity,
  type User,
} from "../api/searchV2Api.api";
import useClampSearchPage from "../hooks/useClampSearchPage.hook";
import { toDisplayName } from "../searchV2.utils";

export default function SearchV2Results() {
  const { page, perPage, query } = useAppSelector(({ searchV2 }) => searchV2);

  const [search, { data: searchResults }] =
    searchV2Api.endpoints.getSearchQuery.useLazyQuery();

  useEffect(() => {
    search({
      params: {
        page,
        per_page: perPage,
        q: query,
      },
    });
  }, [page, perPage, query, search]);

  useClampSearchPage({ totalPages: searchResults?.pagingInfo.totalPages });

  return (
    <>
      <Row data-cy="search-results">
        <Col className="d-sm-none" xs={12}>
          <h2>Results</h2>
        </Col>
        <Col xs={12}>
          <SearchV2ResultsContent />
        </Col>
        <Col className="mt-4" xs={12}>
          <Pagination
            currentPage={page}
            perPage={perPage}
            totalItems={searchResults?.pagingInfo.totalResult ?? 0}
            pageQueryParam="page"
            showDescription={true}
          />
        </Col>
      </Row>
      <ShowGlobalDataConnector />
    </>
  );
}

function SearchV2ResultsContent() {
  const { page, perPage, query } = useAppSelector(({ searchV2 }) => searchV2);

  const searchResults = searchV2Api.endpoints.getSearchQuery.useQueryState({
    params: {
      page,
      per_page: perPage,
      q: query,
    },
  });

  if (searchResults.isFetching) {
    return <Loader />;
  }

  if (searchResults.error) {
    return (
      <RtkOrNotebooksError error={searchResults.error} dismissible={false} />
    );
  }

  if (!searchResults.data?.items?.length) {
    return query == null || query === "" ? (
      <p>No results</p>
    ) : (
      <>
        <p>
          No results for <span className="fw-bold">{`"${query}"`}</span>
        </p>
        <p>You can try another search, or change some filters.</p>
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
    } else if (entity.type === "DataConnector") {
      entity;
      return (
        <SearchV2ResultDataConnector
          key={`user-result-${entity.id}`}
          dataConnector={entity}
        />
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
  entityType: SearchEntity["type"];
  entityUrl: string;
  name: string;
  namespace?: string;
  namespaceUrl?: string;
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
        <h3 className="mb-1">
          <Link data-cy="search-card-entity-link" to={entityUrl}>
            {name}
          </Link>
        </h3>
        <p className="mb-0">
          {namespace == null || namespaceUrl == null ? (
            <span className="fst-italic">
              Global {toDisplayName(entityType)}
            </span>
          ) : (
            <Link data-cy="search-card-namespace-link" to={namespaceUrl}>
              @{namespace}
            </Link>
          )}
        </p>
      </div>
      {entityType && (
        <div className={cx("mb-auto", "ms-auto")}>
          <EntityPill
            entityType={entityType}
            size="sm"
            tooltipPlacement="bottom"
          />
        </div>
      )}
    </CardHeader>
  );
}

interface EntityPillProps {
  entityType: SearchEntity["type"];
  size?: "sm" | "md" | "lg" | "xl" | "auto";
  tooltip?: boolean;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}
export function EntityPill({
  entityType,
  size = "auto",
  tooltip = true,
  tooltipPlacement = "top",
}: EntityPillProps) {
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent: Icon =
    entityType === "Project"
      ? Folder2Open
      : entityType === "Group"
      ? People
      : entityType === "User"
      ? Person
      : entityType === "DataConnector"
      ? Database
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
    <>
      <div ref={ref}>
        <Badge
          className={cx(
            "bg-light",
            "border-dark-subtle",
            "border",
            "d-flex",
            "p-2",
            "text-dark-emphasis",
            sizeClass
          )}
          pill
        >
          <IconComponent />
        </Badge>
      </div>
      {tooltip && (
        <UncontrolledTooltip placement={tooltipPlacement} target={ref}>
          {toDisplayName(entityType)}
        </UncontrolledTooltip>
      )}
    </>
  );
}

interface SearchV2ResultProjectProps {
  project: Project;
}
function SearchV2ResultProject({ project }: SearchV2ResultProjectProps) {
  const { creationDate, description, id, name, namespace, slug, visibility } =
    project;

  const namespaceUrl =
    namespace?.type === "User"
      ? generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: namespace?.path ?? "",
        })
      : generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: namespace?.path ?? "",
        });
  const projectUrl =
    namespace?.path != null
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: namespace.path,
          slug,
        })
      : generatePath(ABSOLUTE_ROUTES.v2.projects.showById, {
          id,
        });

  return (
    <SearchV2ResultsContainer>
      <SearchV2CardTitle
        entityType="Project"
        entityUrl={projectUrl}
        name={name}
        namespace={namespace?.path ?? ""}
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
  const { name, path: namespace, description } = group;

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
  const { firstName, lastName, path: namespace } = user;

  const userUrl = generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
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

interface SearchV2ResultDataConnectorProps {
  dataConnector: DataConnector;
}
function SearchV2ResultDataConnector({
  dataConnector,
}: SearchV2ResultDataConnectorProps) {
  const { id, name, namespace, description, visibility, creationDate } =
    dataConnector;

  const location = useLocation();

  const namespaceUrl =
    namespace == null
      ? undefined
      : namespace?.type === "Project"
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.showById, {
          // NOTE: we use the `showById` route to not have to split the path
          id: namespace.path,
        })
      : namespace?.type === "User"
      ? generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: namespace.path,
        })
      : generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: namespace?.path ?? "",
        });
  const hash = `data-connector-${id}`;
  const dcUrl =
    namespace == null
      ? `${location.search}#${hash}`
      : `${namespaceUrl}#${hash}`;

  return (
    <SearchV2ResultsContainer>
      <SearchV2CardTitle
        entityType="DataConnector"
        entityUrl={dcUrl}
        name={name}
        namespace={namespace?.path ?? ""}
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

function SearchV2ResultsUnknown() {
  return (
    <SearchV2ResultsContainer>
      <CardHeader>
        <h3 className="mb-0">Unknown entity</h3>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "h-100")}>
        <p className="mb-0">This entity type is not supported yet.</p>
      </CardBody>
    </SearchV2ResultsContainer>
  );
}

export function ShowGlobalDataConnector() {
  const [hash, setHash] = useLocationHash();

  const dataConnectorId = useMemo(
    () =>
      hash.startsWith("data-connector-")
        ? hash.slice("data-connector-".length)
        : undefined,
    [hash]
  );

  const { currentData: dataConnector } =
    useGetDataConnectorsByDataConnectorIdQuery(
      dataConnectorId != null ? { dataConnectorId } : skipToken
    );

  const toggleView = useCallback(() => {
    setHash((prev) => {
      const isOpen = !!prev;
      return isOpen ? "" : `data-connector-${dataConnectorId}`;
    });
  }, [dataConnectorId, setHash]);

  if (dataConnector == null) {
    return null;
  }

  return (
    <DataConnectorView
      dataConnector={dataConnector}
      showView
      toggleView={toggleView}
    />
  );
}
