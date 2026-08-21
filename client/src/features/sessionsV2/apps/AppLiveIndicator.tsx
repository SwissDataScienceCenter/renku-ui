/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { CircleFill } from "react-bootstrap-icons";

import styles from "./AppLiveIndicator.module.scss";

export default function AppLiveIndicator() {
  return (
    <span
      data-cy="app-live-indicator"
      className={cx(
        styles.statusText,
        "d-inline-flex",
        "align-items-center",
        "text-nowrap",
        "text-success-emphasis",
      )}
    >
      <CircleFill className={cx("bi", "me-1", styles.pulseDot)} fontSize={14} />
      Live
    </span>
  );
}
