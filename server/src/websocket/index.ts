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

import * as SentryLib from "@sentry/node";
import ws from "ws";

import APIClient from "../api-client";
import config from "../config";
import logger from "../logger";
import { Storage } from "../storage";
import { getCookieValueByName } from "../utils";
import { errorHandler } from "../utils/errorHandler";

import { WsClientMessage, WsMessage, checkWsClientMessage } from "./WsMessages";
import {
  handlerRequestActivationKgStatus,
  heartbeatRequestActivationKgStatus,
} from "./handlers/activationKgStatus";
import {
  handlerRequestServerVersion,
  heartbeatRequestServerVersion,
} from "./handlers/clientVersion";
import {
  handlerRequestSessionStatus,
  heartbeatRequestSessionStatus,
} from "./handlers/sessions";
import type { Channel, WebSocketHandler } from "./handlers/handlers.types";

// *** Channels ***
// No need to store data in Redis since it's used only locally. We can modify this if necessary.

const channels = new Map<string, Channel>();

// *** Accepted messages ***

interface MessageData {
  required: Array<string> | null;
  optional: Array<string> | null;
  handler: Function; // eslint-disable-line
}

const acceptedMessages: Record<string, Array<MessageData>> = {
  init: [
    {
      required: ["requestServerVersion"],
      optional: null,
      handler: handlerRequestServerVersion,
    } as MessageData,
  ],
  pullKgActivationStatus: [
    {
      required: ["projects"],
      optional: null,
      handler: handlerRequestActivationKgStatus,
    } as MessageData,
  ],
  pullSessionStatus: [
    {
      required: null,
      optional: null,
      handler: handlerRequestSessionStatus,
    } as MessageData,
  ],
  ping: [
    {
      required: null,
      optional: null,
      handler: (
        data: Record<string, unknown>,
        channel: Channel,
        socket: ws
      ) => {
        return socket.send(new WsMessage("ping", "user", "ack").toString());
      },
    },
  ],
};

// *** Heartbeats functions ***

const longLoopFunctions: Array<WebSocketHandler> = [
  heartbeatRequestServerVersion,
];
const shortLoopFunctions: Array<WebSocketHandler> = [
  heartbeatRequestSessionStatus,
  heartbeatRequestActivationKgStatus,
];

/**
 * Long loop for each user -- executed every few minutes.
 * It automatically either reschedules when at least one channel is active, or close.
 * @param sessionId - user session ID
 * @param storage - storage component
 * @param apiClient - api to fetch data
 */
async function channelLongLoop(
  sessionId: string,
  storage: Storage,
  apiClient: APIClient
) {
  const infoPrefix = `${sessionId} - long loop:`;

  // checking user
  const channel = channels.get(sessionId);
  if (!channel) {
    logger.info(`${infoPrefix} no channels detected, ending loop.`);
    return false;
  }

  // checking authentication
  const timeoutLength = (config.websocket.longIntervalSec as number) * 1_000;
  if (!storage.ready) {
    logger.info(
      `${infoPrefix} Storage not ready yet, skipping to the next loop`
    );
    setTimeout(
      () => channelLongLoop(sessionId, storage, apiClient),
      timeoutLength
    );
    return false;
  }

  // get the auth headers
  const headers = { Cookie: `${config.auth.cookiesKey}=${sessionId}` };

  for (const longLoopFunction of longLoopFunctions) {
    // execute the loop function
    try {
      longLoopFunction({ channel, apiClient, headers });
    } catch (error) {
      const info = `Unexpected error while executing the function '${longLoopFunction.name}'.`;
      logger.error(`${infoPrefix} ${info}`);
      channel.sockets.forEach((socket) =>
        socket.send(new WsMessage(info, "user", "error").toString())
      );
    }
  }

  // Ping to keep the socket alive, then reschedule loop
  channel.sockets.forEach((socket) => socket.ping());
  setTimeout(
    () => channelLongLoop(sessionId, storage, apiClient),
    timeoutLength
  );
}

/**
 * Short loop for each user -- executed every few seconds.
 * It automatically either reschedules when at least one channel is active, or close.
 * @param sessionId - user session ID
 * @param storage - storage component
 * @param apiClient - api client
 */
async function channelShortLoop(
  sessionId: string,
  storage: Storage,
  apiClient: APIClient
) {
  const infoPrefix = `${sessionId} - short loop:`;

  // checking user
  const channel = channels.get(sessionId);
  if (!channel) {
    logger.info(`${infoPrefix} no channels detected, ending loop.`);
    return false;
  }

  // checking authentication
  const timeoutLength = (config.websocket.shortIntervalSec as number) * 1_000;
  if (!storage.ready) {
    logger.info(
      `${infoPrefix} Storage not ready yet, skipping to the next loop`
    );
    setTimeout(
      () => channelShortLoop(sessionId, storage, apiClient),
      timeoutLength
    );
    return;
  }

  // get the auth headers
  const headers = { Cookie: `${config.auth.cookiesKey}=${sessionId}` };

  for (const shortLoopFunction of shortLoopFunctions) {
    // execute the loop function
    try {
      shortLoopFunction({ channel, apiClient, headers });
    } catch (error) {
      const info = `Unexpected error while executing the function '${shortLoopFunction.name}'.`;
      logger.error(`${infoPrefix} ${info}`);
      channel.sockets.forEach((socket) =>
        socket.send(new WsMessage(info, "user", "error").toString())
      );
    }
  }

  // Ping to keep the socket alive, then reschedule loop
  channel.sockets.forEach((socket) => socket.ping());
  setTimeout(
    () => channelShortLoop(sessionId, storage, apiClient),
    timeoutLength
  );
}

// *** WebSocket startup and configuration ***
// We might want to increase the `proxy_read_timeout` in nginx, otherwise connection terminates after 60 seconds
// REF: http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout

/**
 * Configure WebSocket by setting up events and starting loops.
 * @param server - main wss server
 * @param storage - storage component
 * @param apiClient - api client
 */
function configureWebsocket(
  server: ws.Server,
  storage: Storage,
  apiClient: APIClient
): void {
  server.on("connection", async (socket, request) => {
    // ? Should we Upgrade here? And verify the Origin since same-origin policy doesn't work for WS?

    // handle errors
    socket.on("error", async (error) => {
      errorHandler.handleError(error);
    });

    if (config.sentry.enabled) {
      SentryLib.setContext("WebSocket", {
        protocol: socket.protocol,
        url: socket.url,
      });
      const requestData = SentryLib.extractRequestData(request);
      SentryLib.setContext("WebSocket Initial Request", requestData);
    }

    // get the session id
    const sessionId = getCookieValueByName(
      request.headers.cookie,
      config.auth.cookiesKey
    );
    if (!sessionId) {
      logger.error("No session ID, session won't be saved.");
      const info =
        "The request does not contain a valid session ID." +
        " Are you reaching the WebSocket from an external source?";
      socket.send(
        new WsMessage(
          { message: info, missingAuth: true },
          "user",
          "error"
        ).toString()
      );
      socket.close(4000);
      return false;
    }
    logger.debug(`Incoming connection from: ${sessionId}`);

    // Either create a new channel or add a new socket and start the loops
    const channel = channels.get(sessionId);
    if (channel) {
      logger.debug(
        `Adding a new socket to the channel for the session ${sessionId}. Total of ${
          channel.sockets.length + 1
        }`
      );
      channels.set(sessionId, {
        ...channel,
        sockets: [...channel.sockets, socket],
      });
    } else {
      logger.debug(`Creating new channel for the session ${sessionId}`);
      channels.set(sessionId, { sockets: [socket], data: new Map() });
      // add a buffer before starting the loop, so we can receive setup messages

      setTimeout(() => {
        channelShortLoop(sessionId, storage, apiClient);
        // add a tiny buffer, in case authentication fails and channel is cleaned up -- no need to overlap
        setTimeout(() => {
          channelLongLoop(sessionId, storage, apiClient);
        }, 1_000);
      }, config.websocket.delayStartSec * 1_000);
    }

    // event: close the socket
    socket.on("close", () => {
      // (code, reason) might be used here
      // Verify session
      if (!sessionId) {
        logger.debug("Nothing to cleanup when there is no session ID.");
        return false;
      }

      // Identify channel
      const channel = channels.get(sessionId);
      if (!channel) {
        logger.warn(
          `No channel for the session ${sessionId}. That is unexpected...`
        );
        return false;
      }

      // Remove socket and channel when no other sockets are left
      if (channel.sockets?.length > 1) {
        const remainingSockets = channel.sockets.length - 1;
        const remainingText =
          remainingSockets === 0
            ? `There are no channels left for the sesssion `
            : `There are other ${remainingSockets} socket(s) for the session `;
        logger.debug(`Removing the channel. ${remainingText} ${sessionId}.`);
        const index = channel.sockets.indexOf(socket);
        if (index >= 0)
          channel.sockets = [
            ...channel.sockets.slice(0, index),
            ...channel.sockets.slice(index + 1),
          ];
        else logger.error("Socket not found.");
      } else {
        logger.info(
          `Last socket for the session ${sessionId}. Deleting the channel...`
        );
        channels.delete(sessionId);
      }
    });

    // event: receive a message
    socket.on("message", async (message) => {
      // Try to parse the message to a WsClientMessage
      let clientMessage: WsClientMessage;
      try {
        clientMessage = JSON.parse(message.toString());
        const res = checkWsClientMessage(clientMessage);
        if (!res)
          throw new Error(
            "WebSocket message is a valid JSON object but not a WsClientMessage"
          );
      } catch (error) {
        const info = "Incoming message is bad formed: " + error.toString();
        logger.error(`${info}\nmessage: ${message}`);
        socket.send(new WsMessage(info, "user", "error").toString());
        return false;
      }

      // Validate the message and find the instructions
      const handler = getWsClientMessageHandler(
        acceptedMessages,
        clientMessage
      );

      if (typeof handler === "string") {
        logger.error(`${handler}\nmessage: ${message}`);
        socket.send(new WsMessage(handler, "user", "error").toString());
        return false;
      }

      // execute the command
      try {
        handler(clientMessage.data, channels.get(sessionId), socket);
      } catch (error) {
        const info = `Error while executing the '${
          clientMessage.type
        }' command: ${error.toString()}`;
        logger.error(`${info}\nmessage: ${message}`);
        socket.send(new WsMessage(info, "user", "error").toString());
      }
    });

    socket.send(
      new WsMessage("Connection established.", "user", "init").toString()
    );
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
  acceptedMessages: Record<string, Array<MessageData>>,
  clientMessage: WsClientMessage
  // eslint-disable-next-line @typescript-eslint/ban-types
): Function | string {
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
        if (
          !instruction.required?.includes(prop) &&
          !instruction.optional?.includes(prop)
        ) {
          valid = false;
          break;
        }
      }
    }

    // stop when found a valid one
    if (valid) return instruction.handler;
  }
  return `Could not find a proper handler; data is wrong for a '${clientMessage.type}' instruction.`;
}

export { Channel, MessageData, configureWebsocket, getWsClientMessageHandler };
