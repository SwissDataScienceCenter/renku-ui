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

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DateTime } from "luxon";

import type { WebSocketError, WebSocketState } from "./webSocket.types";

const initialState: WebSocketState = {
  open: false,
  reconnect: {
    retrying: false,
    attempts: 0,
  },
  uiVersion: {
    webSocket: false,
  },
};

const webSocketSlice = createSlice({
  name: "webSocket",
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
      state.error = undefined;
      state.lastReceived = undefined;
    },
    setLastPing: (state, action: PayloadAction<DateTime<true>>) => {
      state.lastPing = action.payload;
    },
    setError: (state, action: PayloadAction<WebSocketError>) => {
      state.error = action.payload;
    },
    unsetError: (state) => {
      state.error = undefined;
    },
    setLastReceived: (state, action: PayloadAction<DateTime<true>>) => {
      state.lastReceived = action.payload;
    },
    setUiVersion: (
      state,
      action: PayloadAction<{ version: string; lastReceived: DateTime<true> }>
    ) => {
      state.uiVersion.lastValue = action.payload.version;
      state.uiVersion.lastReceived = action.payload.lastReceived;
    },
    setUiVersionWebSocket: (state, action: PayloadAction<boolean>) => {
      state.uiVersion.webSocket = action.payload;
    },
    setReconnect: (
      state,
      action: PayloadAction<WebSocketState["reconnect"]>
    ) => {
      state.reconnect.attempts = action.payload.attempts;
      state.reconnect.retrying = action.payload.retrying;
      state.reconnect.lastTime = action.payload.lastTime;
    },
    reset: () => initialState,
  },
});

export const {
  setOpen,
  setLastPing,
  setError,
  unsetError,
  setLastReceived,
  setUiVersion,
  setUiVersionWebSocket,
  setReconnect,
  reset,
} = webSocketSlice.actions;
export default webSocketSlice;
