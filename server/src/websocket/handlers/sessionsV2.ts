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

import * as util from "util";
import logger from "../../logger";
import { flattenNestedObject, simpleHash } from "../../utils";
import { Channel } from "../index";
import { WsMessage } from "../WsMessages";
import { WebSocketHandlerArgs } from "./handlers.types";

export interface SessionResources {
  cpu: number;
  gpu: number;
  memory: number;
  storage: number;
}

export interface SessionStatus {
  message?: string;
  state: "running" | "starting" | "stopping" | "failed" | "hibernated";
  will_hibernate_at?: string;
  will_delete_at?: string;
  ready_containers: number;
  total_containers: number;
}

export interface SessionV2 {
  image: string;
  name: string;
  resources: SessionResources;
  started: string;
  status: SessionStatus;
  url: string;
  project_id: string;
  launcher_id: string;
  resource_class_id: string;
}

function handlerRequestSessionStatusV2(
  data: Record<string, unknown>,
  channel: Channel
): void {
  channel.data.set("sessionStatusV2", null);
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "sessionStatusV2");
  channel.sockets.forEach((socket) => socket.send(info.toString()));
}

function heartbeatRequestSessionStatusV2({
  channel,
  apiClient,
  headers,
}: WebSocketHandlerArgs): void {
  const previousStatuses = channel.data.get("sessionStatusV2") as string;
  apiClient
    .getSessionStatusV2(headers)
    .then((response) => {
      if (!Array.isArray(response)) {
        logger.warn("Response is not an array");
        return;
      }
      const sessions = response.map((session) => flattenNestedObject(session));
      const sortedSessions = sessions.sort((a, b) =>
        (a.name as string).localeCompare(b.name as string)
      );
      const currentHashedSessions = simpleHash(
        JSON.stringify(sortedSessions)
      ).toString();
      // only send message when something change
      if (!util.isDeepStrictEqual(previousStatuses, currentHashedSessions)) {
        sendMessage("true", channel);
        channel.data.set("sessionStatusV2", currentHashedSessions);
      }
    })
    .catch((error) => {
      logger.warn("There was a problem while trying to fetch sessions");
      if (error.message) logger.warn(error.message);
    });
}

export { handlerRequestSessionStatusV2, heartbeatRequestSessionStatusV2 };
