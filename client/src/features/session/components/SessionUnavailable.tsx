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

import React from "react";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Alert } from "reactstrap";
import { Url } from "../../../utils/helpers/url";

export default function SessionUnavailable() {
  const pathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );

  const projectUrlData = {
    namespace: "",
    path: pathWithNamespace,
  };
  const sessionsListUrl = Url.get(Url.pages.project.session, projectUrlData);
  const startSessionUrl = Url.get(
    Url.pages.project.session.new,
    projectUrlData
  );

  return (
    <div className={cx("p-2", "p-lg-3", "text-nowrap", "container-lg")}>
      <p className="mt-2">
        The session you are trying to open is not available.
      </p>
      <Alert color="primary">
        <p className="mb-0">
          <FontAwesomeIcon size="lg" icon={faQuestionCircle} /> You should
          either{" "}
          <Link
            className={cx("btn", "btn-primary", "btn-sm")}
            to={startSessionUrl}
          >
            start a new session
          </Link>{" "}
          or{" "}
          <Link
            className={cx("btn", "btn-primary", "btn-sm")}
            to={sessionsListUrl}
          >
            check the running sessions
          </Link>
        </p>
      </Alert>
    </div>
  );
}
