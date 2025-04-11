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
import { ReactNode } from "react";
import { PlayCircle } from "react-bootstrap-icons";
import { Link, generatePath } from "react-router";
import { ButtonGroup, UncontrolledTooltip } from "reactstrap";

import { ButtonWithMenuV2 } from "../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { SessionLauncher } from "./api/sessionLaunchersV2.generated-api.ts";
import { BuildActionsCard } from "./SessionView/EnvironmentCard.tsx";

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
  disabled,
  useOldImage,
  otherActions,
  isDisabledDropdownToggle,
}: StartSessionButtonProps) {
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId: launcher.id,
      namespace,
      slug,
    }
  );
  const onClickFix = (e: React.MouseEvent) => e.stopPropagation();
  const buildActions = useOldImage && (
    <BuildActionsCard launcher={launcher} isMainButton={false} />
  );
  const launchAction = (
    <span id={`launch-btn-${launcher.id}`}>
      <Link
        className={cx(
          "btn",
          "btn-sm",
          disabled ? "btn-outline-primary" : "btn-primary",
          disabled && "disabled",
          buildActions ? "rounded-0" : "rounded-end-0"
        )}
        to={startUrl}
        data-cy="start-session-button"
      >
        <PlayCircle className={cx("bi", "me-1")} />
        Launch
      </Link>
    </span>
  );

  const defaultAction = buildActions ? (
    <ButtonGroup onClick={onClickFix}>
      {buildActions}
      {launchAction}
    </ButtonGroup>
  ) : (
    launchAction
  );

  const customizeLaunch = (
    <Link
      className={cx("dropdown-item", disabled && "disabled")}
      to={{
        pathname: startUrl,
        search: new URLSearchParams({ custom: "1" }).toString(),
      }}
      data-cy="start-custom-session-button"
    >
      <PlayCircle className={cx("bi", "me-1")} />
      Custom launch
    </Link>
  );

  return (
    <>
      <ButtonWithMenuV2
        color={disabled ? "outline-primary" : "primary"}
        default={defaultAction}
        preventPropagation
        size="sm"
        disabled={disabled}
        isDisabledDropdownToggle={isDisabledDropdownToggle}
      >
        {customizeLaunch}
        {otherActions}
      </ButtonWithMenuV2>
      {disabled ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Cannot launch more than 1 session per session launcher.
        </UncontrolledTooltip>
      ) : useOldImage ? (
        <UncontrolledTooltip target={`launch-btn-${launcher.id}`}>
          Launch session using an older image
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}
