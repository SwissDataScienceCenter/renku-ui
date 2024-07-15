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
import cx from "classnames";
import { useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { generatePath, Link } from "react-router-dom-v5-compat";

import ContainerWrap from "../../../components/container/ContainerWrap";
import FormSchema from "../../../components/formschema/FormSchema";
import { Loader } from "../../../components/Loader";
import Pagination from "../../../components/Pagination";
import { TimeCaption } from "../../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type { GroupResponse } from "../api/namespace.api";
import { useGetGroupsQuery } from "../api/projectV2.enhanced-api";
import WipBadge from "../shared/WipBadge";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";

interface GroupListGroupProps {
  group: GroupResponse;
}
function GroupListGroup({ group }: GroupListGroupProps) {
  const groupUrl = generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
    slug: group.slug,
  });
  return (
    <Col>
      <Card className="h-100" data-cy="group-card">
        <CardBody className={cx("d-flex", "flex-column")}>
          <h5 className="mb-3">
            <Link to={groupUrl}>{group.name}</Link>
          </h5>

          {group.description && (
            <p
              style={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
              }}
            >
              {group.description}
            </p>
          )}

          <TimeCaption datetime={group.creation_date} prefix="Created" />
        </CardBody>
      </Card>
    </Col>
  );
}

function GroupListDisplay() {
  const perPage = 12;
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useGetGroupsQuery({
    page,
    perPage,
  });

  if (isLoading)
    return (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader />
          <div>Retrieving groups...</div>
        </div>
      </div>
    );

  if (error || data == null) {
    return <RtkOrNotebooksError error={error} dismissible={false} />;
  }

  if (!data.total) return <div>No renku v2 groups.</div>;

  return (
    <>
      <Row className={cx("row-cols-1", "row-cols-sm-2", "g-3")}>
        {data.groups?.map((group) => (
          <GroupListGroup key={group.id} group={group} />
        ))}
      </Row>
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
  const newGroupUrl = ABSOLUTE_ROUTES.v2.groups.new;
  return (
    <ContainerWrap>
      <FormSchema
        showHeader={true}
        title="List Groups"
        description={
          <>
            <p>
              All visible groups
              <WipBadge className="ms-2" />
            </p>
            <div className="mt-3">
              <Link className={cx("btn", "btn-primary")} to={newGroupUrl}>
                Create New Group
              </Link>
            </div>
          </>
        }
      >
        <GroupListDisplay />
      </FormSchema>
    </ContainerWrap>
  );
}
