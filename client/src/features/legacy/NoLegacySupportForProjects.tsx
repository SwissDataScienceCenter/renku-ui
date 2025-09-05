/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { Link } from "react-router";
import { Send } from "react-bootstrap-icons";

import ContainerWrap from "../../components/container/ContainerWrap";

export default function NoLegacySupportForProjects() {
  const homeLink = "/";
  return (
    <ContainerWrap>
      <div className={cx("d-flex")}>
        <div
          className={cx(
            "m-auto",
            "d-flex",
            "flex-column",
            "align-items-center"
          )}
        >
          <div className={cx("mt-0", "mb-3")}>
            <h3 data-cy="not-found-title" className={cx("fw-bold")}>
              Since October 2025, Renku Legacy is no longer supported.
            </h3>
          </div>
          <div data-cy="not-found-description">What you need to do:</div>
          <div>
            <Link to={homeLink} className={cx("btn", "btn-primary")}>
              <Send className={cx("bi", "me-1")} />
              Go to Renku 2.0
            </Link>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}
