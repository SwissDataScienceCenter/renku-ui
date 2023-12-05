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

import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button } from "reactstrap";
import { Loader } from "../../../components/Loader";
import { NotebooksHelper } from "../../../notebooks";
import { Url } from "../../../utils/helpers/url";
import { useGetSessionsQuery, usePatchSessionMutation } from "../sessions.api";
import { Session } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";
import useWaitForSessionStatus from "../useWaitForSessionStatus.hook";

interface SimpleSessionButtonProps {
  className?: string;
  fullPath: string;
  skip?: boolean;
  fromLanding?: boolean;
}

export default function SimpleSessionButton({
  className: className_,
  fullPath,
  skip,
  fromLanding = false,
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
  const sessionNewUrl = Url.get(Url.pages.project.session.new, {
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
      <Link
        className={className}
        to={{
          pathname: sessionNewUrl,
          search: new URLSearchParams({
            autostart: "1",
            ...(fromLanding ? { fromLanding: "1" } : {}),
          }).toString(),
        }}
        target={fromLanding ? "_blank" : "_self"}
      >
        <FontAwesomeIcon icon={faPlay} /> Start
      </Link>
    );
  }

  return (
    <ResumeOrConnectButton
      className={className}
      runningSession={runningSession}
      fromLanding={fromLanding}
    />
  );
}

interface ResumeOrConnectButtonProps {
  className: string;
  runningSession: Session;
  fromLanding?: boolean;
}

function ResumeOrConnectButton({
  className,
  runningSession,
  fromLanding = false,
}: ResumeOrConnectButtonProps) {
  const history = useHistory();

  const annotations = NotebooksHelper.cleanAnnotations(
    runningSession.annotations
  ) as Session["annotations"];
  const showSessionUrl = Url.get(Url.pages.project.session.show, {
    namespace: annotations.namespace,
    path: annotations.projectName,
    server: runningSession.name,
  });

  // Handle resuming session
  const [isResuming, setIsResuming] = useState(false);
  const [resumeSession, { isSuccess: isSuccessResumeSession }] =
    usePatchSessionMutation();
  const onResumeSession = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // Prevents clicking on the Dashboard project card
      event.preventDefault();

      resumeSession({ sessionName: runningSession.name, state: "running" });
      setIsResuming(true);
    },
    [resumeSession, runningSession.name]
  );
  const { isWaiting: isWaitingForResumedSession } = useWaitForSessionStatus({
    desiredStatus: ["starting", "running"],
    sessionName: runningSession.name,
    skip: !isResuming,
  });
  useEffect(() => {
    if (isSuccessResumeSession && !isWaitingForResumedSession) {
      history.push({ pathname: showSessionUrl });
    }
  }, [
    history,
    isSuccessResumeSession,
    isWaitingForResumedSession,
    showSessionUrl,
  ]);

  if (runningSession.status.state === "hibernated" || isResuming) {
    return (
      <Button
        className={className}
        data-cy="resume-session-button"
        disabled={isResuming}
        onClick={onResumeSession}
      >
        {isResuming ? (
          <>
            <Loader className="me-2" inline size={16} />
            Resuming
          </>
        ) : (
          <>
            <FontAwesomeIcon
              className={cx("rk-icon", "rk-icon-md", "me-2")}
              icon={faPlay}
            />
            Resume
          </>
        )}
      </Button>
    );
  }

  return (
    <Link
      className={className}
      to={{ pathname: showSessionUrl, state: { fromLanding } }}
    >
      <div className="d-flex gap-2">
        <img src="/connect.svg" className="rk-icon rk-icon-md" /> Connect
      </div>
    </Link>
  );
}
