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
import { Play, PlayFill } from "react-bootstrap-icons";
import { Link, generatePath, useNavigate } from "react-router-dom-v5-compat";

import { useCallback } from "react";
import { DropdownItem } from "reactstrap";
import { ButtonWithMenu } from "../../components/buttons/Button";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";

interface StartSessionButtonProps {
  namespace: string;
  slug: string;
  launcherId: string;
}

export default function StartSessionButton({
  launcherId,
  namespace,
  slug,
}: StartSessionButtonProps) {
  const navigate = useNavigate();
  const startUrl = generatePath(
    ABSOLUTE_ROUTES.v2.projects.show.sessions.start,
    {
      launcherId,
      namespace,
      slug,
    }
  );

  const onClickCustomLaunch = useCallback(() => {
    const customStartUrl = generatePath(
      ABSOLUTE_ROUTES.v2.projects.show.sessions.startCustom,
      {
        launcherId,
        namespace,
        slug,
      }
    );
    navigate(customStartUrl);
  }, [launcherId, namespace, slug, navigate]);

  const defaultAction = (
    <Link
      className={cx(
        "btn",
        "btn-rk-green",
        "d-flex",
        "align-items-center",
        "py-1",
        "px-2"
      )}
      to={startUrl}
      data-cy="start-session-button"
    >
      <PlayFill className={cx("bi", "me-1")} />
      Launch
    </Link>
  );

  const customizeLaunch = (
    <DropdownItem data-cy="custom-launch-button" onClick={onClickCustomLaunch}>
      <Play size={24} className={cx("bi", "me-1")} />
      Custom launch
    </DropdownItem>
  );

  return (
    <ButtonWithMenu
      className="py-1"
      color="rk-green"
      default={defaultAction}
      isPrincipal
    >
      {customizeLaunch}
    </ButtonWithMenu>
  );
}
