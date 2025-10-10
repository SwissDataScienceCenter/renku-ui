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

import { skipToken } from "@reduxjs/toolkit/query/react";
import cx from "classnames";
import { ReactNode } from "react";
import { PlayCircle } from "react-bootstrap-icons";
import { Link, generatePath } from "react-router";
import { ButtonWithMenuV2 } from "../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { SessionLauncher } from "./api/sessionLaunchersV2.generated-api";
import { useGetSessionsImagesQuery } from "./api/sessionsV2.api";
import { CUSTOM_LAUNCH_SEARCH_PARAM } from "./session.constants";

interface StartSessionButtonProps {
  namespace: string;
  slug: string;
  launcher: SessionLauncher;
  disabled?: boolean;
  useOldImage?: boolean;
  otherActions?: ReactNode;
  isDisabledDropdownToggle?: boolean;
}

export default function StartSessionButton({
  launcher,
  namespace,
  slug,
}: StartSessionButtonProps) {
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    }
  );
  const environment = launcher?.environment;
  const isExternalImageEnvironment =
    environment?.environment_kind === "CUSTOM" &&
    environment?.environment_image_source === "image";
  const { data, isLoading } = useGetSessionsImagesQuery(
    environment &&
      environment.environment_kind === "CUSTOM" &&
      environment.container_image
      ? { imageUrl: environment.container_image }
      : skipToken
  );

  const force = isExternalImageEnvironment && !isLoading && !data?.accessible;

  const launchAction = (
    <span id={`launch-btn-${launcher.id}`}>
      <Link
        className={cx(
          "btn",
          "btn-sm",
          force ? "btn-outline-primary" : "btn-primary",
          "rounded-end-0"
        )}
        to={startUrl}
        data-cy="start-session-button"
      >
        <PlayCircle className={cx("bi", "me-1")} />
        {force ? "Force launch" : "Launch"}
      </Link>
    </span>
  );

  const customizeLaunch = (
    <Link
      className="dropdown-item"
      to={{
        pathname: startUrl,
        search: new URLSearchParams({
          [CUSTOM_LAUNCH_SEARCH_PARAM]: "1",
        }).toString(),
      }}
      data-cy="start-custom-session-button"
    >
      <PlayCircle className={cx("bi", "me-1")} />
      {force ? "Force custom launch" : "Custom launch"}
    </Link>
  );

  return (
    <>
      <ButtonWithMenuV2
        color={"primary"}
        default={launchAction}
        preventPropagation
        size="sm"
      >
        {customizeLaunch}
      </ButtonWithMenuV2>
    </>
  );
}
