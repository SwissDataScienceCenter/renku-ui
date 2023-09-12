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
import { simpleHash, sortObjectProperties } from "../../utils";

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
    state: {
      pod_name: string;
      [key: string]: unknown;
    };
    totalNumContainers: number;
    [key: string]: unknown;
  };
}
const validStatuses = [
  "details",
  "message",
  "readyNumContainers",
  "state",
  "totalNumContainers",
];

function handlerRequestSessionStatus(
  data: Record<string, unknown>,
  channel: Channel
): void {
  channel.data.set("sessionStatus", null);
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "sessionStatus");
  channel.sockets.forEach((socket) => socket.send(info.toString()));
}

function heartbeatRequestSessionStatus(
  channel: Channel,
  apiClient: APIClient,
  authHeathers: Record<string, string>
): void {
  const previousStatuses = channel.data.get("sessionStatus") as string;
  apiClient
    .getSessionStatus(authHeathers)
    .then((response) => {
      const statusFetched = response as unknown as SessionsResult;
      const servers = statusFetched?.servers ?? {};

      // Keep only relevant status information, without warning messages
      const cleanStatus: Record<string, Session> = {};
      Object.keys(servers).map((key) => {
        try {
          const initialStatus: Session["status"] = {
            details: [],
            readyNumContainers: -1,
            state: {
              pod_name: "",
            },
            totalNumContainers: -1,
          };
          const filedsToKeep = Object.keys(servers[key].status).filter(
            (status) => validStatuses.includes(status)
          );
          const filteredStatus = filedsToKeep.reduce((obj, val: string) => {
            obj[val] = servers[key].status[val];
            return obj;
          }, initialStatus);
          cleanStatus[key] = { status: filteredStatus };
        } catch (e) {
          cleanStatus[key] = { status: servers[key].status };
        }
      });

      const sortedObject = sortObjectProperties(
        cleanStatus as Record<string, never>
      );
      const currentHashedSessions = simpleHash(
        JSON.stringify(sortedObject)
      ).toString();
      // only send message when something change
      if (!util.isDeepStrictEqual(previousStatuses, currentHashedSessions)) {
        sendMessage("true", channel);
        channel.data.set("sessionStatus", currentHashedSessions);
      }
    })
    .catch((e) => {
      logger.warn("There was a problem while trying to fetch sessions");
      if (e.message) logger.warn(e.message);
      logger.warn(e);
    });
}

export { handlerRequestSessionStatus, heartbeatRequestSessionStatus };
