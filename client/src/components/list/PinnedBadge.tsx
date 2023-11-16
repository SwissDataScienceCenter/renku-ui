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

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { PinAngle, PinAngleFill } from "react-bootstrap-icons";
import { RootStateOrAny, useSelector } from "react-redux";
import { Button, UncontrolledTooltip } from "reactstrap";
import { EntityType } from "../../features/kgSearch";
import {
  useAddPinnedProjectMutation,
  useGetUserPreferencesQuery,
  useRemovePinnedProjectMutation,
} from "../../features/user/userPreferences.api";
import { User } from "../../model/RenkuModels";
import { NOTIFICATION_TOPICS } from "../../notifications/Notifications.constants";
import AppContext from "../../utils/context/appContext";
import { Loader } from "../Loader";
import { EntityType as AnotherEntityType } from "../entities/Entities";
import { extractRkErrorMessage } from "../errors/RtkErrorAlert";

interface PinnedBadgeProps {
  entityType: EntityType | AnotherEntityType;
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
  const maxPinnedProjects = useGetMaxPinnedProjects();

  const addErrorNotification = useErrorNotification();

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
      userPreferences.pinned_projects.project_slugs?.some(
        (projectSlug) => projectSlug.toLowerCase() === slug.toLowerCase()
      ) ?? false
    );
  }, [isError, isLoading, slug, userPreferences]);

  const hasReachedMax = useMemo(
    () =>
      maxPinnedProjects > 0 &&
      !!userPreferences?.pinned_projects.project_slugs?.length &&
      userPreferences.pinned_projects.project_slugs.length >= maxPinnedProjects,
    [maxPinnedProjects, userPreferences?.pinned_projects.project_slugs?.length]
  );

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

  useEffect(() => {
    if (addPinnedProjectResult.error) {
      addErrorNotification(addPinnedProjectResult.error);
    }
    if (removePinnedProjectResult.error) {
      addErrorNotification(removePinnedProjectResult.error);
    }
  }, [
    addErrorNotification,
    addPinnedProjectResult.error,
    removePinnedProjectResult.error,
  ]);

  const ref = useRef<HTMLButtonElement>(null);

  const tooltipMessage = isLoading
    ? "Loading user preferences"
    : isError
    ? "Error: could not retrieve user preferences"
    : isProjectPinned
    ? "Unpin project from the dashboard"
    : hasReachedMax
    ? `Cannot pin project: maximum number of pinned projects reached (${maxPinnedProjects})`
    : "Pin project to the dashboard";

  if (isLoading || isError) {
    return null;
  }

  if (isFetching || isError || (!isProjectPinned && hasReachedMax)) {
    return (
      <DisabledBadge
        isError={isError}
        isFetching={isFetching}
        isProjectPinned={isProjectPinned}
        tooltipMessage={tooltipMessage}
      />
    );
  }

  return (
    <div
      className={cx("position-absolute", "start-0", "top-0", "ps-1", "pt-1")}
    >
      <Button
        className={cx("badge", "btn", "p-1", "fs-6", "shadow", "rounded-pill")}
        color="rk-green"
        data-cy="pin-badge"
        onClick={onClick}
        innerRef={ref}
        type="button"
      >
        {!isProjectPinned ? (
          <PinAngle className="bi" />
        ) : (
          <PinAngleFill className="bi" />
        )}
        <span className="visually-hidden">{tooltipMessage}</span>
      </Button>
      <UncontrolledTooltip placement="top" target={ref}>
        {tooltipMessage}
      </UncontrolledTooltip>
    </div>
  );
}

function useGetMaxPinnedProjects() {
  const { params } = useContext(AppContext);

  const maxPinnedProjects = useMemo(() => {
    const params_ = params as {
      USER_PREFERENCES_MAX_PINNED_PROJECTS?: unknown;
    };
    if (!("USER_PREFERENCES_MAX_PINNED_PROJECTS" in params_)) {
      return 0;
    }
    if (typeof params_["USER_PREFERENCES_MAX_PINNED_PROJECTS"] === "number") {
      return Math.max(0, params_["USER_PREFERENCES_MAX_PINNED_PROJECTS"]);
    }
    if (typeof params_["USER_PREFERENCES_MAX_PINNED_PROJECTS"] === "string") {
      try {
        return Math.max(
          0,
          parseInt(params_["USER_PREFERENCES_MAX_PINNED_PROJECTS"] ?? "0", 10)
        );
      } catch {
        return 0;
      }
    }
    return 0;
  }, [params]);

  return maxPinnedProjects;
}

function useErrorNotification() {
  const { notifications } = useContext(AppContext);

  const addErrorNotification = useCallback(
    (error: FetchBaseQueryError | SerializedError) => {
      if (!notifications) {
        return;
      }

      const errorCode =
        "status" in error
          ? error.status.toString()
          : "code" in error && error.code !== undefined
          ? error.code.toString()
          : "Unknown";
      const message = extractRkErrorMessage(error, "error");
      notifications.addError(
        NOTIFICATION_TOPICS.USER_PREFERENCES,
        "Unable to update user preferences",
        undefined,
        undefined,
        undefined,
        `Error ${errorCode}: "${message}"`
      );
    },
    [notifications]
  );

  return addErrorNotification;
}

interface DisabledBadgeProps {
  isError: boolean;
  isFetching: boolean;
  isProjectPinned: boolean | undefined;
  tooltipMessage: string;
}

function DisabledBadge({
  isError,
  isFetching,
  isProjectPinned,
  tooltipMessage,
}: DisabledBadgeProps) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <div
      className={cx("position-absolute", "start-0", "top-0", "ps-1", "pt-1")}
    >
      <span className="d-inline-block" ref={ref} tabIndex={0}>
        <Button
          className={cx(
            "badge",
            "btn",
            "p-1",
            "fs-6",
            "shadow",
            "rounded-pill"
          )}
          color="rk-green"
          disabled
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
        </Button>
      </span>
      <UncontrolledTooltip placement="top" target={ref}>
        {tooltipMessage}
      </UncontrolledTooltip>
    </div>
  );
}
