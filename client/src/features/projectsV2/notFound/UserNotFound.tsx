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

import ContainerWrap from "../../../components/container/ContainerWrap";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

interface UserNotFoundProps {
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function UserNotFound({ error }: UserNotFoundProps) {
  const { username } = useParams<{ username: string }>();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const onClickDetails = useCallback(() => {
    setDetailsOpen((open) => !open);
  }, []);

  const notFoundText = username ? (
    <>
      We could not find the user{" "}
      <span className={cx("fw-bold", "user-select-all")}>{username}</span>.
    </>
  ) : (
    <>We could not find the requested user.</>
  );

  return (
    <ContainerWrap fullSize className="container-lg">
      <Row className="mt-3">
        <Col>
          <h1>Error 404</h1>
          <h2>User not found</h2>

          <p>{notFoundText}</p>

          <div>
            <Link
              to={ABSOLUTE_ROUTES.v2.root}
              className={cx("btn", "btn-rk-green")}
            >
              <ArrowLeft className={cx("bi", "me-1")} />
              Return to the home page
            </Link>
          </div>

          {error && (
            <>
              <div className={cx("mt-3", "mb-1")}>
                <Button color="link" className="p-0" onClick={onClickDetails}>
                  Show error details
                </Button>
              </div>
              <Collapse isOpen={detailsOpen}>
                <RtkOrNotebooksError error={error} dismissible={false} />
              </Collapse>
            </>
          )}
        </Col>
      </Row>
    </ContainerWrap>
  );
}
