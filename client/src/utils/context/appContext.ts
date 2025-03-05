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

import React from "react";
import type { NotificationsManager } from "../../notifications/notifications.types";
import type { CoreApiVersionedUrlConfig } from "../helpers/url";
import { createCoreApiVersionedUrlConfig } from "../helpers/url";
import type { AppParams } from "./appParams.types";

export interface AppContextType {
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  coreApiVersionedUrlConfig: CoreApiVersionedUrlConfig;
  location: unknown;
  model: unknown;
  notifications: NotificationsManager | undefined;
  params: AppParams | undefined;
  webSocket: WebSocket | undefined;
}

const AppContext = React.createContext<AppContextType>({
  client: undefined,
  coreApiVersionedUrlConfig: createCoreApiVersionedUrlConfig({
    coreApiVersion: "/",
  }),
  location: undefined,
  model: undefined,
  notifications: undefined,
  params: undefined,
  webSocket: undefined,
});

export default AppContext;
