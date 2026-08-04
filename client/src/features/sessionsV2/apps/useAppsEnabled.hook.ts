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

import { useContext } from "react";

import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";

/**
 * Whether the apps feature is enabled for this deployment.
 *
 * Apps are gated by a deployment-level config value (APPS_ENABLED), delivered
 * via /config.json → AppParams, and driven by the `apps.enabled` value of the
 * renku Helm chart (the same value that sets APPS_ENABLED on the backend
 * data-service). This keeps the UI and backend gate in sync per-deployment,
 * rather than relying on a per-browser localStorage flag.
 *
 * Falls back to the default (disabled) while the config has not loaded yet, so
 * the gate fails closed.
 */
export default function useAppsEnabled(): boolean {
  const { params } = useContext(AppContext);
  return params?.APPS_ENABLED ?? DEFAULT_APP_PARAMS.APPS_ENABLED;
}
