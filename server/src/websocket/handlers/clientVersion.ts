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

import config from "../../config";
import { Channel } from "../index";
import { WsMessage } from "../WsMessages";


function handlerClientVersion(data: Record<string, unknown>, channel: Channel, socket: ws): void {
  // save client version
  channel.data.set("clientVersion", data.clientVersion);

  // send ack
  const response = {
    target: "init",
    message: `UI version saved: ${data.clientVersion}`
  };

  socket.send(JSON.stringify(new WsMessage(response, "user", "ack")));
}

function heartbeatClientVersion(channel: Channel): void {
  const clientSha = channel.data.get("clientVersion");
  const currentSha = process.env.RENKU_UI_SHORT_SHA ?
    process.env.RENKU_UI_SHORT_SHA :
    "";
  if (clientSha && currentSha && clientSha !== currentSha) {
    const data = { message: "New version available", new: true, version: currentSha };
    const info = new WsMessage(data, "user", "version");
    channel.sockets.forEach(socket => socket.send(JSON.stringify(info)));
  }
}


// New set of functions: send the version to all the channels and the the client decide the action.

function handlerRequestServerVersion(data: Record<string, unknown>, channel: Channel, socket: ws): void {
  // save the request enabler
  if (data.requestServerVersion) {
    channel.data.set("requestServerVersion", true);

    // check that the server has the required data.
    const currentSha = process.env.RENKU_UI_SHORT_SHA ?
      process.env.RENKU_UI_SHORT_SHA :
      null;
    let data = {};
    if (!currentSha) {
      data = { start: false, message: "The server does not have up-to-date information about the version." };
    }
    else {
      const longIntervalSec = config.websocket.longIntervalSec as number;
      const info = longIntervalSec < 60 ?
        `${longIntervalSec} seconds` :
        `${longIntervalSec / 60} minutes`;
      data = { start: true, message: `The server will send the UI version every ${info}.`, "version": currentSha };
    }

    socket.send(JSON.stringify(new WsMessage(data, "user", "version")));
  }
}

function heartbeatRequestServerVersion(channel: Channel): void {
  if (channel.data.get("requestServerVersion")) {
    const currentSha = process.env.RENKU_UI_SHORT_SHA ?
      process.env.RENKU_UI_SHORT_SHA :
      null;
    if (currentSha) {
      const info = new WsMessage({ "version": currentSha }, "user", "version");
      channel.sockets.forEach(socket => socket.send(JSON.stringify(info)));
    }
  }
}


export { handlerClientVersion, handlerRequestServerVersion, heartbeatClientVersion, heartbeatRequestServerVersion };
