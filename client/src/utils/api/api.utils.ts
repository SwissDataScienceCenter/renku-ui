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

import type { FetchBaseQueryArgs } from "@reduxjs/toolkit/query/react";
import { serverOnly$ } from "vite-env-only/macros";

import cookieSlice from "~/store/cookie.slice.server";
import type { ServerRootState } from "~/store/store.utils.server";

/** The `prepareHeaders` method for RTK Query; on the server-side, it sets up the
 * cookie header to perform authenticated requests.
 */
export const prepareHeaders: FetchBaseQueryArgs["prepareHeaders"] = serverOnly$(
  function (headers, { getState }) {
    // TODO: Setup Sentry trace headers (propagate from incoming query if needed)
    const { renkuSessionCookie } = cookieSlice.selectSlice(
      getState() as ServerRootState
    );
    if (renkuSessionCookie) {
      headers.set("cookie", renkuSessionCookie);
    }
  }
);
