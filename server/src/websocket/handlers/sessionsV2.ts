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
import { flattenSessionV2, SessionFlattedV2, simpleHash } from "../../utils";

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

function heartbeatRequestSessionStatusV2(
  channel: Channel,
  apiClient: APIClient,
  authHeathers: Record<string, string>
): void {
  const previousStatuses = channel.data.get("sessionStatusV2") as string;
  apiClient
    .getSessionStatusV2(authHeathers)
    .then((response) => {
      const statusFetched = response as unknown as SessionV2[];
      const sessions = statusFetched ?? [];
      const sessionFlatted = sessions
        .slice()
        .map((session) => flattenSessionV2(session));
      const sortSessions = (a: SessionFlattedV2, b: SessionFlattedV2) =>
        a.name.localeCompare(b.name);
      const sortedSessions = sessionFlatted.slice().sort(sortSessions);
      const currentHashedSessions = simpleHash(
        JSON.stringify(sortedSessions)
      ).toString();
      // only send message when something change
      if (!util.isDeepStrictEqual(previousStatuses, currentHashedSessions)) {
        sendMessage("true", channel);
        channel.data.set("sessionStatusV2", currentHashedSessions);
      }
    })
    .catch((e) => {
      logger.warn("There was a problem while trying to fetch sessions");
      if (e.message) logger.warn(e.message);
      logger.warn(e);
    });
}

export { handlerRequestSessionStatusV2, heartbeatRequestSessionStatusV2 };
