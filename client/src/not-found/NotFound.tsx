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

import { ArrowLeft } from "react-bootstrap-icons";
import ContainerWrap from "../components/container/ContainerWrap";
import rkNotFoundImg from "../styles/assets/not-found.svg";
import rkNotFoundImgV2 from "../styles/assets/not-foundV2.svg";
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
  const isV2 = location.pathname.startsWith("/v2");
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
    <ContainerWrap>
      <div className={cx("d-flex")}>
        <div className={cx("m-auto", "d-flex", "flex-column")}>
          <h3
            className={cx(
              "fw-bold",
              "mt-0",
              "mb-3",
              "d-flex",
              "align-items-center",
              "gap-3",
              isV2 ? "text-primary" : "text-rk-green"
            )}
          >
            <img src={isV2 ? rkNotFoundImgV2 : rkNotFoundImg} />
            {title}
          </h3>
          <Tag data-cy="not-found-description">{description}</Tag>
          <div>
            <Link
              to="/"
              className={cx("btn", isV2 ? "btn-primary" : "btn-rk-green")}
            >
              <ArrowLeft className={cx("bi", "me-1")} />
              Return to home
            </Link>
          </div>
          {children == null ? null : (
            <div className="mt-3" data-cy="not-found-children">
              {children}
            </div>
          )}
        </div>
      </div>
    </ContainerWrap>
  );
}
