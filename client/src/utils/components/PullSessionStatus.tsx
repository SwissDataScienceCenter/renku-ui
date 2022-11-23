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

import { RootStateOrAny, useSelector } from "react-redux";
import { useEffect } from "react";
import { WsMessage } from "../../websocket/WsMessages";

interface PullSessionStatusProps {
  socket: any;
  fetchSessions: boolean;
}
function PullSessionStatus({ socket, fetchSessions = true }: PullSessionStatusProps) {
  const websocket = useSelector((state: RootStateOrAny) => state.stateModel.webSocket);
  useEffect(() => {
    if (fetchSessions && websocket.open && socket) {
      const message = JSON.stringify(new WsMessage({}, "pullSessionStatus"));
      socket.send(message);
    }
    return () => {
      if (fetchSessions)
        socket?.send(JSON.stringify(new WsMessage({}, "stopPullSessionStatus")));
    };
  }, []); //eslint-disable-line
  return null;
}

export default PullSessionStatus;
