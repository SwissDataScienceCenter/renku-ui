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


import ws from "ws";

import config from "../config";
import logger from "../logger";
import { checkWsClientMessage, WsMessage, WsClientMessage } from "./WsMessages";
import { Storage } from "../storage";
import { Authenticator } from "../authentication";
import { wsRenkuAuth } from "../authentication/middleware";
import { getCookieValueByName } from "../utils";
import { handlerRequestServerVersion, heartbeatRequestServerVersion } from "./handlers/clientVersion";
import { handlerRequestActivationKgStatus, heartbeatRequestActivationKgStatus } from "./handlers/activationKgStatus";
import APIClient from "../api-client";


// *** Channels ***
// No need to store data in Redis since it's used only locally. We can modify this if necessary.

interface Channel {
  sockets: Array<ws>;
  data: Map<string, unknown>;
}

const channels = new Map<string, Channel>();


// *** Accepted messages ***

interface MessageData {
  required: Array<string> | null;
  optional: Array<string> | null;
  handler: Function; // eslint-disable-line
}

const acceptedMessages: Record<string, Array<MessageData>> = {
  "init": [
    {
      required: ["requestServerVersion"],
      optional: null,
      handler: handlerRequestServerVersion
    } as MessageData,
  ],
  "pullKgActivationStatus": [
    {
      required: ["projects"],
      optional: null,
      handler: handlerRequestActivationKgStatus
    } as MessageData,
  ],
  "ping": [
    {
      required: null,
      optional: null,
      handler: (data: Record<string, unknown>, channel: Channel, socket: ws) => {
        return socket.send((new WsMessage("ping", "user", "ack")).toString());
      }
    },
  ]
};


// *** Heartbeats functions ***

const longLoopFunctions: Array<Function> = [ // eslint-disable-line
  heartbeatRequestServerVersion
];
const shortLoopFunctions: Array<Function> = [ // eslint-disable-line
  heartbeatRequestActivationKgStatus
];

/**
 * Long loop for each user -- executed every few minutes.
 * It automatically either reschedules when at least one channel is active, or close.
 * @param sessionId - user session ID
 * @param authenticator - auth component
 * @param storage - storage component
 */
async function channelLongLoop(sessionId: string, authenticator: Authenticator, storage: Storage) {
  const infoPrefix = `${sessionId} - long loop:`;

  // checking user
  const channel = channels.get(sessionId);
  if (!channel) {
    logger.info(`${infoPrefix} no channels detected, ending loop.`);
    return false;
  }

  // checking authentication
  const timeoutLength = config.websocket.longIntervalSec as number * 1000;
  if (!authenticator.ready) {
    logger.info(`${infoPrefix} Authenticator not ready yet, skipping to the next loop`);
    setTimeout(() => channelLongLoop(sessionId, authenticator, storage), timeoutLength);
    return false;
  }

  // get the auth headers
  const authHeaders = await getAuthHeaders(authenticator, sessionId, infoPrefix);
  if (authHeaders instanceof WsMessage && authHeaders.data.expired) {
    // ? here authHeaders is an error message
    channel.sockets.forEach(socket => socket.send(authHeaders.toString()));
    channels.delete(sessionId);
    return false;
  }

  for (const longLoopFunction of longLoopFunctions) {
    // execute the loop function
    try {
      longLoopFunction(channel);
    }
    catch (error) {
      const info = `Unexpected error while executing the function '${longLoopFunction.name}'.`;
      logger.error(`${infoPrefix} ${info}`);
      channel.sockets.forEach(socket => socket.send((new WsMessage(info, "user", "error")).toString()));
    }
  }

  // Ping to keep the socket alive, then reschedule loop
  channel.sockets.forEach(socket => socket.ping());
  setTimeout(() => channelLongLoop(sessionId, authenticator, storage), timeoutLength);
}

/**
 * Short loop for each user -- executed every few seconds.
 * It automatically either reschedules when at least one channel is active, or close.
 * @param sessionId - user session ID
 * @param authenticator - auth component
 * @param storage - storage component
 * @param apiClient - api client
 */
async function channelShortLoop(sessionId: string, authenticator: Authenticator, storage: Storage, apiClient: APIClient) {
  const infoPrefix = `${sessionId} - short loop:`;

  // checking user
  const channel = channels.get(sessionId);
  if (!channel) {
    logger.info(`${infoPrefix} no channels detected, ending loop.`);
    return false;
  }

  // checking authentication
  const timeoutLength = config.websocket.shortIntervalSec as number * 1000;
  if (!authenticator.ready) {
    logger.info(`${infoPrefix} Authenticator not ready yet, skipping to the next loop`);
    setTimeout(() => channelShortLoop(sessionId, authenticator, storage, apiClient), timeoutLength);
    return;
  }

  // get the auth headers
  const authHeaders = await getAuthHeaders(authenticator, sessionId, infoPrefix);
  if (authHeaders instanceof WsMessage && authHeaders.data.expired) {
    // ? here authHeaders is an error message
    channel.sockets.forEach(socket => socket.send(authHeaders.toString()));
    channels.delete(sessionId);
    return false;
  }

  for (const shortLoopFunction of shortLoopFunctions) {
    // execute the loop function
    try {
      shortLoopFunction(channel, apiClient);
    }
    catch (error) {
      const info = `Unexpected error while executing the function '${shortLoopFunction.name}'.`;
      logger.error(`${infoPrefix} ${info}`);
      channel.sockets.forEach(socket => socket.send((new WsMessage(info, "user", "error")).toString()));
    }
  }

  // Ping to keep the socket alive, then reschedule loop
  channel.sockets.forEach(socket => socket.ping());
  setTimeout(() => channelShortLoop(sessionId, authenticator, storage, apiClient), timeoutLength);
}


// *** WebSocket startup and configuration ***
// We might want to increase the `proxy_read_timeout` in nginx, otherwise connection terminates after 60 seconds
// REF: http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout

/**
 * Configure WebSocket by setting up events and starting loops.
 * @param server - main wss server
 * @param authenticator - auth component
 * @param storage - storage component
 * @param apiClient - api client
 */
function configureWebsocket(server: ws.Server, authenticator: Authenticator, storage: Storage, apiClient: APIClient): void {
  server.on("connection", async (socket, request) => {
    // ? Should we Upgrade here? And verify the Origin since same-origin policy doesn't work for WS?

    // get the user id
    const sessionId = getCookieValueByName(request.headers.cookie, config.auth.cookiesKey);
    if (!sessionId) {
      logger.error("No ID for the user, session won't be saved.");
      const info = "The request does not contain a valid session ID." +
        " Are you reaching the WebSocket from an external source?";
      socket.send((new WsMessage({ message: info, missingAuth: true }, "user", "error")).toString());
      socket.close(4000);
      return false;
    }
    logger.debug(`Incoming connection from: ${sessionId}`);

    // Either create a new channel or add a new socket and start the loops
    const channel = channels.get(sessionId);
    if (channel) {
      logger.debug(
        `Adding a new socket to the channel for user ${sessionId}. Total of ${channel.sockets.length + 1}`
      );
      channels.set(sessionId, { ...channel, sockets: [...channel.sockets, socket] });
    }
    else {
      logger.debug(`Creating new channel for user ${sessionId}`);
      channels.set(sessionId, { sockets: [socket], data: new Map() });
      // add a buffer before starting the loop, so we can receive setup messages

      setTimeout(() => {
        channelShortLoop(sessionId, authenticator, storage, apiClient);
        // add a tiny buffer, in case authentication fails and channel is cleaned up -- no need to overlap
        setTimeout(() => { channelLongLoop(sessionId, authenticator, storage); }, 1000);
      }, config.websocket.delayStartSec * 1000);
    }

    // event: close the socket
    socket.on("close", () => { // (code, reason) might be used here
      // Verify session
      if (!sessionId) {
        logger.debug("Nothing to cleanup for a user without ID.");
        return false;
      }

      // Identify channel
      const channel = channels.get(sessionId);
      if (!channel) {
        logger.warn(`No channel for user ${sessionId}. That is unexpected...`);
        return false;
      }

      // Remove socket and channel when no other sockets are left
      if (channel.sockets?.length > 1) {
        const remainingSockets = channel.sockets.length - 1;
        const remainingText = remainingSockets === 0 ?
          `There are no channels left for the user ` :
          `THere are other ${remainingSockets} socket(s) for the user `;
        logger.debug(`Removing the channel. ${remainingText} ${sessionId}.`);
        const index = channel.sockets.indexOf(socket);
        if (index >= 0)
          channel.sockets = [...channel.sockets.slice(0, index), ...channel.sockets.slice(index + 1)];
        else
          logger.error("Socket not found.");
      }
      else {
        logger.info(`Last socket for user ${sessionId}. Deleting the channel...`);
        channels.delete(sessionId);
      }
    });

    // event: receive a message
    socket.on("message", async (message) => {
      // Try to parse the message to a WsClientMessage
      let clientMessage: WsClientMessage;
      try {
        clientMessage = JSON.parse(message as string);
        const res = checkWsClientMessage(clientMessage);
        if (!res)
          throw new Error("WebSocket message is a valid JSON object but not a WsClientMessage");
      }
      catch (error) {
        const info = "Incoming message is bad formed: " + error.toString();
        logger.error(`${info}\nmessage: ${message}`);
        socket.send((new WsMessage(info, "user", "error")).toString());
        return false;
      }

      // Validate the message and find the instructions
      const handler = getWsClientMessageHandler(acceptedMessages, clientMessage);

      if (typeof handler === "string") {
        logger.error(`${handler}\nmessage: ${message}`);
        socket.send((new WsMessage(handler, "user", "error")).toString());
        return false;
      }

      // execute the command
      try {
        handler(clientMessage.data, channels.get(sessionId), socket);
      }
      catch (error) {
        const info = `Error while executing the '${clientMessage.type}' command: ${error.toString()}`;
        logger.error(`${info}\nmessage: ${message}`);
        socket.send((new WsMessage(info, "user", "error")).toString());
      }
    });

    // check auth
    const head = await getAuthHeaders(authenticator, sessionId);
    if (head instanceof WsMessage && head.data?.expired)
      socket.send(head.toString());
    socket.send((new WsMessage("Connection established.", "user", "init")).toString());
  });
}


// *** Helper functions ***

/**
 * Either get the handler function for the specific client message, or a sentence explaining the error.
 * @param acceptedMessages - list of accepted WsClient messages
 * @param clientMessage - message from the client
 * @returns handler function or error message
 */
function getWsClientMessageHandler(
  acceptedMessages: Record<string, Array<MessageData>>, clientMessage: WsClientMessage
): Function | string { // eslint-disable-line
  if (!acceptedMessages[clientMessage.type])
    return `Instruction of type '${clientMessage.type}' is not supported.`;

  // match proper instruction set for the message type
  const dataProps = Object.keys(clientMessage.data);
  for (const instruction of acceptedMessages[clientMessage.type]) {
    let valid = true;
    // must have all the required
    if (instruction.required) {
      for (const required of instruction.required) {
        if (!dataProps.includes(required)) {
          valid = false;
          break;
        }
      }
    }
    // can have only required or optional
    if (valid) {
      for (const prop of dataProps) {
        if (!instruction.required?.includes(prop) && !instruction.optional?.includes(prop)) {
          valid = false;
          break;
        }
      }
    }

    // stop when found a valid one
    if (valid)
      return instruction.handler;
  }
  return `Could not find a proper handler; data is wrong for a '${clientMessage.type}' instruction.`;
}

/**
 * Get auhtentication headers
 * @param authenticator - auth component
 * @param sessionId - user session ID
 * @param infoPrefix - this is for the logger
 * @returns error with WsMessage or headers
 */
async function getAuthHeaders(
  authenticator: Authenticator, sessionId: string, infoPrefix = ""
): Promise<WsMessage | Record<string, string>> {
  try {
    const authHeaders = await wsRenkuAuth(authenticator, sessionId);
    if (!authHeaders)
      // user is anonymous
      return null;
  }
  catch (error) {
    const data = { message: "authentication not valid" };
    let expiredMessage: WsMessage;
    if (error.message.toString().includes("expired")) {
      // Try to refresh tokens automatically
      try {
        logger.debug(`${infoPrefix} try to refresh tokens.`);
        await authenticator.refreshTokens(sessionId);
        const authHeaders = await wsRenkuAuth(authenticator, sessionId);
        if (!authHeaders)
          throw new Error("Cannot find auth headers after refreshing");
        logger.debug(`${infoPrefix} tokens refreshed.`);
        return authHeaders;
      }
      catch (internalError) {
        logger.warn(`${infoPrefix} auth expired.`);
        expiredMessage = new WsMessage({ ...data, expired: true }, "user", "authentication");
      }
    }
    else {
      logger.warn(`${infoPrefix} auth invalid.`);
      expiredMessage = new WsMessage({ ...data, invalid: true }, "user", "authentication");
    }
    return expiredMessage;
  }
}

export { Channel, MessageData, configureWebsocket, getWsClientMessageHandler };
