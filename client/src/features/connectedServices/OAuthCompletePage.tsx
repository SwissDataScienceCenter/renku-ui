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
import { Link, useSearchParams } from "react-router";

import ContainerWrap from "../../components/container/ContainerWrap";
import { SEARCH_PARAM_SOURCE } from "./connectedServices.constants";
import { GitHubOAuthCompleteFollowUp } from "./ConnectedServicesPage";

export default function OAuthCompletePage() {
  const [params] = useSearchParams();
  const source = params.get(SEARCH_PARAM_SOURCE);

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
        {source && (
          <p className={cx("mb-0")}>
            <Link to={source}>Back to where you were</Link>
          </p>
        )}
        <GitHubOAuthCompleteFollowUp />
      </div>
    </ContainerWrap>
  );
}
