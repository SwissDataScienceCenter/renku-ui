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

/**
 *  renku-ui
 *
 *  not-found
 *  Components for the not-found page
 */
import cx from "classnames";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

import { HouseFill } from "react-bootstrap-icons";

import "./NotFound.css";

interface NotFoundProps {
  title?: string;
  description?: string | ReactNode;
  children?: ReactNode;
}

export default function NotFound({
  title: title_,
  description: description_,
  children,
}: NotFoundProps) {
  const title = title_ ?? "Page not found";
  const description =
    description_ ??
    "We cannot seem to find the page you are looking for, sorry!";
  const descriptionType = typeof description;
  const Tag =
    descriptionType === "string" ||
    descriptionType === "number" ||
    descriptionType === "boolean"
      ? "p"
      : "div";
  return (
    <div className="not-found-box">
      <div className={cx("container-xxl", "p-5")}>
        <div className={cx("p-4", "bg-white", "bg-opacity-75")}>
          <h1 data-cy="not-found-title">404</h1>
          <h3 className="mb-4" data-cy="not-found-subtitle">
            {title}
          </h3>
          <Tag data-cy="not-found-description">{description}</Tag>
          <div>
            <Link to="/">
              <Button color="primary" className="btn-rk-green">
                <HouseFill className={cx("bi", "me-1")} />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
        {children == null ? null : (
          <div className="mt-4" data-cy="not-found-children">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
