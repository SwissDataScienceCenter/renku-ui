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

import ExternalLink from "~/components/ExternalLink";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import { MoreInfo } from "~/components/MoreInfo";
import { useGetGroupsByGroupSlugResourcePoolsQuery } from "~/features/sessionsV2/api/computeResources.generated-api";
import { NEW_DOCS_RESOURCE_POOLS_AND_CLASSES } from "~/utils/constants/NewDocs";

interface GroupV2ResourcePoolDisplayProps {
  group: string;
}

export default function GroupV2ResourcePoolDisplay({
  group,
}: GroupV2ResourcePoolDisplayProps) {
  const { data, error, isLoading } = useGetGroupsByGroupSlugResourcePoolsQuery({
    groupSlug: group,
  });

  const errorMessage = error
    ? "This group has no visible resource pools."
    : !data?.length
      ? "There are no resource pools explicitly linked to this group."
      : "";

  if (isLoading || (!error && data == null)) {
    return null;
  }

  return (
    <div
      data-cy="group-resource-pools"
      className={cx("d-flex", "align-items-center", "gap-2")}
    >
      <Cpu className="bi" />
      <div className={cx("text-body-secondary", "small")}>Resource Pools:</div>
      {data?.length == 0 && <Badge className="me-2">{data?.length ?? 0}</Badge>}
      <div className={cx("d-flex", "flex-row", "gap-1")}>
        {data &&
          data?.length > 0 &&
          data.map((rp) => (
            <span
              key={rp.id}
              className={cx("badge", "bg-secondary-subtle", "text-secondary")}
            >
              {rp.name}
            </span>
          ))}
      </div>

      <span className="ms-1" data-cy="group-resource-pools-info">
        <MoreInfo trigger="legacy">
          <LazyMarkdown>{errorMessage}</LazyMarkdown>
          <ExternalLink href={NEW_DOCS_RESOURCE_POOLS_AND_CLASSES}>
            Read more
          </ExternalLink>
          {!errorMessage && " about custom resource pools"}
        </MoreInfo>
      </span>
    </div>
  );
}
