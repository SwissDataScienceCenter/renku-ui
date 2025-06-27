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
import { generatePath, Link, useSearchParams } from "react-router";
import { ListGroup, ListGroupItem } from "reactstrap";
import Pagination from "~/components/Pagination";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import { ShowGlobalDataConnector } from "~/features/searchV2/components/SearchV2Results";
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
      <ListGroupItem>
        <h5 className="mb-1">{item.name}</h5>
        <p>{item.path}</p>
        <p>{item.slug}</p>
        <KeywordContainer>
          {sortedKeywords.map((keyword, index) => (
            <KeywordBadge key={index}>{keyword}</KeywordBadge>
          ))}
        </KeywordContainer>
      </ListGroupItem>
    </Link>
  );
}
