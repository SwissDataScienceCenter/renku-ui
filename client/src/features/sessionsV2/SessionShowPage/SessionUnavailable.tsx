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

import cx from "classnames";
import { generatePath, Link, useParams } from "react-router";

import { useLoginUrl } from "~/authentication/useLoginUrl.hook";
import { InfoAlert, WarnAlert } from "~/components/Alert";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

export default function SessionUnavailable() {
  const { namespace, slug } = useParams<"namespace" | "slug">();
  const loginUrl = useLoginUrl();
  const { data: user } = useGetUserQueryState();

  const loggedIn = user?.isLoggedIn;

  const backUrl =
    namespace && slug
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace,
          slug,
        })
      : undefined;

  const linkColor = loggedIn ? "btn-primary" : "btn-outline-primary";
  const link = backUrl ? (
    <Link className={cx("btn", linkColor, "btn-sm")} to={backUrl}>
      go back to the project page
    </Link>
  ) : (
    <Link
      className={cx("btn", linkColor, "btn-sm")}
      to={ABSOLUTE_ROUTES.v2.index}
    >
      go back to the dashboard
    </Link>
  );

  return (
    <div className={cx("p-2", "p-lg-3", "container-lg")}>
      <p className="mt-2">
        The session you are trying to open is not available.
      </p>
      {loggedIn ? (
        <InfoAlert timeout={0} dismissible={false}>
          You can {link}.
        </InfoAlert>
      ) : (
        <WarnAlert timeout={0} dismissible={false}>
          <p>
            You are not logged in. If you have an account, you should{" "}
            <a
              className={cx("btn", "btn-primary", "btn-sm")}
              href={loginUrl.href}
            >
              Login
            </a>{" "}
            and try again.
          </p>
          <p className="mb-0">Otherwise, you can {link}.</p>
        </WarnAlert>
      )}
    </div>
  );
}
