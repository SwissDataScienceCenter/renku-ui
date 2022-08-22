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

import { MessageData, getWsClientMessageHandler } from "../../src/websocket";
import { WsClientMessage } from "../../src/websocket/WsMessages";


const acceptedMessages: Record<string, Array<MessageData>> = {
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
};

describe("Test Websocket functions", () => {
  it("Test getWsClientMessageHandler", async () => {
    const actions = [
      {
        message: {
          timestamp: new Date(),
          type: "FAKE_TYPE",
          data: { "requiredValue": "1234abcd" }
        } as WsClientMessage,
        result: "Instruction of type 'FAKE_TYPE' is not supported."
      },
      {
        message: {
          timestamp: new Date(),
          type: "init",
          data: {}
        } as WsClientMessage,
        result: "Could not find a proper handler; data is wrong for a 'init' instruction."
      },
      {
        message: {
          timestamp: new Date(),
          type: "init",
          data: { "requiredValue": "1234abcd", "optionalValue": "1234abcd" }
        } as WsClientMessage,
        result: "Could not find a proper handler; data is wrong for a 'init' instruction.",
      },
      {
        message: {
          timestamp: new Date(),
          type: "init",
          data: { "optionalValue": "1234abcd" }
        } as WsClientMessage,
        result: "Could not find a proper handler; data is wrong for a 'init' instruction.",
      },
      {
        message: {
          timestamp: new Date(),
          type: "init",
          data: { "requiredValue": "1234abcd" }
        } as WsClientMessage,
        result: () => "valid"
      },
      {
        message: {
          timestamp: new Date(),
          type: "init",
          data: { "specialRequiredValue": "1234abcd", "optionalValue": "1234abcd" }
        } as WsClientMessage,
        result: () => "valid"
      }
    ];

    // test results
    for (const action of actions) {
      const result = getWsClientMessageHandler(acceptedMessages, action.message);
      typeof result === "string" ?
        expect(result).toBe(action.result) :
        expect(result()).toBe((action.result as Function)()); // eslint-disable-line
    }
  });
});
