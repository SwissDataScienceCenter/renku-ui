/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { Url } from "../../utils/helpers/url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import React from "react";
import { Alert } from "../../utils/ts-wrappers";

interface SessionUnavailableProps {
  filters: {
    namespace: string;
    project: string;
  };
  urlList: string;
}
function SessionUnavailable({ filters, urlList }: SessionUnavailableProps) {
  const urlNew = Url.get(Url.pages.project.session.new, {
    namespace: filters.namespace,
    path: filters.project,
  });

  return (
    <div className="p-2 p-lg-3 text-nowrap container-lg">
      <p className="mt-2">The session you are trying to open is not available.</p>
      <Alert color="primary">
        <p className="mb-0">
          <FontAwesomeIcon size="lg" icon={faQuestionCircle} />
          {" "}You should either{" "}
          <Link className="btn btn-primary btn-sm" to={urlNew}>start a new session</Link>
          {" "}or{" "}
          <Link className="btn btn-primary btn-sm" to={urlList}>check the running sessions</Link>
          {" "}
        </p>
      </Alert>
    </div>
  );
}

export default SessionUnavailable;
