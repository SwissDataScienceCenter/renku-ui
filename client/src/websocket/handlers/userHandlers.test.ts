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

import WS from "jest-websocket-mock";

import { StateModel, globalSchema } from "../../model";
import { sleep } from "../../utils/helpers/HelperFunctions";
import { handleUserInit, handleUserUiVersion, handleUserError } from "./userHandlers";


describe("Test userHandlers functions", () => {
  const webSocketURL = "wss://localhost:1234";
  let fakeServer: WS;
  let localWebSocket: WebSocket;
  let fullModel: any;

  // Setup and clean both the model and the WebSocket fake server
  beforeEach(async () => {
    fullModel = new StateModel(globalSchema);
    fakeServer = new WS(webSocketURL);
    localWebSocket = new WebSocket(webSocketURL);
    await fakeServer.connected;
  });
  afterEach(() => {
    localWebSocket.close();
    WS.clean();
  });

  it("Test handleUserInit function", async () => {
    // check no messages are sent if the connection has not been properly established
    expect(fakeServer).toHaveReceivedMessages([]);
    handleUserInit({}, localWebSocket, fullModel);
    await sleep(0.01);
    expect(fakeServer).toHaveReceivedMessages([]);
    handleUserInit({ message: "wrong" }, localWebSocket, fullModel);
    await sleep(0.01);
    expect(fakeServer).toHaveReceivedMessages([]);

    // expect reaction to the setup message
    handleUserInit({ message: "connection established" }, localWebSocket, fullModel);
    await sleep(0.01);
    expect(fakeServer.messages.length).toBe(1);
    expect(fakeServer.messages[0]).toContain("requestServerVersion");
  });

  it("Test handleUserUiVersion function", async () => {
    // ? We don't need `sleep` here since we don't send messages to the fake WebSocket server
    const localModel = fullModel.subModel("environment.uiVersion");
    expect(localModel.get("webSocket")).toBeNull();
    handleUserUiVersion({}, localWebSocket, fullModel);
    expect(localModel.get("webSocket")).toBeNull();

    handleUserUiVersion({ start: true }, localWebSocket, fullModel);
    expect(localModel.get("webSocket")).toBeTruthy();

    let version = "1234abcd";
    expect(localModel.get("lastValue")).toBeNull();
    handleUserUiVersion({ version }, localWebSocket, fullModel);
    expect(localModel.get("lastValue")).toBe(version);
    expect(localModel.get("webSocket")).toBeTruthy(); // this should not be reset by following messages
    const lastReceived = +new Date(localModel.get("lastReceived"));
    await sleep(0.01); // this is to be sure the next date will be different.

    handleUserUiVersion({ version: version + "1a" }, localWebSocket, fullModel);
    expect(localModel.get("lastValue")).not.toBe(version);
    expect(localModel.get("lastValue")).toBe(version + "1a");
    expect(+new Date(localModel.get("lastReceived"))).toBeGreaterThan(lastReceived);
  });

  it("Test handleUserError function", async () => {
    const localModel = fullModel.subModel("webSocket");
    expect(localModel.get("error")).toBe(false);
    const retValue = handleUserError({}, localWebSocket, fullModel);
    expect(retValue).toBe(false);
    expect(localModel.get("error")).toBe(true);
  });
});
