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

import { SessionStopIntent } from "./sessionStopIntent.types";
import { SessionStatusState } from "./sessionsV2.types";

const JOB_STOPPING_TITLE = {
  cancel: {
    card: "Canceling my job...",
    list: "Canceling job...",
  },
  dismiss: {
    card: "Dismissing my job...",
    list: "Dismissing job...",
  },
  default: {
    card: "Stopping my job...",
    list: "Stopping job...",
  },
} as const;

const JOB_STOPPING_BUTTON_LABEL = {
  cancel: "Canceling job",
  dismiss: "Dismissing job",
  default: "Stopping job",
} as const;

export function deriveSessionStopIntent(
  state: SessionStatusState,
): SessionStopIntent {
  return state === "starting" || state === "running" ? "cancel" : "dismiss";
}

export function getJobStoppingTitle({
  variant,
  stopIntent,
}: {
  variant: "card" | "list";
  stopIntent?: SessionStopIntent | null;
}): string {
  const key = stopIntent ?? "default";
  return JOB_STOPPING_TITLE[key][variant];
}

export function getJobStoppingButtonLabel(
  stopIntent?: SessionStopIntent | null,
): string {
  const key = stopIntent ?? "default";
  return JOB_STOPPING_BUTTON_LABEL[key];
}
