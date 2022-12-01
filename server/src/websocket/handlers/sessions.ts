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

import logger from "../../logger";
import { Channel } from "../index";
import APIClient from "../../api-client";
import * as util from "util";
import { WsMessage } from "../WsMessages";

interface SessionsResult {
  servers: Record<string, Session>;
}
interface Session {
  status: {
    details: {
      status: string;
      step: string;
    }[];
    message?: string;
    readyNumContainers: number;
    state: string;
    totalNumContainers: number;
  };
}

function handlerRequestSessionStatus(
  data: Record<string, unknown>, channel: Channel): void {
  channel.data.set("sessionStatus", null);
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "sessionStatus");
  channel.sockets.forEach(socket => socket.send(info.toString()));
}

function heartbeatRequestSessionStatus
(channel: Channel, apiClient: APIClient, authHeathers: Headers): void {
  const previousStatuses = channel.data.get("sessionStatus") as SessionsResult;
  apiClient.getSessionStatus(authHeathers)
    .then((response) => {
      const statusFetched = response as unknown as SessionsResult;
      const servers = statusFetched?.servers ?? {};
      const cleanStatus: Record<string, Session> = {};
      // only keep status information
      Object.keys(servers).map( key => {
        cleanStatus[key] = { status: servers[key].status };
      });

      // only send message when something change
      if (!util.isDeepStrictEqual(previousStatuses, cleanStatus)) {
        sendMessage("true", channel);
        channel.data.set("sessionStatus", cleanStatus);
      }
    })
    .catch((e) => {
      logger.warn("There was a problem while trying to fetch sessions");
      logger.warn(e);
    });
}

export { handlerRequestSessionStatus, heartbeatRequestSessionStatus };
