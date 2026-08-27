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

import {
  ResourcePoolWithIdFiltered,
  useGetGroupsByGroupSlugResourcePoolsQuery,
} from "~/features/sessionsV2/api/computeResources.generated-api";
import { Loader } from "../../../components/Loader";
import { GroupInformationBox } from "./GroupV2Information";

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
    <GroupInformationBox
      dataCy="group-resource-pools"
      icon={<Cpu className="bi" />}
      title={
        <>
          <span>Resource Pools</span>
          <Badge>{data?.length ?? 0}</Badge>
        </>
      }
    >
      {error ? (
        <p
          className={cx("mb-0", "text-body-secondary")}
          data-cy="group-resource-pools-not-visible"
        >
          This group has no visible resource pools.
        </p>
      ) : !data.length ? (
        <p
          className={cx("mb-0", "text-body-secondary")}
          data-cy="group-resource-pools-empty"
        >
          There are no resource pools explicitly linked to this group.
        </p>
      ) : (
        data.map((rp) => <GroupV2ResourcePool key={rp.id} rp={rp} />)
      )}
    </GroupInformationBox>
  ) : null;
}

interface GroupV2ResourcePoolProps {
  rp: ResourcePoolWithIdFiltered;
}
function GroupV2ResourcePool({ rp }: GroupV2ResourcePoolProps) {
  return rp.name && <p className={cx("m-0", "text-truncate")}>{rp.name}</p>;
}
