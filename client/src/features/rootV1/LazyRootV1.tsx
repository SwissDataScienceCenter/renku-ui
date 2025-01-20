/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import { Suspense, lazy } from "react";

import PageLoader from "../../components/PageLoader";
import { StateModel } from "../../model";
import { NotificationsManager } from "../../notifications/notifications.types.ts";
import { AppParams } from "../../utils/context/appParams.types.ts";

const RootV1 = lazy(() => import("./RootV1"));

export default function LazyRootV1(props: {
  model: StateModel;
  notifications: NotificationsManager;
  params: AppParams;
  user: {
    logged: boolean;
  };
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <RootV1 {...props} />
    </Suspense>
  );
}
