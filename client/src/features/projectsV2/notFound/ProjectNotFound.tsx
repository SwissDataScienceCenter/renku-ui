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

interface ProjectNotFoundProps {
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function ProjectNotFound({ error }: ProjectNotFoundProps) {
  const {
    id: projectId,
    namespace,
    slug,
  } = useParams<{
    id: string | undefined;
    namespace: string | undefined;
    slug: string | undefined;
  }>();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const onClickDetails = useCallback(() => {
    setDetailsOpen((open) => !open);
  }, []);

  const notFoundText =
    namespace && slug ? (
      <>
        We could not find the project{" "}
        <span className={cx("fw-bold", "user-select-all")}>
          {namespace}
          <span className="mx-1">{"/"}</span>
          {slug}
        </span>
        .
      </>
    ) : projectId ? (
      <>
        We could not find the project with id <code>{projectId}</code>.
      </>
    ) : (
      <>We could not find the requested project.</>
    );

  return (
    <ContainerWrap fullSize className="container-lg">
      <Row className="mt-3">
        <Col>
          <h1>Error 404</h1>
          <h2>Project not found</h2>

          <p>{notFoundText}</p>
          <p>
            It is possible that the project has been deleted by its owner or you
            do not have permission to access it.
          </p>

          <div>
            <Link
              to={ABSOLUTE_ROUTES.v2.projects.root}
              className={cx("btn", "btn-rk-green")}
            >
              <ArrowLeft className={cx("bi", "me-1")} />
              Return to the projects list
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
