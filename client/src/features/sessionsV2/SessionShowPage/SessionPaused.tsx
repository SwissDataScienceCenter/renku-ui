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
import { QuestionCircle } from "react-bootstrap-icons";
import { Alert } from "reactstrap";
import type { SessionV2 } from "../sessionsV2.types";

interface SessionPausedProps {
  session?: SessionV2;
}

export default function SessionPaused({ session }: SessionPausedProps) {
  //   const location = useLocation<{ filePath?: string } | undefined>();
  //   const locationFilePath = location.state?.filePath;

  //   const pathWithNamespace = useLegacySelector<string>(
  //     (state) => state.stateModel.project.metadata.pathWithNamespace
  //   );

  //   const projectUrlData = {
  //     namespace: "",
  //     path: pathWithNamespace,
  //   };
  //   const sessionsListUrl = Url.get(Url.pages.project.session, projectUrlData);

  //   const [patchSession, { error }] = usePatchSessionMutation();

  //   const [isResuming, setIsResuming] = useState(false);

  //   const onResumeSession = useCallback(() => {
  //     patchSession({ sessionName: sessionName, state: "running" });
  //     setIsResuming(true);
  //   }, [patchSession, sessionName]);

  //   const { notifications } = useContext(AppContext);

  //   useEffect(() => {
  //     if (error != null) {
  //       addErrorNotification({
  //         error,
  //         notifications: notifications as NotificationsManager,
  //       });
  //     }
  //   }, [error, notifications]);

  //   // Resume session if opening a notebook from the file explorer
  //   useEffect(() => {
  //     if (locationFilePath) {
  //       onResumeSession();
  //     }
  //   }, [locationFilePath, onResumeSession]);

  return (
    <div className={cx("p-2", "p-lg-3", "text-nowrap", "container-lg")}>
      <p className="mt-2">This session is currently stopped.</p>
      <Alert color="primary">
        <p className="mb-0">
          {/* {isResuming ? (
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
                disabled={isResuming}
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
          )} */}
          <QuestionCircle className={cx("bi", "me-1")} />
          You should either {"["}resume the session{"]"} or {"["}go to the
          sessions list{"]"}.
        </p>
        <pre>{session?.name}</pre>
      </Alert>
    </div>
  );
}
