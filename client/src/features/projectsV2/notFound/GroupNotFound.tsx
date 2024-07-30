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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useState } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import { Link, useParams } from "react-router-dom-v5-compat";
import { Button, Col, Collapse, Row } from "reactstrap";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import NotFoundImage from "../../../not-found/NotFoundImage.tsx";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import styles from "./NotFound.module.scss";
import ContainerWrap from "../../../components/container/ContainerWrap";

interface GroupNotFoundProps {
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function GroupNotFound({ error }: GroupNotFoundProps) {
  const { slug: groupSlug } = useParams<{ slug: string }>();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const onClickDetails = useCallback(() => {
    setDetailsOpen((open) => !open);
  }, []);

  const notFoundText = groupSlug ? (
    <>
      We could not find the group{" "}
      <span className={cx("fw-bold", "user-select-all")}>{groupSlug}</span>.
    </>
  ) : (
    <>We could not find the requested group.</>
  );

  return (
    <ContainerWrap>
    <div className={cx("d-flex", "justify-content-center", "m-auto")}>
      <div className={cx(styles.errorNotFoundContainer, "m-auto")}>
        <Row>
          <Col className={cx("p-4", "mt-5")}>
            <h3
              className={cx(
                "text-primary",
                "fw-bold",
                "mt-3",
                "d-flex",
                "align-items-center",
                "gap-3"
              )}
            >
              <NotFoundImage />
              Group not found
            </h3>
            <div className={cx("text-start", "mt-3")}>
              <p>{notFoundText}</p>
              <p>
                It is possible that the group has been deleted by its owner.
              </p>
            </div>
            <div className={cx("my-3", "d-flex", "gap-3")}>
              {error && (
                <Button color="outline-primary" onClick={onClickDetails}>
                  Show error details
                </Button>
              )}
              <Link
                to={ABSOLUTE_ROUTES.v2.root}
                className={cx("btn", "btn-primary")}
              >
                <ArrowLeft className={cx("bi", "me-1")} />
                Return to the groups list
              </Link>
            </div>
            {error && (
              <Collapse isOpen={detailsOpen}>
                <RtkOrNotebooksError error={error} dismissible={false} />
              </Collapse>
            )}
          </Col>
        </Row>
      </div>
    </div>
    </ContainerWrap>
  );
}
