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

import fetch from "cross-fetch";
import ws from "ws";

import config from "../config";
import logger from "../logger";
import WsMessage from "./WsMessage";
import { Storage } from "../storage";
import { Authenticator } from "../authentication";
import { wsRenkuAuth } from "../authentication/middleware";
import { simpleHash } from "../utils";


interface Channel {
  sockets: Array<ws>;
}

const channels = new Map<string, Channel>();


// ! TODO: implement UI version check
async function checkUiVersion() {
  const uiShortSha = process.env.RENKU_UI_SHORT_SHA ?
    process.env.RENKU_UI_SHORT_SHA :
    "";
}

/**
 * Check user sessions
 * @param sessionId - user session ID
 * @param storage - storage component
 */
async function checkSession(sessionId: string, storage: Storage, headers: Record<string, string>): Promise<boolean> {
  // fetch sessions
  let hashedSessions: string;
  try {
    const { gatewayUrl } = config.deployment;
    const sessionsUrl = `${gatewayUrl}/notebooks/servers`;
    logger.info(`Fetching sessions from <${sessionsUrl}>`); // ? TMP

    const response = await fetch(sessionsUrl, { headers });
    const sessions = await response.json();

    hashedSessions = simpleHash(JSON.stringify(sessions)).toString();
    logger.info(`Session fetched succesfully. The hash is ${hashedSessions}`); // ? TMP
  }
  catch (e) {
    logger.warn("There was a problem while trying to fetch sessions");
    logger.warn(e);
    throw e;
  }

  // try to get old hash and compare it
  let changed = false;
  const storageKey = config.data.userSessionsPrefix + sessionId;
  const oldHash = await storage.get(storageKey) as string;
  if (oldHash && oldHash !== hashedSessions)
    changed = true;
  if (!oldHash || oldHash !== hashedSessions)
    await storage.save(storageKey, hashedSessions);
  return changed;
}

/**
 * Loop for each user -- the output is sent to each WebSocket channel the user has active.
 * It will automatically reschedule if at least one channel is active, or close otherwise.
 * @param sessionId - user session ID
 * @param authenticator - auth component
 * @param storage - storage component
 */
async function channelLoop(sessionId: string, authenticator: Authenticator, storage: Storage) {
  const channel = channels.get(sessionId);
  const hashedUser = simpleHash(sessionId); // ? TMP
  if (!channel) {
    logger.info(`${hashedUser}: No channel anymore for the user, stopping the loop`);
    return;
  }

  const timeoutLength = config.websocket.interval as number * 1000;
  if (!authenticator.ready) {
    logger.warn(`${hashedUser}: Authenticator not ready yet -- skipping to the next loop`);
    setTimeout(() => channelLoop(sessionId, authenticator, storage), timeoutLength);
    return;
  }

  logger.info(`${hashedUser}: starting the loop`); // ? TMP

  // get the auth headers // TODO: move this away? Or keep the logic here?
  let authHeaders: Record<string, string>;
  try {
    authHeaders = await wsRenkuAuth(authenticator, sessionId);
  }
  catch (error) {
    const mexType = "user";
    const mexScope = "authentication";
    const data = { message: "authentication expired" };
    if (error.message.toString().includes("expired")) {
      logger.warn(`Auth expired for user ${hashedUser}`);
      const expiredMessage = new WsMessage({ ...data, expired: true }, mexType, mexScope);
      channel.sockets.forEach(socket => socket.send(expiredMessage.toString()));
    }
    else {
      logger.warn(`Auth not valid for user ${hashedUser}`);
      const expiredMessage = new WsMessage({ ...data, invalid: true }, mexType, mexScope);
      channel.sockets.forEach(socket => socket.send(expiredMessage.toString()));
    }
    return;
  }

  if (authHeaders) {
    // TODO: do not await every step, but get the promis and setTimeout once all are resolved
    try {
      // fetch sessions
      const sessionsChanged = await checkSession(sessionId, storage, authHeaders);
      if (sessionsChanged) {
        const mex = new WsMessage({ message: "changed", changed: true }, "user", "sessions");
        channel.sockets.forEach(socket => socket.send(mex.toString()));
      }
    }
    catch (e) {
      const mex = new WsMessage({ message: "could not check sessions" }, "user", "error");
      channel.sockets.forEach(socket => socket.send(mex.toString()));
    }

    // ? Should this happen even with no auth headers?
    setTimeout(() => channelLoop(sessionId, authenticator, storage), timeoutLength);
  }
  else {
    // ? Should this happen even with no auth headers? (see above)
    logger.info(`${hashedUser}: no auth-headers found.`);
  }

  // This helps in keeping the socket alive
  channel.sockets.forEach(socket => socket.ping());
}


function configureWebsocket(server: ws.Server, authenticator: Authenticator, storage: Storage): void {
  server.on("connection", async (socket, request) => {
    // ! Should we Upgrade here?
    // ! Verify the Origin since same-origin policy doesn't work for WS

    // get the user id
    const sessionId = request.headers["ui-server-session"] ?
      request.headers["ui-server-session"] as string :
      "";
    const hashedUser = simpleHash(sessionId); // ? TMP
    logger.info(`Incoming connection from: ${hashedUser}`); // ? TMP

    if (sessionId) {
      // Either create a new channel or add a new socket
      const channel = channels.get(sessionId);
      if (channel) {
        logger.info(
          `Adding a new socket to the channel for user ${hashedUser}. Total of ${channel.sockets.length + 1}`
        );
        channels.set(sessionId, { ...channel, sockets: [...channel.sockets, socket] });
      }
      else {
        logger.info(`Creating new channel for user ${hashedUser}`);
        channels.set(sessionId, { sockets: [socket] });
        channelLoop(sessionId, authenticator, storage);
      }
    }
    else {
      logger.warn("No ID for the user, session won't be saved.");
      // ? This should not happen once we handle also the anon-id
    }

    // ! TODO: check this again
    socket.on("close", (code, reason) => {
      // Update or remove channel
      if (!sessionId) {
        logger.info("Nothing to cleanup for a user without ID.");
      }
      else {
        const channel = channels.get(sessionId);
        if (!channel) {
          logger.warn(`No channel for user ${hashedUser}. That is unexpected...`);
        }
        else {
          if (channel.sockets?.length > 1) {
            // channels.set(sessionId, { ...channel, sockets: [...channel.sockets, socket] });
            const remainingChannels = channel.sockets.length - 1;
            logger.info(
              `There are other ${remainingChannels} sockts for the user ${hashedUser}. Removing the current one...`
            );
            const index = channel.sockets.indexOf(socket);
            if (index >= 0)
              channel.sockets = [...channel.sockets.slice(0, index), ...channel.sockets.slice(index + 1)];
            else
              logger.warn("Socket not found 😱");
          }
          else {
            logger.info(`Last socket for user ${hashedUser}. Deleting the channel...`);
            channels.delete(sessionId);
          }
        }
      }
    });

    socket.on("message", async (message) => {
      // TODO: axpand commands here
      const answer = `${hashedUser}: unknown command received: ${message}`;
      const mex = new WsMessage({ message: answer }, "user", "error");
      logger.info(answer);
      socket.send(mex.toString());
    });

    // Send an ack
    const ack = new WsMessage("Connection enstablished", "user", "init");
    socket.send(ack.toString());
  });
}

export { configureWebsocket };
