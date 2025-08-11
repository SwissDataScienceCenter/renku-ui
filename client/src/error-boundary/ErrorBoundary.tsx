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
import { ReactNode, useCallback, useContext } from "react";
import { useLocation } from "react-router";
import { ArrowLeft } from "react-bootstrap-icons";

import rkOopsImg from "../styles/assets/oops.svg";
import rkOopsV2Img from "../styles/assets/oopsV2.svg";
import AppContext from "../utils/context/appContext";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";
import { isRenkuLegacy } from "../utils/helpers/HelperFunctionsV2";
import StyleHandler from "~/features/rootV2/StyleHandler";

interface AppErrorBoundaryProps {
  children?: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  // Handle chunk load errors by reloading the page
  const onError = useCallback((error: Error) => {
    if (
      (error instanceof TypeError &&
        error.message.toLowerCase().includes("module")) ||
      error.name === "ChunkLoadError"
    ) {
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

  return (
    <Sentry.ErrorBoundary onError={onError} fallback={<ErrorPage />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

function ErrorPage() {
  const location = useLocation();
  const { params } = useContext(AppContext);
  const forceV2Style = (params && !params.LEGACY_SUPPORT.enabled) || false;
  const isLegacy = isRenkuLegacy(location.pathname, forceV2Style);
  const logged = useLegacySelector((state) => state.stateModel.user.logged);
  return (
    <>
      <StyleHandler forceV2Style={forceV2Style} />
      <div
        className={cx("d-flex", "flex-column", "align-items-center", "mt-5")}
      >
        <div className={cx("p-4")}>
          <img src={isLegacy ? rkOopsImg : rkOopsV2Img} />
          <h3
            className={cx(
              isLegacy ? "text-rk-green" : "text-primary",
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
                isLegacy ? "btn-outline-rk-green" : "btn-outline-primary",
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
                isLegacy ? "btn-rk-green" : "btn-primary",
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
}
