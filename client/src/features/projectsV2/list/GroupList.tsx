/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { useState } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import FormSchema from "../../../components/formschema/FormSchema";
import { Loader } from "../../../components/Loader";
import { Pagination } from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { Url } from "../../../utils/helpers/url";

import { useGetGroupsQuery } from "../api/projectV2.enhanced-api";
import type { GroupResponse } from "../api/namespace.api";
import WipBadge from "../shared/WipBadge";

import styles from "./projectV2List.module.scss";

interface GroupListGroupProps {
  group: GroupResponse;
}
function GroupListGroup({ group }: GroupListGroupProps) {
  const groupUrl = Url.get(Url.pages.groupV2s.show, {
    slug: group.slug,
  });
  return (
    <div
      data-cy="list-card"
      className={cx("m-2", "rk-search-result-card", styles.listProjectWidth)}
    >
      <div className={cx("card", "card-entity", "p-3")}>
        <h3>
          <Link to={groupUrl}>{group.name}</Link>
        </h3>
        <div className="mb-2">{group.description}</div>
        <div className={cx("align-items-baseline", "d-flex")}>
          <TimeCaption datetime={group.creation_date} prefix="Created" />
        </div>
      </div>
    </div>
  );
}

function GroupListDisplay() {
  const perPage = 10;
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useGetGroupsQuery({
    page,
    perPage,
  });

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader className="me-2" />
          <div>Retrieving groups...</div>
        </div>
      </div>
    );
  if (error) return <div>Cannot show groups.</div>;

  if (data == null) return <div>No renku v2 groups.</div>;

  return (
    <>
      <div className="d-flex flex-wrap w-100">
        {data.groups?.map((group) => (
          <GroupListGroup key={group.id} group={group} />
        ))}
      </div>
      <Pagination
        currentPage={data.page}
        perPage={perPage}
        totalItems={data.total}
        onPageChange={setPage}
        className={cx(
          "d-flex",
          "justify-content-center",
          "rk-search-pagination"
        )}
      />
    </>
  );
}

export default function GroupList() {
  const newGroupUrl = Url.get(Url.pages.groupV2s.new);
  return (
    <FormSchema
      showHeader={true}
      title="List Groups"
      description={
        <>
          <div>
            All visible groups <WipBadge />{" "}
          </div>
          <div className="mt-3">
            <Link className={cx("btn", "btn-secondary")} to={newGroupUrl}>
              Create New Group
            </Link>
          </div>
        </>
      }
    >
      <GroupListDisplay />
    </FormSchema>
  );
}
