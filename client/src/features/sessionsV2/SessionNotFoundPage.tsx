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
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import {
  generatePath,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

import ContainerWrap from "~/components/container/ContainerWrap";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import LoginAlert from "~/components/loginAlert/LoginAlert";
import PageLoader from "~/components/PageLoader";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import rkNotFoundImgV2 from "~/styles/assets/not-foundV2.svg";
import { useGetProjectsByProjectIdQuery } from "../projectsV2/api/projectV2.api";
import { useGetUserQueryState } from "../usersV2/api/users.api";

interface SessionNotFoundPageProps {
  error?: FetchBaseQueryError | SerializedError | undefined | null;
}

export default function SessionNotFoundPage({
  error,
}: SessionNotFoundPageProps) {
  const { id: sessionId } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { data: user } = useGetUserQueryState();
  const isUserLoggedIn = !!user?.isLoggedIn;

  const { currentData: project, isLoading } = useGetProjectsByProjectIdQuery(
    projectId ? { projectId } : skipToken,
  );

  const notFoundText = sessionId ? (
    <>
      The session{" "}
      <span className={cx("fw-bold", "user-select-all")}>{sessionId}</span> you
      are trying to open is not available.
    </>
  ) : (
    <>The session you are trying to open is not available.</>
  );

  const errorIs404 = error != null && "status" in error && error.status === 404;
  const sessionIsAnon = sessionId?.startsWith("user-anon");
  const showLoginAlert = errorIs404 && !isUserLoggedIn && !sessionIsAnon;

  // If a valid project ID is given, navigate to the in-project page.
  useEffect(() => {
    if (sessionId && project != null) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.projects.show.sessions.show, {
          namespace: project.namespace,
          slug: project.slug,
          session: sessionId,
        }),
        { replace: true },
      );
    }
  }, [navigate, project, sessionId]);

  if (isLoading) {
    return <PageLoader />;
  }

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
            Session not found
          </h3>
          <div className={cx("text-start", "mt-3")}>
            <p>{notFoundText}</p>
            {showLoginAlert ? (
              <LoginAlert
                logged={false}
                textPost="before opening the session."
                textPre="You are not logged in. You may need to"
              />
            ) : (
              error && (
                <RtkOrDataServicesError error={error} dismissible={false} />
              )
            )}
            <Link
              to={ABSOLUTE_ROUTES.v2.index}
              className={cx("btn", "btn-primary")}
            >
              <ArrowLeft className={cx("me-2", "text-icon")} />
              {isUserLoggedIn
                ? "Return to the dashboard"
                : "Return to home page"}
            </Link>
          </div>
        </div>
      </div>
    </ContainerWrap>
  );
}
