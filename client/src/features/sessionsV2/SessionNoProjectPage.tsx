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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ArrowLeft } from "react-bootstrap-icons";
import { Link } from "react-router";

import ContainerWrap from "~/components/container/ContainerWrap";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import rkNotFoundImgV2 from "~/styles/assets/not-foundV2.svg";
import type { SessionResponse } from "./api/sessionsV2.api";

interface SessionNoProjectPagePageProps {
  session: SessionResponse;
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function SessionNoProjectPagePage({
  session,
  error,
}: SessionNoProjectPagePageProps) {
  const projectId = session.project_id;

  const notFoundText = projectId ? (
    <>
      The parent project{" "}
      <span className={cx("fw-bold", "user-select-all")}>{projectId}</span> of
      the session{" "}
      <span className={cx("fw-bold", "user-select-all")}>{session.name}</span>{" "}
      has been deleted.
    </>
  ) : (
    <>
      The parent project of the session{" "}
      <span className={cx("fw-bold", "user-select-all")}>{session.name}</span>{" "}
      has been deleted.
    </>
  );

  return (
    <ContainerWrap>
      <div className={cx("d-flex")}>
        <div className={cx("m-auto", "d-flex", "flex-column")}>
          <h3
            className={cx(
              "text-primary",
              "fw-bold",
              "my-0",
              "d-flex",
              "align-items-center",
              "gap-3",
            )}
          >
            <img src={rkNotFoundImgV2} />
            Session is orphaned!
          </h3>
          <div className={cx("text-start", "mt-3")}>
            <p>{notFoundText}</p>
            <p>
              You can go back to the dashboard and use the &quot;Open in new
              tab&quot; option to access your session.
            </p>
            {error && (
              <RtkOrDataServicesError error={error} dismissible={false} />
            )}
            <Link
              to={ABSOLUTE_ROUTES.v2.index}
              className={cx("btn", "btn-primary")}
            >
              <ArrowLeft className={cx("me-2", "text-icon")} />
              Return to the dashboard
            </Link>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}
