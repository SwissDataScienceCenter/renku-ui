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
import { PlayFill } from "react-bootstrap-icons";
import { Link, generatePath } from "react-router-dom-v5-compat";
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
    "/v2/projects/:namespace/:slug/sessions/:launcherId/start",
    {
      launcherId,
      namespace,
      slug,
    }
  );

  return (
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
    >
      <PlayFill size="20" />
      Launch
    </Link>
  );
}
