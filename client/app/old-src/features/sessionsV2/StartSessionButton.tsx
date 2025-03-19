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
import { Link } from "react-router";
import { generatePath } from "react-router";

import { ButtonWithMenuV2 } from "../../components/buttons/Button";
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
      className={cx("btn", "btn-sm", "btn-primary")}
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
    <ButtonWithMenuV2
      color="primary"
      default={defaultAction}
      preventPropagation
      size="sm"
    >
      {customizeLaunch}
    </ButtonWithMenuV2>
  );
}
