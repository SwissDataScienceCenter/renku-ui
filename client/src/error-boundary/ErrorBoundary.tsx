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

import styles from "./ErrorBoundary.module.scss";
import v2Styles from "../styles/renku_bootstrap.scss?inline";

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

  return (
    <Sentry.ErrorBoundary onError={onError} fallback={ErrorPage}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

function ErrorPage() {
  return (
    <>
      <style type="text/css">{v2Styles}</style>
      <div className={styles.error}>
        <div className={cx("container-xxl", "p-5")}>
          <div className={cx("p-4", "bg-white", "bg-opacity-75")}>
            <h1>Application Error</h1>
            <h3 className="mb-4">
              Ooops! It looks like we are having some issues!
            </h3>

            <p className="mb-0">
              You can try to{" "}
              <a
                className={cx("btn", "btn-primary", "mx-1")}
                href={window.location.href}
                onClick={() => window.location.reload()}
              >
                reload the page
              </a>{" "}
              or go to the{" "}
              <a className={cx("btn", "btn-primary", "mx-1")} href="/">
                Renku home page
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
