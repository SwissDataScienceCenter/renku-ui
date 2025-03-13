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

import * as util from "util";

import logger from "../../logger";
import { simpleHash, sortObjectProperties } from "../../utils";

import { WsMessage } from "../WsMessages";
import type { Channel, WebSocketHandlerArgs } from "./handlers.types";

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

function handlerRequestSessionStatus(
  _data: Record<string, unknown>,
  channel: Channel
): void {
  channel.data.set("sessionStatus", null);
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "sessionStatus");
  channel.sockets.forEach((socket) => socket.send(info.toString()));
}

function heartbeatRequestSessionStatus({
  channel,
  apiClient,
  headers,
}: WebSocketHandlerArgs): void {
  const previousStatuses = channel.data.get("sessionStatus") as string;
  apiClient
    .getSessionStatus(headers)
    .then((response) => {
      const statusFetched = response as unknown as SessionsResult;
      const servers = statusFetched?.servers ?? {};

      // Keep only relevant status information, without warning messages
      const cleanedServerEntries = Object.entries(servers).map(
        ([key, session]) => {
          const {
            details,
            message,
            readyNumContainers,
            state,
            totalNumContainers,
          } = session.status;
          const cleanedStatus = {
            details: details ?? [],
            ...(message ? { message } : {}),
            readyNumContainers: readyNumContainers ?? -1,
            state: state ?? { pod_name: "" },
            totalNumContainers: totalNumContainers ?? -1,
          };
          return [key, { status: cleanedStatus }] as const;
        }
      );
      const cleanedServers = cleanedServerEntries.reduce(
        (obj, [key, value]) => ({ ...obj, [key]: value }),
        {} as Record<string, Session>
      );

      const sortedObject = sortObjectProperties(cleanedServers);
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
