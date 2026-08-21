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

// The container Knative runs the user's image in. The other containers on an
// app pod (queue-proxy, and any sidecar) are platform plumbing.
const APP_USER_CONTAINER = "user-container";

/**
 * Whether a log key belongs to the container running the user's image, so it can
 * be shown first. App log keys are "<pod name>/<container name>", and the pod
 * name is not knowable up front, so this matches on the container part only.
 */
export function isAppUserContainerLog(logKey: string): boolean {
  return logKey.endsWith(`/${APP_USER_CONTAINER}`);
}

/**
 * Turns a "<pod name>/<container name>" log key into a tab label. An app can be
 * backed by several pods at once, so the pod's trailing identifier is kept to
 * keep the tabs distinguishable; the rest of the pod name only repeats the app
 * name and Knative's naming scheme.
 */
export function formatAppLogTabLabel(logKey: string): string {
  const separatorIdx = logKey.lastIndexOf("/");
  const pod = logKey.slice(0, separatorIdx);
  const container = logKey.slice(separatorIdx + 1);
  if (separatorIdx < 0 || !pod || !container) {
    return logKey;
  }
  const podSuffix = pod.split("-").filter(Boolean).at(-1);
  return podSuffix ? `${container} (${podSuffix})` : container;
}
