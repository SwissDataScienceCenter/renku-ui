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
import { Col, Row } from "reactstrap";

import { ArrowLeft } from "react-bootstrap-icons";

import styles from "../features/projectsV2/notFound/NotFound.module.scss";
import "./NotFound.css";
import NotFoundImage from "./NotFoundImage.tsx";

interface NotFoundProps {
  title?: string;
  description?: string | ReactNode;
  children?: ReactNode;
  isV2?: boolean;
}

export default function NotFound({
  title: title_,
  description: description_,
  children,
  isV2,
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
    <>
      <div className={cx("d-flex", "justify-content-center", "mx-auto")}>
        <Row>
          <Col className={cx("p-4", "mt-5")}>
            <h1
              className={cx(
                isV2 ? "text-primary" : "text-rk-green",
                "fw-bold",
                "mt-3",
                "d-flex",
                "align-items-center",
                "gap-3"
              )}
            >
              <NotFoundImage className={styles.errorNotFoundImg} />
              {title}
            </h1>
            <div className={cx("text-start", "mt-3")}>
              <Tag data-cy="not-found-description">{description}</Tag>
            </div>
            <div className="py-3">
              <Link
                to="/"
                className={cx("btn", isV2 ? "btn-primary" : "btn-rk-green")}
              >
                <ArrowLeft className={cx("bi", "me-1")} />
                Return to home
              </Link>
            </div>
            {children == null ? null : (
              <div className="mt-4" data-cy="not-found-children">
                {children}
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
}
