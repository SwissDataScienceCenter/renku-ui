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

import { configureStore } from "@reduxjs/toolkit";
import { parseCookie } from "cookie";
import { createContext, type MiddlewareFunction } from "react-router";

import { usersApi } from "~/features/usersV2/api/users.api";
import cookieSlice from "./cookie.slice.server";

// Server-side redux utilities

const RENKU_SESSION_COOKIE = "_renku_session";

/** Creates a redux store which can be used server-side. */
function makeStore() {
  return configureStore({
    reducer: {
      // Slices
      [cookieSlice.reducerPath]: cookieSlice.reducer,
      // APIs
      [usersApi.reducerPath]: usersApi.reducer,
    },
    middleware: (gDM) => gDM().concat(usersApi.middleware),
  });
}

export type ServerStoreType = ReturnType<typeof makeStore>;

export type ServerRootState = ReturnType<ServerStoreType["getState"]>;

export type ServerAppDispatch = ServerStoreType["dispatch"];

export const storeContext = createContext<ServerStoreType | undefined>(
  undefined
);

export const storeMiddleware: MiddlewareFunction = function ({
  context,
  request,
}) {
  const store = makeStore();
  context.set(storeContext, store);

  const cookie = request.headers.get("cookie");
  if (cookie) {
    const cookies = parseCookie(cookie);
    const renkuSessionCookie = cookies[RENKU_SESSION_COOKIE];
    if (renkuSessionCookie) {
      store.dispatch(cookieSlice.actions.setRenkuSessionCookie(cookie));
    }
  }
};
