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

import * as Sentry from "@sentry/react-router";
import cx from "classnames";
import { ReactNode, useCallback } from "react";
import { ArrowLeft } from "react-bootstrap-icons";

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import rkOopsV2Img from "../styles/assets/oopsV2.svg";

interface AppErrorBoundaryProps {
  children?: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  // Handle chunk load errors by reloading the page
  const beforeCapture = useCallback((scope: Sentry.Scope, error: unknown) => {
    if (
      error instanceof Error &&
      ((error instanceof TypeError &&
        (error.message.toLowerCase().includes("module") ||
          error.message.toLowerCase().includes("text/html"))) ||
        error?.name === "ChunkLoadError")
    ) {
      const url = new URL(window.location.href);
      const hasReloaded = !!+(
        url.searchParams.get("reloadForChunkError") ?? ""
      );
      if (!hasReloaded) {
        scope.setTag("reloadForChunkError", true);
        scope.setLevel("info");
        url.searchParams.set("reloadForChunkError", "1");
        setTimeout(() => window.location.replace(url), 0);
      }
    }
  }, []);

  return (
    <Sentry.ErrorBoundary
      beforeCapture={beforeCapture}
      fallback={<ErrorPage />}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

function ErrorPage() {
  const { data: user } = useGetUserQueryState();
  return (
    <>
      <div
        className={cx("d-flex", "flex-column", "align-items-center", "mt-5")}
      >
        <div className={cx("p-4")}>
          <img src={rkOopsV2Img} />
          <h3 className={cx("text-primary", "fw-bold", "mt-3")}>
            It looks like we are having some issues.
          </h3>

          <p className="mb-0">
            You can try to{" "}
            <a
              className={cx("btn", "btn-outline-primary", "m-2")}
              href={window.location.href}
              onClick={() => window.location.reload()}
            >
              Reload the page
            </a>{" "}
            or{" "}
            <a className={cx("btn", "btn-primary", "m-2")} href="/">
              <ArrowLeft className={cx("me-2", "text-icon")} />
              {user?.isLoggedIn
                ? "Return to the dashboard"
                : "Return to home page"}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
