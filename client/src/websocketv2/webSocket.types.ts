/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { DateTime } from "luxon";

import type { createStore } from "~/utils/helpers/EnhancedState";

export interface WebSocketState {
  open: boolean;
  error?: WebSocketError | undefined;
  lastPing?: DateTime | undefined;
  lastReceived?: DateTime | undefined;
  reconnect: {
    retrying: boolean;
    attempts: number;
    lastTime?: DateTime | undefined;
  };
}

export interface WebSocketError {
  error?: Error | undefined;
  message: string;
}

export type StoreType = ReturnType<typeof createStore>;

// const webSocketSchema = new Schema({
//   open: { [Prop.INITIAL]: false },
//   error: { [Prop.INITIAL]: false },
//   errorObject: { [Prop.INITIAL]: {} },
//   lastPing: { [Prop.INITIAL]: null },
//   lastReceived: { [Prop.INITIAL]: null },
//   reconnect: {
//     [Prop.SCHEMA]: new Schema({
//       retrying: { [Prop.INITIAL]: false },
//       attempts: { [Prop.INITIAL]: 0 },
//       lastTime: { [Prop.INITIAL]: null },
//     }),
//   },
// });
