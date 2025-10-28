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

import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation, type Location } from "react-router";
import { Alert, Button } from "reactstrap";
import { Loader } from "../../../components/Loader";
import { NOTIFICATION_TOPICS } from "../../../notifications/Notifications.constants";
import { NotificationsManager } from "../../../notifications/notifications.types";
import AppContext from "../../../utils/context/appContext";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../utils/helpers/url";
import { usePatchSessionMutation } from "../sessions.api";

interface SessionHibernatedProps {
  sessionName: string;
}

export default function SessionHibernated({
  sessionName,
}: SessionHibernatedProps) {
  const location: Location<{ filePath?: string } | undefined> = useLocation();
  const locationFilePath = location.state?.filePath;

  const pathWithNamespace = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );

  const projectUrlData = {
    namespace: "",
    path: pathWithNamespace,
  };
  const sessionsListUrl = Url.get(Url.pages.project.session, projectUrlData);

  const [patchSession, { error }] = usePatchSessionMutation();

  const [isResuming, setIsResuming] = useState(false);

  const onResumeSession = useCallback(() => {
    patchSession({ sessionName: sessionName, state: "running" });
    setIsResuming(true);
  }, [patchSession, sessionName]);

  const { notifications } = useContext(AppContext);

  useEffect(() => {
    if (error != null) {
      addErrorNotification({
        error,
        notifications: notifications as NotificationsManager,
      });
    }
  }, [error, notifications]);

  // Resume session if opening a notebook from the file explorer
  useEffect(() => {
    if (locationFilePath) {
      onResumeSession();
    }
  }, [locationFilePath, onResumeSession]);

  return (
    <div className={cx("p-2", "p-lg-3", "text-nowrap", "container-lg")}>
      <p className="mt-2">This session is currently paused.</p>
      <Alert color="primary">
        <p className="mb-0">
          {isResuming ? (
            <>
              <Loader className="me-1" inline size={16} />
              Resuming session...
            </>
          ) : (
            <>
              <FontAwesomeIcon size="lg" icon={faQuestionCircle} /> You should
              either{" "}
              <Button
                className={cx("btn", "btn-primary", "btn-sm")}
                onClick={onResumeSession}
              >
                resume the session
              </Button>{" "}
              or{" "}
              <Link
                className={cx("btn", "btn-primary", "btn-sm")}
                to={sessionsListUrl}
              >
                go to the sessions list
              </Link>
            </>
          )}
        </p>
      </Alert>
    </div>
  );
}

function addErrorNotification({
  error,
  notifications,
}: {
  error: FetchBaseQueryError | SerializedError;
  notifications: NotificationsManager;
}) {
  const message =
    "message" in error && error.message != null
      ? error.message
      : "error" in error && error.error != null
      ? error.error
      : "Unknown error";
  notifications.addError(
    NOTIFICATION_TOPICS.SESSION_START,
    "Unable to resume the current session",
    undefined,
    undefined,
    undefined,
    `Error message: "${message}"`
  );
}
