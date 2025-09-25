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
import { ArrowLeft } from "react-bootstrap-icons";

import ContainerWrap from "../../components/container/ContainerWrap";

export default function NoLegacySupport() {
  const title = "Legacy not supported";
  const description = "Renku Legacy is not supported in this deployment.";
  const descriptionType = typeof description;
  const Tag =
    descriptionType === "string" ||
    descriptionType === "number" ||
    descriptionType === "boolean"
      ? "p"
      : "div";

  const homeLink = "/";
  return (
    <ContainerWrap>
      <div className={cx("d-flex")}>
        <div className={cx("m-auto", "d-flex", "flex-column")}>
          <h3
            data-cy="not-found-title"
            className={cx(
              "fw-bold",
              "mt-0",
              "mb-3",
              "d-flex",
              "align-items-center",
              "gap-3",
              "text-primary"
            )}
          >
            {title}
          </h3>
          <Tag data-cy="not-found-description">{description}</Tag>
          <div>
            <Link to={homeLink} className={cx("btn", "btn-primary")}>
              <ArrowLeft className={cx("bi", "me-1")} />
              Return to home
            </Link>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}
