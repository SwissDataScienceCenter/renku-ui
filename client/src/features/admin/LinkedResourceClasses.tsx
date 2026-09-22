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
 * limitations under the License.
 */

import cx from "classnames";

import { Loader } from "~/components/Loader";
import {
  useGetResourceFlavoursByResourceFlavourIdResourceClassesQuery,
  type LinkedResourceClass,
} from "../sessionsV2/api/computeResources.api";

export function useLinkedResourceClasses(
  resourceFlavourId: string,
  skip?: boolean,
) {
  return useGetResourceFlavoursByResourceFlavourIdResourceClassesQuery(
    { resourceFlavourId },
    { skip },
  );
}

interface LinkedResourceClassesProps {
  classes: LinkedResourceClass[];
}

export default function LinkedResourceClasses({
  classes,
}: LinkedResourceClassesProps) {
  return (
    <ul className="mb-0">
      {classes.map((resourceClass) => (
        <li key={resourceClass.id}>
          <strong>{resourceClass.name}</strong>
          {resourceClass.resource_pool_name && (
            <> {`(in ${resourceClass.resource_pool_name})`}</>
          )}
        </li>
      ))}
    </ul>
  );
}

interface LinkedResourceClassesSummaryProps {
  emptyMessage: string;
  intro: string;
  resourceFlavourId: string;
  skip?: boolean;
}

export function LinkedResourceClassesSummary({
  emptyMessage,
  intro,
  resourceFlavourId,
  skip,
}: LinkedResourceClassesSummaryProps) {
  const { data: classes, isLoading } = useLinkedResourceClasses(
    resourceFlavourId,
    skip,
  );

  if (isLoading) {
    return <Loader className="me-1" inline size={16} />;
  }

  if (!classes || classes.length === 0) {
    return <p className={cx("mb-0", "text-muted")}>{emptyMessage}</p>;
  }

  return (
    <>
      <p className="mb-1">{intro}</p>
      <LinkedResourceClasses classes={classes} />
    </>
  );
}
