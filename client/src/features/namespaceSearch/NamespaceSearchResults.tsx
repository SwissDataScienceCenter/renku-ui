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
import { useMemo } from "react";
import {
  Database,
  Eye,
  Folder2Open,
  Globe2,
  Lock,
  Pencil,
  People,
  Person,
  Question,
} from "react-bootstrap-icons";
import { generatePath, Link, useSearchParams } from "react-router";
import { Col, ListGroup, Row } from "reactstrap";

import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import Pagination from "~/components/Pagination";
import { TimeCaption } from "~/components/TimeCaption";
import { SearchEntity } from "~/features/searchV2/api/searchV2Api.generated-api";
import { ShowGlobalDataConnector } from "~/features/searchV2/components/SearchV2Results";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { useGroupSearchResultMembers } from "../groupsV2/search/groupSearchResultMembers.hook";
import { FILTER_PAGE, FILTER_PER_PAGE } from "./namespaceSearch.constants";
import { useNamespaceSearch } from "./namespaceSearch.hook";
import { NamespaceSearchEntity } from "./namespaceSearch.types";

export default function NamespaceSearchResults() {
  // Load and visualize the search results
  const [searchParams] = useSearchParams();
  const { data } = useNamespaceSearch();

  const currentPage = useMemo(() => {
    const defaultValue = FILTER_PAGE.defaultValue;
    const pageParam = searchParams.get(FILTER_PAGE.name);
    if (!pageParam) return defaultValue;
    try {
      const page = parseInt(pageParam, 10);
      return page > 0 ? page : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [searchParams]);

  const currentPerPage = useMemo(() => {
    const defaultValue = FILTER_PER_PAGE.defaultValue;
    const perPageParam = searchParams.get(FILTER_PER_PAGE.name);
    if (!perPageParam) return defaultValue;
    try {
      const perPage = parseInt(perPageParam, 10);
      return perPage > 0 ? perPage : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [searchParams]);

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
                  item={item as NamespaceSearchEntity}
                />
              );
            })}
          </ListGroup>
          <Pagination
            currentPage={currentPage}
            perPage={currentPerPage}
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
  item: NamespaceSearchEntity;
}
export function SearchResultListItem({ item }: SearchResultListItemProps) {
  const url =
    item.type === "Project"
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: item.namespace?.path ?? "",
          slug: item.slug,
        })
      : item.type === "DataConnector"
      ? `${location.search}#data-connector-${item.id}`
      : "";

  const isNamespace = item.type === "User" || item.type === "Group";
  // console.log(item);
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
      <Row className="g-2">
        <Col xs="auto">
          <h5>
            <SearchResultListItemIcon item={item} />
          </h5>
        </Col>
        <Col className={cx("d-flex", "flex-column", "gap-2")}>
          <SearchResultTitle item={item} />
          <SearchResultItemMembers item={item} />
          {item.type !== "User" && item.description && (
            <p className="mb-0">{item.description}</p>
          )}
          {!isNamespace && (
            <SearchResultKeywords keywords={item.keywords ?? []} />
          )}
          {item.type === "DataConnector" && (
            <p
              className={cx(
                "align-items-center",
                "d-flex",
                "flex-wrap",
                "gap-3",
                "mb-0"
              )}
            >
              <span>
                <Database className={cx("bi", "me-1")} />
                {item.storageType}
              </span>{" "}
              <span>
                {item.readonly ? (
                  <>
                    <Eye className={cx("bi", "me-1")} />
                    Read only
                  </>
                ) : (
                  <>
                    <Pencil className={cx("bi", "me-1")} />
                    Read/Write
                  </>
                )}
              </span>
            </p>
          )}
          <div
            className={cx(
              "align-items-baseline",
              "align-items-sm-center",
              "d-flex",
              "flex-wrap",
              "flex-column",
              "flex-sm-row",
              "gap-2",
              "justify-content-between"
            )}
          >
            {!isNamespace && (
              <SearchResultVisibility visibility={item.visibility} />
            )}
            {!isNamespace && (
              <TimeCaption
                className="fs-6"
                datetime={item.creationDate}
                prefix="Created"
                enableTooltip
              />
            )}
          </div>
        </Col>
      </Row>
    </Link>
  );
}

function SearchResultListItemIcon({ item }: { item: NamespaceSearchEntity }) {
  return item.type === "Project" ? (
    <Folder2Open />
  ) : item.type === "DataConnector" ? (
    <Database />
  ) : item.type === "User" ? (
    <Person />
  ) : item.type === "Group" ? (
    <People />
  ) : (
    <Question />
  );
}

interface SearchResultItemMembersProps {
  item: NamespaceSearchEntity;
}
function SearchResultItemMembers({ item }: SearchResultItemMembersProps) {
  const members = useGroupSearchResultMembers(item);

  if (item.type === "Project") {
    if (members?.isLoading) {
      return (
        <div className={cx("mb-0", "placeholder-glow")}>
          <div className={cx("placeholder", "w-75")}>
            <UserAvatar className="invisible" namespace="placeholder" />
          </div>
        </div>
      );
    }
    // The following case should not happen, but the API theoretically allows for it, so we handle it gracefully
    if (!members?.data?.length || members?.data?.length < 1) {
      return (
        <div className={cx("text-muted", "fst-italic")}>
          There are no members in this project.
        </div>
      );
    }
    return (
      <div className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
        {members?.data?.map((member) => (
          <div
            key={member.id}
            className={cx("align-items-center", "d-flex", "gap-1")}
          >
            <UserAvatar namespace={member.namespace ?? ""} />
            <span className="text-truncate">
              {member.first_name} {member.last_name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (item.type === "DataConnector" && item.createdBy) {
    return (
      <div className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
        <span className="fst-italic">Created by</span>{" "}
        <span className={cx("align-items-center", "d-flex", "gap-1")}>
          <UserAvatar namespace={item.createdBy.slug} />{" "}
          {item.createdBy.firstName} {item.createdBy.lastName}
        </span>
      </div>
    );
  }

  return null;
}

function SearchResultKeywords({ keywords }: { keywords: string[] }) {
  const sortedKeywords = useMemo(() => {
    return keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [keywords]);

  return (
    <KeywordContainer>
      {sortedKeywords.map((keyword, index) => (
        <KeywordBadge key={index}>{keyword}</KeywordBadge>
      ))}
    </KeywordContainer>
  );
}

function SearchResultTitle({ item }: { item: SearchEntity }) {
  const title =
    item.type === "User"
      ? item.firstName && item.lastName
        ? `${item.firstName} ${item.lastName}`
        : item.firstName || item.lastName
      : item.name;

  return <h5 className="mb-0">{title}</h5>;
}

function SearchResultVisibility({ visibility }: { visibility?: string }) {
  if (visibility?.toLowerCase() === "private") {
    return (
      <span>
        <Lock className={cx("bi", "me-1")} />
        Private
      </span>
    );
  }
  return (
    <span>
      <Globe2 className={cx("bi", "me-1")} />
      Public
    </span>
  );
}
