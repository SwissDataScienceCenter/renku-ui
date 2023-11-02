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

import { RootStateOrAny, useSelector } from "react-redux";
import type { User } from "../../../model/RenkuModels";
import { PinAngle, PinAngleFill } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";
import cx from "classnames";
import { useMemo, useRef } from "react";
import { useGetUserPreferencesQuery } from "../../user/userPreferences.api";
import { Loader } from "../../../components/Loader";

interface PinProjectButtonProps {
  projectSlug: string;
}

export default function PinProjectButton({
  projectSlug,
}: PinProjectButtonProps) {
  const userLogged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  const {
    data: userPreferences,
    isLoading,
    isError,
  } = useGetUserPreferencesQuery(undefined, { skip: !userLogged });

  const isProjectPinned = useMemo(() => {
    if (isLoading || isError) {
      return undefined;
    }
    if (userPreferences == null) {
      return false;
    }
    return (
      userPreferences.pinned_projects.project_slugs?.find(
        (slug) => slug.toLowerCase() === projectSlug.toLowerCase()
      ) ?? false
    );
  }, [isError, isLoading, projectSlug, userPreferences]);

  const ref = useRef<HTMLButtonElement>(null);

  if (!userLogged) {
    return null;
  }

  const tooltipMessage = isLoading
    ? "Loading user preferences"
    : isError
    ? "Error: could not retrieve user preferences"
    : isProjectPinned
    ? "Unpin project from the dashboard"
    : "Pin project to the dashboard";

  return (
    <>
      <Button
        className={cx("btn-outline-rk-green", "rounded-pill")}
        disabled={isLoading || isError}
        innerRef={ref}
        type="button"
      >
        {isLoading ? (
          <Loader size={16} />
        ) : isError || !isProjectPinned ? (
          <PinAngle className="bi" />
        ) : (
          <PinAngleFill className="bi" />
        )}
        <span className="visually-hidden">{tooltipMessage}</span>
      </Button>
      <UncontrolledTooltip placement="top" target={ref}>
        {tooltipMessage}
      </UncontrolledTooltip>
    </>
  );
}
