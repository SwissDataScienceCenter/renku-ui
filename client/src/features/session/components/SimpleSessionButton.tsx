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
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { NotebooksHelper } from "../../../notebooks";
import { Url } from "../../../utils/helpers/url";
import { Session } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";
import { useGetSessionsQuery } from "../sessions.api";

interface SimpleSessionButtonProps {
  className?: string;
  fullPath: string;
  skip?: boolean;
}

export default function SimpleSessionButton({
  className: className_,
  fullPath,
  skip,
}: SimpleSessionButtonProps) {
  const className = cx(
    "btn",
    "btn-sm",
    "btn-rk-green",
    "btn-icon-text",
    "start-session-button",
    className_
  );

  const sessionAutostartUrl = Url.get(Url.pages.project.session.autostart, {
    namespace: "",
    path: fullPath,
  });

  const { data: sessions, isLoading } = useGetSessionsQuery(undefined, {
    skip,
  });

  const runningSession = sessions
    ? getRunningSession({ autostartUrl: sessionAutostartUrl, sessions })
    : null;

  if (isLoading) {
    return (
      <Button className={className} disabled>
        <span>Loading...</span>
      </Button>
    );
  }

  if (!runningSession) {
    return (
      <Link className={className} to={sessionAutostartUrl}>
        <FontAwesomeIcon icon={faPlay} /> Start
      </Link>
    );
  }

  // TODO: handle hibernating state

  const annotations = NotebooksHelper.cleanAnnotations(
    runningSession.annotations
  ) as Session["annotations"];
  const showSessionUrl = Url.get(Url.pages.project.session.show, {
    namespace: annotations.namespace,
    path: annotations.projectName,
    server: runningSession.name,
  });

  return (
    <Link className={className} to={showSessionUrl}>
      <div className="d-flex gap-2">
        <img src="/connect.svg" className="rk-icon rk-icon-md" /> Connect
      </div>
    </Link>
  );
}
