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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Plugin, XLg } from "react-bootstrap-icons";
import { Link, useSearchParams } from "react-router";
import { Button } from "reactstrap";

import { ErrorAlert, SuccessAlert } from "../../components/Alert";
import ContainerWrap from "../../components/container/ContainerWrap";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { GitHubOAuthCompleteFollowUp } from "./ConnectedServicesPage";
import {
  shouldAutoCloseAfterOAuth,
  useGithubOAuthCompleteFollowUpData,
} from "./useGithubOAuthCompleteFollowUpData.hook";

const SECONDS_TO_AUTO_CLOSE_TAB = 5;

function SuccessAutoCloseMessage({ onAutoClose }: { onAutoClose: () => void }) {
  const [secondsRemaining, setSecondsRemaining] = useState(
    SECONDS_TO_AUTO_CLOSE_TAB
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          onAutoClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [onAutoClose]);

  return (
    <p className={cx("mb-0", "mt-3", "fst-italic")}>
      This tab will close automatically in {secondsRemaining} seconds.
    </p>
  );
}

export default function OAuthCompletePage() {
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("error");
  const oauthErrorMessage =
    searchParams.get("error_description") ??
    searchParams.get("message") ??
    oauthError;
  const hasError = oauthErrorMessage != null;
  const githubFollowUpData = useGithubOAuthCompleteFollowUpData();
  const allowSuccessAutoClose = shouldAutoCloseAfterOAuth(
    hasError,
    githubFollowUpData
  );

  const onCloseTab = useCallback(() => {
    window.close();
  }, []);

  return (
    <ContainerWrap>
      <div
        className={cx("d-flex", "flex-column", "gap-3", "mx-auto", "pt-5")}
        data-cy="oauth2-complete-page"
        style={{ maxWidth: "48rem" }}
      >
        <h1 className={cx("m-0", "h2")}>
          <Plugin className={cx("bi", "me-1")} />
          Authentication Status
        </h1>
        {hasError ? (
          <>
            <ErrorAlert dismissible={false} className={cx("mb-0")}>
              <h3>We could not complete the connection</h3>
              <p>
                Something went wrong while connecting your external service.
              </p>
              <code>{oauthErrorMessage ?? "Unexpected OAuth error."}</code>
            </ErrorAlert>
            <div className={cx("mt-0")}>
              <Link
                className={cx("btn", "btn-primary", "btn-sm")}
                to={{
                  pathname: ABSOLUTE_ROUTES.v2.integrations.root,
                }}
              >
                Go to integrations to retry
              </Link>
              <Button
                color="white"
                className={cx("btn-outline-primary", "btn-sm", "ms-2")}
                onClick={onCloseTab}
              >
                <XLg className={cx("bi", "me-1")} />
                Close Tab
              </Button>
            </div>
          </>
        ) : (
          <>
            <SuccessAlert
              dismissible={false}
              timeout={0}
              className={cx("mb-0")}
            >
              <h1 className={cx("h3")}>Connection complete</h1>
              <p className={cx("mb-0")}>
                You are now connected. You can close this tab and return to
                Renku.
              </p>
            </SuccessAlert>
            <div className={cx("d-flex", "gap-2", "align-items-end")}>
              {allowSuccessAutoClose && (
                <SuccessAutoCloseMessage onAutoClose={onCloseTab} />
              )}
              <div>
                <Button
                  color="primary"
                  className={cx("btn-primary", "btn-sm")}
                  onClick={onCloseTab}
                >
                  <XLg className={cx("bi", "me-1")} />
                  Close Tab
                </Button>
              </div>
            </div>
            <GitHubOAuthCompleteFollowUp
              skipData={githubFollowUpData.skipData}
              connection={githubFollowUpData.connection}
              provider={githubFollowUpData.provider}
            />
          </>
        )}
      </div>
    </ContainerWrap>
  );
}
