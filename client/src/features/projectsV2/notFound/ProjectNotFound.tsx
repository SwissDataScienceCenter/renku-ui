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
import { ArrowLeft, House } from "react-bootstrap-icons";
import { createSearchParams, Link, useParams } from "react-router";

import LoginAlert from "~/components/loginAlert/LoginAlert";
import ContainerWrap from "../../../components/container/ContainerWrap";
import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import rkNotFoundImgV2 from "../../../styles/assets/not-foundV2.svg";
import { useGetUserQueryState } from "../../usersV2/api/users.api";

interface ProjectNotFoundProps {
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function ProjectNotFound({ error }: ProjectNotFoundProps) {
  const {
    id: projectId,
    namespace,
    slug,
  } = useParams<{
    id: string;
    namespace: string;
    slug: string;
  }>();

  const { data: user } = useGetUserQueryState();
  const userLoggedIn = !!user?.isLoggedIn;

  const notFoundText = (
    <>
      We could not find the{" "}
      {namespace && slug ? (
        <>
          project{" "}
          <span className="fw-bold">
            {namespace} / {slug}
          </span>
          .
        </>
      ) : projectId ? (
        <>
          project with id <span className="fw-bold">{projectId}</span>.
        </>
      ) : (
        <>We could not find the requested project.</>
      )}
    </>
  );

  const errorIs404 = error != null && "status" in error && error.status === 404;
  const showLoginAlert = errorIs404 && !userLoggedIn;

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
            Project not found
          </h3>
          <div className={cx("text-start", "mt-3")}>
            <p>{notFoundText}</p>
            <p>
              It is possible that the project has been deleted by its owner or
              you do not have permission to access it.
            </p>
            {showLoginAlert ? (
              <LoginAlert
                color="info"
                logged={false}
                textPost=" first."
                textPre="You are not logged in. If the project you are trying to reach is not public, please"
              />
            ) : (
              error && (
                <RtkOrDataServicesError error={error} dismissible={false} />
              )
            )}

            <div className={cx("d-flex", "flex-wrap", "gap-2")}>
              <Link
                to={{
                  pathname: ABSOLUTE_ROUTES.v2.search,
                  search: createSearchParams({
                    type: "Project",
                    q: slug ?? projectId ?? "",
                  }).toString(),
                }}
                className={cx(
                  "btn",
                  showLoginAlert ? "btn-outline-primary" : "btn-primary",
                )}
              >
                <ArrowLeft className={cx("bi", "me-1")} />
                Go to the projects list
              </Link>

              <Link
                to={ABSOLUTE_ROUTES.v2.index}
                className={cx("btn", "btn-outline-primary")}
              >
                <House className={cx("bi", "me-1")} />
                Go to the homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}
