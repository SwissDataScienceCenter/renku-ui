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
  Question,
} from "react-bootstrap-icons";
import { generatePath, Link, useSearchParams } from "react-router";
import { Col, ListGroup, Row } from "reactstrap";
import Pagination from "~/components/Pagination";
import { TimeCaption } from "~/components/TimeCaption";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import { ShowGlobalDataConnector } from "~/features/searchV2/components/SearchV2Results";
import UserAvatar from "~/features/usersV2/show/UserAvatar";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { useGroupSearch } from "./groupSearch.hook";
import { GroupSearchEntity } from "./groupSearch.types";
import { FILTER_PAGE, FILTER_PER_PAGE } from "./groupsSearch.constants";

export default function GroupSearchResults() {
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
      <Row className="g-2">
        <Col xs="auto">
          <h5>
            <SearchResultListItemIcon item={item} />
          </h5>
        </Col>
        <Col className={cx("d-flex", "flex-column", "gap-2")}>
          <h5 className="mb-0">{item.name}</h5>
          {item.createdBy && (
            <p className={cx("align-items-center", "d-flex", "gap-2", "mb-0")}>
              <span className="fst-italic">Created by</span>{" "}
              <span className={cx("align-items-center", "d-flex", "gap-1")}>
                <UserAvatar namespace={item.createdBy.slug} />{" "}
                {item.createdBy.firstName} {item.createdBy.lastName}
              </span>
            </p>
          )}
          {item.description && <p className="mb-0">{item.description}</p>}
          {sortedKeywords.length > 0 && (
            <KeywordContainer>
              {sortedKeywords.map((keyword, index) => (
                <KeywordBadge key={index}>{keyword}</KeywordBadge>
              ))}
            </KeywordContainer>
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
              "align-items-center",
              "d-flex",
              "flex-wrap",
              "gap-2",
              "justify-content-between"
            )}
          >
            {item.visibility.toLowerCase() === "private" ? (
              <div>
                <Lock className={cx("bi", "me-1")} />
                Private
              </div>
            ) : (
              <div>
                <Globe2 className={cx("bi", "me-1")} />
                Public
              </div>
            )}
            <TimeCaption
              className="fs-6"
              datetime={item.creationDate}
              prefix="Created"
              enableTooltip
            />
          </div>
        </Col>
      </Row>
    </Link>
  );
}

function SearchResultListItemIcon({ item }: { item: GroupSearchEntity }) {
  return item.type === "Project" ? (
    <Folder2Open />
  ) : item.type === "DataConnector" ? (
    <Database />
  ) : (
    <Question />
  );
}
