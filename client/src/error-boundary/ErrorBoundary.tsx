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

import * as Sentry from "@sentry/react";
import cx from "classnames";
import { ReactNode, useCallback } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import { StyleHandler } from "../index";
import rkOopsImg from "../styles/assets/oops.svg";
import rkOopsV2Img from "../styles/assets/oopsV2.svg";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";

interface AppErrorBoundaryProps {
  children?: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  // Handle chunk load errors by reloading the page
  const onError = useCallback((error: Error) => {
    if (error.name === "ChunkLoadError") {
      const url = new URL(window.location.href);
      const hasReloaded = !!+(
        url.searchParams.get("reloadForChunkError") ?? ""
      );
      if (!hasReloaded) {
        url.searchParams.set("reloadForChunkError", "1");
        window.location.replace(url);
      }
    }
  }, []);

  const fallbackErrorPage = <ErrorPage />;

  return (
    <Sentry.ErrorBoundary onError={onError} fallback={fallbackErrorPage}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

const ErrorPage = () => {
  const isV2 = location.pathname.startsWith("/v2");
  const logged = useLegacySelector((state) => state.stateModel.user.logged);
  return (
    <>
      <StyleHandler />
      <div
        className={cx("d-flex", "flex-column", "align-items-center", "mt-5")}
      >
        <div className={cx("p-4")}>
          <img src={isV2 ? rkOopsV2Img : rkOopsImg} />
          <h3
            className={cx(
              isV2 ? "text-primary" : "text-rk-green",
              "fw-bold",
              "mt-3"
            )}
          >
            It looks like we are having some issues.
          </h3>

          <p className="mb-0">
            You can try to{" "}
            <a
              className={cx(
                "btn",
                isV2 ? "btn-outline-primary" : "btn-outline-rk-green",
                "m-2"
              )}
              href={window.location.href}
              onClick={() => window.location.reload()}
            >
              Reload the page
            </a>{" "}
            or{" "}
            <a
              className={cx(
                "btn",
                isV2 ? "btn-primary" : "btn-rk-green",
                "m-2"
              )}
              href="/"
            >
              <ArrowLeft className={cx("me-2", "text-icon")} />
              {logged ? "Return to the dashboard" : "Return to home page"}
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
