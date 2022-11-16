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

interface Session {
  annotations: Record<string, string>;
  cloudStorage: Record<string, string|number> | null;
  image: string;
  name: string;
  resources: {
    requests: Record<string, string|number>;
    usage: Record<string, string|number> | null;
    started: string;
  };
  state: {
    "pod_name": string;
  };
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
  url: string;
}

async function handlerRequestSessionStatus(
  data: Record<string, unknown>, channel: Channel): Promise<void> {
  // save the request enabler
  channel.data.set("requestSessionStatus", true);
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "sessionStatus");
  channel.sockets.forEach(socket => socket.send(info.toString()));
}

async function heartbeatRequestSessionStatus(channel: Channel, apiClient: APIClient): Promise<void> {
  const requestSession = channel.data.get("requestSessionStatus") as boolean;
  if (requestSession) {
    const previousStatuses = channel.data.get("sessionStatus") as Record<string, Session>;
    apiClient.sessionStatus()
      .then(async (response) => {
        const statusFetched = response as unknown as Record<string, Session>;
        const cleanStatus = statusFetched;
        Object.keys(statusFetched).map( key => {
          cleanStatus[key].resources.usage = null;
        });
        console.log("---------> statuses", JSON.stringify(cleanStatus), JSON.stringify(previousStatuses));
        if (!util.isDeepStrictEqual(previousStatuses, cleanStatus)) {
          console.log("💙 sending session message");
          sendMessage(JSON.stringify(cleanStatus), channel);
          channel.data.set("sessionStatus", cleanStatus);
        }
        else {
          console.log("👯‍️ same object", JSON.stringify(cleanStatus));
        }
      })
      .catch((e) => {
        logger.warn("There was a problem while trying to fetch sessions");
        logger.warn(e);
      });
  }
}

// ! This is only an example, it's not used yet in production
// TODO: cleanup and use it in the short loop

/**
 * Check user sessions
 * @param sessionId - user session ID
 * @param storage - storage component
 */
// async function checkSession(sessionId: string, storage: Storage, headers: Record<string, string>): Promise<boolean> {
//   // fetch sessions
//   let hashedSessions: string;
//   try {
//     const { gatewayUrl } = config.deployment;
//     const sessionsUrl = `${gatewayUrl}/notebooks/servers`;
//     logger.info(`Fetching sessions from <${sessionsUrl}>`); // ? TMP
//
//     const response = await fetch(sessionsUrl, { headers });
//     const sessions = await response.json();
//
//     hashedSessions = simpleHash(JSON.stringify(sessions)).toString();
//     logger.info(`Session fetched succesfully. The hash is ${hashedSessions}`); // ? TMP
//   }
//   catch (e) {
//     logger.warn("There was a problem while trying to fetch sessions");
//     logger.warn(e);
//     throw e;
//   }
//
//   // try to get old hash and compare it
//   // TODO: should we store this in the channel cache instead?
//   let changed = false;
//   const storageKey = config.data.userSessionsPrefix + sessionId;
//   const oldHash = await storage.get(storageKey) as string;
//   if (oldHash && oldHash !== hashedSessions)
//     changed = true;
//   if (!oldHash || oldHash !== hashedSessions)
//     await storage.save(storageKey, hashedSessions);
//   return changed;
// }

export { handlerRequestSessionStatus, heartbeatRequestSessionStatus };
