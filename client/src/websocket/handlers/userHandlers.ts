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

import { WsMessage } from "../WsMessages";


function handleUserInit(data: Record<string, unknown>, webSocket: WebSocket, model: any): boolean {
  if (data?.message && (data.message as string).toLowerCase().includes("connection established")) {
    // send request for getting the UI version
    webSocket.send(JSON.stringify(new WsMessage({ requestServerVersion: true }, "init")));
  }
  return true;
}

function handleUserUiVersion(data: Record<string, unknown>, webSocket: WebSocket, model: any): boolean {
  if (data.start != null) {
    if (data.start)
      console.log("Version available on backend"); // eslint-disable-line
    else
      console.log("Version NOT available on backend"); // eslint-disable-line
  }
  if (data.version !== "get_value_from_model")
    console.log("Version changed"); // eslint-disable-line
  return true;
}

function handleUserError(data: Record<string, unknown>, webSocket: WebSocket, model: any): boolean {
  const message = data.message ?
    "Error on WebSocket server: " + data.message :
    "Unknown error on WebSocket server.";
  model.subModel("webSocket").setObject({ error: true, errorObject: { message } });
  return false;
}

export { handleUserInit, handleUserUiVersion, handleUserError };
