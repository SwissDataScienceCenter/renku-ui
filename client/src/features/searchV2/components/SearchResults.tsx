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
import { generatePath, Link } from "react-router";
import { Badge, Col, ListGroup, Row } from "reactstrap";

import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import Pagination from "~/components/Pagination";
import { TimeCaption } from "~/components/TimeCaption";
import { SearchEntity } from "~/features/searchV2/api/searchV2Api.generated-api";
import ShowGlobalDataConnector from "~/features/searchV2/components/ShowGlobalDataConnector";
import MemberListRow from "~/features/searchV2/components/MemberListRow";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import { useGetSearchQueryQuery } from "../api/searchV2Api.api";
import { GroupSearchEntity } from "../contextSearch.types";
import useClampSearchPage from "../hooks/useClampSearchPage.hook";
import { useSearchResultMembers } from "../hooks/useSearchResultMembers.hook";
import { selectSearchApiQuery } from "../searchV2.slice";

export default function SearchResults() {
  const { page, perPage } = useAppSelector(({ searchV2 }) => searchV2);
  const apiQuery = useAppSelector(selectSearchApiQuery);
  const { data } = useGetSearchQueryQuery({ params: apiQuery });

  useClampSearchPage({ totalPages: data?.pagingInfo?.totalPages });

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
            currentPage={page}
            perPage={perPage}
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
  item: SearchEntity;
}
function SearchResultListItem({ item }: SearchResultListItemProps) {
  const isNamespaceType = item.type == "User" || item.type == "Group";

  const url =
    item.type === "Project"
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: item.namespace?.path ?? "",
          slug: item.slug,
        })
      : item.type === "DataConnector"
      ? `${location.search}#data-connector-${item.id}`
      : item.type === "User"
      ? generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: item.slug ?? "",
        })
      : item.type === "Group"
      ? generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: item.slug,
        })
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
      data-cy="search-list-item"
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
          {!isNamespaceType && item.description && (
            <p className="mb-0">{item.description}</p>
          )}
          {!isNamespaceType && <SearchResultKeywords item={item} />}
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
            {!isNamespaceType && <SearchResultVisibility item={item} />}
            {isNamespaceType && <SearchResultCounts item={item} />}
            {!isNamespaceType && (
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

function SearchResultListItemIcon({ item }: { item: SearchEntity }) {
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
  item: SearchEntity;
}
function SearchResultItemMembers({ item }: SearchResultItemMembersProps) {
  const members = useSearchResultMembers(item);

  if (item.type === "Project" || item.type === "Group") {
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
    return <MemberListRow members={members.data} />;
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

  if (item.type === "User") {
    return (
      <div className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
        <span className={cx("align-items-center", "d-flex", "gap-1")}>
          <UserAvatar namespace={item.slug} /> @{item.slug}
        </span>
      </div>
    );
  }

  return null;
}

function SearchResultKeywords({ item }: { item: GroupSearchEntity }) {
  const sortedKeywords = useMemo(() => {
    if (!item.keywords) return [];
    return item.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [item.keywords]);

  return (
    sortedKeywords.length > 0 && (
      <KeywordContainer>
        {sortedKeywords.map((keyword, index) => (
          <KeywordBadge key={index}>{keyword}</KeywordBadge>
        ))}
      </KeywordContainer>
    )
  );
}

function SearchResultVisibility({ item }: { item: GroupSearchEntity }) {
  return item.visibility.toLowerCase() === "private" ? (
    <div>
      <Lock className={cx("bi", "me-1")} />
      Private
    </div>
  ) : (
    <div>
      <Globe2 className={cx("bi", "me-1")} />
      Public
    </div>
  );
}

function SearchResultTitle({ item }: { item: SearchEntity }) {
  if (
    item.type === "Project" ||
    item.type === "DataConnector" ||
    item.type === "Group"
  )
    return <h5 className="mb-0">{item.name}</h5>;
  if (item.type === "User") {
    const name = `${item.firstName} ${item.lastName}`;
    return <h5 className="mb-0">{name}</h5>;
  }
}

function SearchResultCounts({ item }: { item: SearchEntity }) {
  if (item.type !== "Group" && item.type !== "User") return null;

  return (
    <div className={cx("d-flex", "gap-4")}>
      <div>
        <Folder2Open className={cx("bi", "me-1")} />
        Projects <Badge className="ms-1">{item.project_count}</Badge>
      </div>
      <div>
        <Database className={cx("bi", "me-1")} />
        Data <Badge className="ms-1">{item.data_connector_count}</Badge>
      </div>
    </div>
  );
}
