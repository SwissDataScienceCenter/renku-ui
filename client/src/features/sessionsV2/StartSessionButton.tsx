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
import { PlayCircle } from "react-bootstrap-icons";
import { Link, generatePath } from "react-router";
import { UncontrolledTooltip } from "reactstrap";

import { ButtonWithMenuV2 } from "../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";

interface StartSessionButtonProps {
  namespace: string;
  slug: string;
  launcherId: string;
  disabled?: boolean;
  useOldImage?: boolean;
}

export default function StartSessionButton({
  launcherId,
  namespace,
  slug,
  disabled,
  useOldImage,
}: StartSessionButtonProps) {
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId,
      namespace,
      slug,
    }
  );
  const defaultAction = (
    <Link
      className={cx(
        "btn",
        "btn-sm",
        disabled ? "btn-outline-primary" : "btn-primary",
        disabled && "disabled"
      )}
      to={startUrl}
      data-cy="start-session-button"
    >
      <PlayCircle className={cx("bi", "me-1")} />
      Launch
    </Link>
  );

  const customizeLaunch = (
    <Link
      className="dropdown-item"
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
    <div id={`launch-btn-${launcherId}`}>
      <ButtonWithMenuV2
        color={disabled ? "outline-primary" : "primary"}
        default={defaultAction}
        preventPropagation
        size="sm"
        disabled={disabled}
      >
        {customizeLaunch}
      </ButtonWithMenuV2>
      {disabled ? (
        <UncontrolledTooltip target={`launch-btn-${launcherId}`}>
          Cannot launch more than 1 session per session launcher.
        </UncontrolledTooltip>
      ) : useOldImage ? (
        <UncontrolledTooltip target={`launch-btn-${launcherId}`}>
          Launch session using an older image
        </UncontrolledTooltip>
      ) : null}
    </div>
  );
}
