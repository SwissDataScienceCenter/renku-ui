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

import React, { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import cx from "classnames";
import styles from "./ErrorBoundary.module.scss";

interface AppErrorBoundaryProps {
  children?: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorPage}>{children}</Sentry.ErrorBoundary>
  );
}

function ErrorPage() {
  return (
    <div className={styles.error}>
      <div className="container-xxl pt-5 renku-container d-flex flex-column h-100">
        <div className={cx(styles.errorTitle, "align-self-start")}>
          <h1 className="fw-bold h1">Application Error</h1>
          <h3>Ooops! It looks like we are having some issues!</h3>
        </div>
        <div
          className={cx(
            styles.errorMain,
            "p-5 rounded my-auto d-flex flex-row align-items-baseline"
          )}
        >
          You can try to{" "}
          <a
            className="btn btn-rk-green mx-1"
            href={window.location.href}
            onClick={() => window.location.reload()}
          >
            reload the page
          </a>{" "}
          or go to the{" "}
          <a className="btn btn-rk-green mx-1" href="/">
            Renku home page
          </a>
          .
        </div>
      </div>
    </div>
  );
}
