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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "~/store/store";
import {
  SessionStopIntent,
  SessionStopIntentState,
  SessionV2,
} from "./sessionsV2.types";

const initialState: SessionStopIntentState = {
  intents: {},
};

const sessionStopIntentSlice = createSlice({
  name: "sessionStopIntent",
  initialState,
  reducers: {
    setSessionStopIntent: (
      state,
      action: PayloadAction<{ sessionId: string; intent: SessionStopIntent }>,
    ) => {
      state.intents[action.payload.sessionId] = action.payload.intent;
    },
    clearSessionStopIntent: (
      state,
      action: PayloadAction<{ sessionId: string }>,
    ) => {
      delete state.intents[action.payload.sessionId];
    },
    syncWithSessions: (state, action: PayloadAction<SessionV2[]>) => {
      for (const sessionId of Object.keys(state.intents)) {
        const session = action.payload.find(({ name }) => name === sessionId);
        if (!session || session.status.state !== "stopping") {
          delete state.intents[sessionId];
        }
      }
    },
    syncWithSession: (state, action: PayloadAction<SessionV2>) => {
      const sessionId = action.payload.name;
      if (
        state.intents[sessionId] &&
        action.payload.status.state !== "stopping"
      ) {
        delete state.intents[sessionId];
      }
    },
    reset: () => initialState,
  },
});

export const selectSessionStopIntent = (
  state: RootState,
  sessionId: string,
): SessionStopIntent | null =>
  state.sessionStopIntent.intents[sessionId] ?? null;

export default sessionStopIntentSlice;
