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
import { People } from "react-bootstrap-icons";
import { Badge, Card, CardBody, CardHeader } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError.tsx";
import { Loader } from "~/components/Loader.tsx";
import { useGetGroupsByGroupSlugMembersQuery } from "~/features/projectsV2/api/projectV2.enhanced-api.ts";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import GroupV2MemberListDisplay from "../members/GroupV2MemberListDisplay";

export default function GroupMembers() {
  const ctx = useNamespaceContext();
  const { namespace, kind } = ctx;
  const {
    data: members,
    error,
    isLoading,
  } = useGetGroupsByGroupSlugMembersQuery(
    { groupSlug: namespace ?? "" },
    {
      skip: !namespace,
    },
  );

  let content = null;
  if (error || members == null) {
    content = <RtkOrDataServicesError error={error} dismissible={false} />;
  }

  if (isLoading) {
    content = (
      <div className={cx("d-flex", "justify-content-center", "w-100")}>
        <div className={cx("d-flex", "flex-column")}>
          <Loader />
          <div>Retrieving group members...</div>
        </div>
      </div>
    );
  }

  content = kind === "group" && namespace && members && (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      {namespace && <GroupV2MemberListDisplay members={members} />}
    </div>
  );
  return (
    <Card data-cy="group-info-card">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between",
          )}
        >
          <h2 className="m-0">
            <People className={cx("me-1", "bi")} />
            Members
            <Badge>{(members && members.length) ?? 0}</Badge>
          </h2>
        </div>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  );
}
