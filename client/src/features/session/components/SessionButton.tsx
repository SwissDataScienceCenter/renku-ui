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
import { Url } from "../../../utils/helpers/url";
import { useGetSessionsQuery } from "../sessionApi";
import { SESSIONS_POLLING_INTERVAL_MS } from "../sessions.constants";

type SessionButtonProps = SessionButtonCommonProps &
  (
    | {
        gitUrl: string;
        withActions: true;
      }
    | { withActions?: false }
  );

interface SessionButtonCommonProps {
  className?: string;
  fullPath: string;
}

export default function SessionButton({
  className,
  fullPath,
  withActions,
  ...rest
}: SessionButtonProps) {
  if (withActions) {
    return <span>{"[with actions]"}</span>;
  }

  return (
    <SessionButtonWithoutActions className={className} fullPath={fullPath} />
  );
  // const projectData = { namespace: "", path: fullPath };
  // const sessionAutostartUrl = Url.get(
  //   Url.pages.project.session.autostart,
  //   projectData
  // );

  // const currentSessions = useSelector(
  //   (state: RootStateOrAny) => state.stateModel.notebooks?.notebooks?.all
  // );
  // const localSessionRunning = currentSessions
  //   ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     (getSessionRunning(currentSessions, sessionAutostartUrl) as any)
  //   : false;
  // const history = useHistory();

  // let content = null;
  // if (loading) {
  //   content = <span>Loading...</span>;
  // } else {
  //   content = !localSessionRunning ? (
  //     <>
  //       <FontAwesomeIcon icon={faPlay} /> Start{" "}
  //     </>
  //   ) : (
  //     <div className="d-flex gap-2">
  //       <img src="/connect.svg" className="rk-icon rk-icon-md" /> Connect{" "}
  //     </div>
  //   );
  // }

  // const sessionLink = !localSessionRunning
  //   ? sessionAutostartUrl
  //   : localSessionRunning.showSessionURL;

  // const localClass = `btn btn-sm btn-rk-green btn-icon-text start-session-button ${className}`;
  // if (showAsLink && !loading)
  //   return (
  //     <Link to={sessionLink} className={localClass}>
  //       {content}
  //     </Link>
  //   );
  // return (
  //   <Button
  //     disabled={loading}
  //     onClick={() => history.push(sessionLink)}
  //     className={localClass}
  //   >
  //     {content}
  //   </Button>
  // );
}

function SessionButtonWithoutActions({}: SessionButtonCommonProps) {
  const { data: sessions, isLoading } = useGetSessionsQuery(undefined, {
    pollingInterval: SESSIONS_POLLING_INTERVAL_MS,
  });

  return <span>{"[without actions]"}</span>;
}
