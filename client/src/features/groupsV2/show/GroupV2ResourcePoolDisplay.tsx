/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { Cpu } from "react-bootstrap-icons";
import { Badge } from "reactstrap";

import { useGetGroupsByGroupSlugResourcePoolsQuery } from "~/features/sessionsV2/api/computeResources.generated-api";
import { Loader } from "../../../components/Loader";

interface GroupV2ResourcePoolDisplayProps {
  group: string;
}

export default function GroupV2ResourcePoolDisplay({
  group,
}: GroupV2ResourcePoolDisplayProps) {
  const { data, error, isLoading } = useGetGroupsByGroupSlugResourcePoolsQuery({
    groupSlug: group,
  });

  return isLoading ? (
    <div className={cx("d-flex", "justify-content-center", "w-100")}>
      <div className={cx("d-flex", "flex-column")}>
        <Loader />
        <div>Retrieving resource pools...</div>
      </div>
    </div>
  ) : error || data ? (
    <div data-cy="group-resource-pools">
      <Cpu className="bi" />
      <span className={cx("text-body-secondary", "small")}>Resource Pools</span>
      <Badge>{data?.length ?? 0}</Badge>
      {error ? (
        <span
          className={cx("small")}
          data-cy="group-resource-pools-not-visible"
        >
          This group has no visible resource pools.
        </span>
      ) : !data.length ? (
        <span className={cx("small")} data-cy="group-resource-pools-empty">
          There are no resource pools explicitly linked to this group.
        </span>
      ) : (
        <span className={cx("small")}>
          {data.map((rp) => rp.name).join(",")}
        </span>
      )}
    </div>
  ) : null;
}
