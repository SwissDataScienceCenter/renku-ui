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
import { useCallback, useMemo, useRef } from "react";
import { PinAngle, PinAngleFill } from "react-bootstrap-icons";
import { RootStateOrAny, useSelector } from "react-redux";
import { UncontrolledTooltip } from "reactstrap";
import { EntityType } from "../../features/kgSearch";
import {
  useAddPinnedProjectMutation,
  useGetUserPreferencesQuery,
  useRemovePinnedProjectMutation,
} from "../../features/user/userPreferences.api";
import { User } from "../../model/RenkuModels";
import { Loader } from "../Loader";

import styles from "./PinnedBadge.module.scss";

interface PinnedBadgeProps {
  entityType: EntityType;
  slug: string;
}

/**
 * Pinned Badge, requires parent element to have `position: relative`.
 */
export default function PinnedBadge({ entityType, slug }: PinnedBadgeProps) {
  const userLogged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!userLogged || entityType !== EntityType.Project) {
    return null;
  }

  return <PinnedBadgeImpl slug={slug} />;
}

function PinnedBadgeImpl({ slug }: Pick<PinnedBadgeProps, "slug">) {
  const {
    data: userPreferences,
    isLoading,
    isError,
    isFetching,
  } = useGetUserPreferencesQuery();

  const isProjectPinned = useMemo(() => {
    if (isLoading || isError) {
      return undefined;
    }
    if (userPreferences == null) {
      return false;
    }
    return (
      userPreferences.pinned_projects.project_slugs?.find(
        (projectSlug) => projectSlug.toLowerCase() === slug.toLowerCase()
      ) ?? false
    );
  }, [isError, isLoading, slug, userPreferences]);

  const [addPinnedProject, addPinnedProjectResult] =
    useAddPinnedProjectMutation();
  const [removePinnedProject, removePinnedProjectResult] =
    useRemovePinnedProjectMutation();

  const onClick = useCallback(() => {
    if (
      addPinnedProjectResult.isLoading ||
      removePinnedProjectResult.isLoading
    ) {
      return;
    }

    if (isProjectPinned) {
      removePinnedProject({ project_slug: slug });
    } else {
      addPinnedProject({ project_slug: slug });
    }
  }, [
    addPinnedProject,
    addPinnedProjectResult.isLoading,
    isProjectPinned,
    removePinnedProject,
    removePinnedProjectResult.isLoading,
    slug,
  ]);

  const ref = useRef<HTMLButtonElement>(null);

  const tooltipMessage = isLoading
    ? "Loading user preferences"
    : isError
    ? "Error: could not retrieve user preferences"
    : isProjectPinned
    ? "Unpin project from the dashboard"
    : "Pin project to the dashboard";

  if (isLoading || isError) {
    return null;
  }

  return (
    <div
      className={cx(
        "position-absolute",
        "start-0",
        "top-0",
        "ps-1",
        "pt-1",
        styles.pinnedBadge,
        !isProjectPinned && styles.unpinned
      )}
    >
      <button
        className={cx("badge", "btn", "p-1", "fs-6", "shadow", "rounded-pill")}
        disabled={isFetching || isError}
        onClick={onClick}
        ref={ref}
        type="button"
      >
        {isFetching ? (
          <Loader inline size={16} />
        ) : isError || !isProjectPinned ? (
          <PinAngle className="bi" />
        ) : (
          <PinAngleFill className="bi" />
        )}
        <span className="visually-hidden">{tooltipMessage}</span>
      </button>
      <UncontrolledTooltip placement="top" target={ref}>
        {tooltipMessage}
      </UncontrolledTooltip>
    </div>
  );
}
