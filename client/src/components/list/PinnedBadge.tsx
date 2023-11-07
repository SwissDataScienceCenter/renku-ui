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
 * limitations under the License.
 */

import cx from "classnames";
import { useMemo } from "react";
import { PinAngleFill } from "react-bootstrap-icons";
import { Badge } from "reactstrap";
import { EntityType } from "../../features/kgSearch";
import { useGetUserPreferencesQuery } from "../../features/user/userPreferences.api";

interface PinnedBadgeProps {
  entityType: EntityType;
  slug: string;
}

/**
 * Pinned Badge, requires parent element to have `position: relative`.
 */
export default function PinnedBadge({ entityType, slug }: PinnedBadgeProps) {
  const {
    data: userPreferences,
    isLoading: isLoading,
    isError: isError,
  } = useGetUserPreferencesQuery(undefined, {
    skip: entityType !== EntityType.Project,
  });

  const isPinned = useMemo(() => {
    if (isLoading || isError) {
      return undefined;
    }
    return userPreferences?.pinned_projects.project_slugs?.find(
      (projectSlug) => slug.toLowerCase() === projectSlug.toLowerCase()
    );
  }, [
    isError,
    isLoading,
    slug,
    userPreferences?.pinned_projects.project_slugs,
  ]);

  if (entityType !== EntityType.Project) {
    return null;
  }

  if (isLoading || isError) {
    return null;
  }

  return (
    <div
      className={cx("position-absolute", "start-0", "top-0", "ps-1", "pt-1")}
    >
      <Badge
        className={cx("p-1", "fs-6", "text-rk-green", "shadow")}
        color="white"
        pill
      >
        {isPinned && <PinAngleFill className="bi" />}
      </Badge>
    </div>
  );
}
