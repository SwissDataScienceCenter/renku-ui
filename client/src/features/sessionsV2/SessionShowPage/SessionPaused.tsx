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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useContext, useEffect, useState } from "react";
import { QuestionCircle } from "react-bootstrap-icons";
import { generatePath, Link, useParams } from "react-router-dom-v5-compat";
import { Alert, Button } from "reactstrap";

import { Loader } from "../../../components/Loader";
import { NOTIFICATION_TOPICS } from "../../../notifications/Notifications.constants";
import type { NotificationsManager } from "../../../notifications/notifications.types";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import AppContext from "../../../utils/context/appContext";
import { usePatchSessionsBySessionIdMutation as usePatchSessionMutation } from "../api/sessionsV2.api";
import type { SessionV2 } from "../sessionsV2.types";

interface SessionPausedProps {
  session: SessionV2;
}

export default function SessionPaused({ session }: SessionPausedProps) {
  const { name: sessionName } = session;

  const { namespace, slug } = useParams<"namespace" | "slug">();

  const [patchSession, { error }] = usePatchSessionMutation();

  const [isResuming, setIsResuming] = useState(false);

  const onResumeSession = useCallback(() => {
    patchSession({
      sessionId: sessionName,
      sessionPatchRequest: { state: "running" },
    });
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

  const backUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: namespace ?? "",
    slug: slug ?? "",
  });

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
              <QuestionCircle className={cx("bi", "me-2", "fs-5")} />
              You should either{" "}
              <Button color="primary" onClick={onResumeSession} size="sm">
                resume the session
              </Button>{" "}
              or{" "}
              <Link
                className={cx("btn", "btn-secondary", "btn-sm")}
                to={backUrl}
              >
                go back to the project page
              </Link>
              .
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
    "Unable to delete the current session",
    undefined,
    undefined,
    undefined,
    `Error message: "${message}"`
  );
}
