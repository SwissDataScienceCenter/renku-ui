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

import { StateModel, globalSchema } from "../model";
import { getWsServerMessageHandler, retryConnection, setupWebSocket, MessageData } from "./index";
import { WsServerMessage } from "./WsMessages";
import { sleep } from "../utils/helpers/HelperFunctions";


const messageHandlers: Record<string, Record<string, Array<MessageData>>> = {
  "user": {
    "init": [
      {
        required: ["requiredValue"],
        optional: null,
        handler: () => "valid"
      },
      {
        required: ["specialRequiredValue"],
        optional: ["optionalValue"],
        handler: () => "valid"
      },
    ]
  }
};

describe("Test WebSocket functions", () => {
  it("Test getWsServerMessageHandler function", async () => {
    const actions = [
      {
        message: {
          timestamp: new Date(),
          scope: "FAKE_SCOPE",
          type: "user",
          data: { "requiredValue": "1234abcd" }
        } as WsServerMessage,
        result: "Scope 'FAKE_SCOPE' is not supported."
      },
      {
        message: {
          timestamp: new Date(),
          scope: "user",
          type: "FAKE_TYPE",
          data: { "requiredValue": "1234abcd" }
        } as WsServerMessage,
        result: "Type 'FAKE_TYPE' is not supported for the scope 'user'."
      },
      {
        message: {
          timestamp: new Date(),
          scope: "user",
          type: "init",
          data: {}
        } as WsServerMessage,
        result: "Could not find a proper handler; data is wrong for a 'init' instruction."
      },
      {
        message: {
          timestamp: new Date(),
          scope: "user",
          type: "init",
          data: { "requiredValue": "1234abcd", "optionalValue": "1234abcd" }
        } as WsServerMessage,
        result: "Could not find a proper handler; data is wrong for a 'init' instruction.",
      },
      {
        message: {
          timestamp: new Date(),
          scope: "user",
          type: "init",
          data: { "optionalValue": "1234abcd" }
        } as WsServerMessage,
        result: "Could not find a proper handler; data is wrong for a 'init' instruction.",
      },
      {
        message: {
          timestamp: new Date(),
          scope: "user",
          type: "init",
          data: { "requiredValue": "1234abcd" }
        } as WsServerMessage,
        result: () => "valid"
      },
      {
        message: {
          timestamp: new Date(),
          scope: "user",
          type: "init",
          data: { "specialRequiredValue": "1234abcd", "optionalValue": "1234abcd" }
        } as WsServerMessage,
        result: () => "valid"
      }
    ];

    // test results
    for (const action of actions) {
      const result = getWsServerMessageHandler(messageHandlers, action.message);
      typeof result === "string" ?
        expect(result).toBe(action.result) :
        expect(result()).toBe((action.result as Function)()); // eslint-disable-line
    }
  });

  it("Test retryConnection function", async () => {
    const model = new StateModel(globalSchema);

    const reconnectModel = model.subModel("webSocket.reconnect");
    expect(reconnectModel.get("attempts")).toBe(0);
    expect(reconnectModel.get("retrying")).toBe(false);
    retryConnection("fakeUrl", model);
    expect(reconnectModel.get("attempts")).toBe(1);
    expect(reconnectModel.get("retrying")).toBe(true);
  });
});

describe("Test WebSocket server", () => {
  it("Test setupWebSocket", async () => {
    const fullModel = new StateModel(globalSchema);
    const webSocketURL = "wss://localhost:1234";
    const fakeServer = new WS(webSocketURL, { jsonProtocol: true });
    // ? We need to create a client before we invoke `fakeServer.connected` -- limitations of the mock library
    new WebSocket(webSocketURL);
    await fakeServer.connected;

    // the mocked WebSocket server is up and running
    const localModel = fullModel.subModel("webSocket");

    // using a wrong URL shouldn't work
    expect(localModel.get("open")).toBe(false);
    setupWebSocket(webSocketURL.replace("localhost", "fake_host"), fullModel);
    await sleep(0.01); // ? It's ugly, but it's needed when using the fake WebSocket server...
    expect(localModel.get("open")).toBe(false);

    // using the correct URL opens the connection
    setupWebSocket(webSocketURL, fullModel);
    await sleep(0.01);
    expect(localModel.get("open")).toBe(true);

    // sending a valid message works
    expect(localModel.get("lastReceived")).toBe(null);
    const validMessage = {
      timestamp: new Date(),
      scope: "user",
      type: "test",
      data: { "message": "something" }
    } as WsServerMessage;
    fakeServer.send(validMessage);
    await sleep(0.01);
    expect(localModel.get("lastReceived")).not.toBe(null);
    const dateFirstValidMessage = +new Date(localModel.get("lastReceived"));
    expect(dateFirstValidMessage).toBeLessThan(+new Date());
    expect(localModel.get("error")).toBe(false);

    // sending a wrong message generates an error
    expect(localModel.get("error")).toBe(false);
    fakeServer.send("test");
    await sleep(0.01);
    expect(+new Date(localModel.get("lastReceived"))).toBeGreaterThan(dateFirstValidMessage);
    expect(+new Date(localModel.get("lastReceived"))).toBeLessThan(+new Date());
    expect(localModel.get("error")).toBe(true);
  });
});
