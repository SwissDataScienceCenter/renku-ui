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
import { XLg } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import ContainerWrap from "../../components/container/ContainerWrap";
import { GitHubOAuthCompleteFollowUp } from "./ConnectedServicesPage";

export default function OAuthCompletePage() {
  const onCloseTab = () => {
    window.close();
  };

  return (
    <ContainerWrap>
      <div
        className={cx(
          "d-flex",
          "flex-column",
          "gap-3",
          "mx-auto",
          "py-5",
          "text-center"
        )}
        data-cy="oauth2-complete-page"
        style={{ maxWidth: "36rem" }}
      >
        <h1 className={cx("h3")}>Connection complete</h1>
        <p className={cx("mb-0")}>
          You are now connected. You can close this tab and return to Renku.
        </p>
        <GitHubOAuthCompleteFollowUp />
        <p>
          <Button
            color="primary"
            className={cx("btn-primary", "btn-sm")}
            onClick={onCloseTab}
          >
            <XLg className={cx("bi", "me-1")} />
            Close Tab
          </Button>
        </p>
      </div>
    </ContainerWrap>
  );
}
