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

import {
  RENKU_QUERY_PARAMS,
  RENKU_USER_SIGNED_IN_COOKIE,
} from "./authentication.constants";

export function notifyLogout(): void {
  localStorage.setItem(RENKU_QUERY_PARAMS.logout, Date.now().toString());
  // Manual logout: remove the `renku_user_signed_in` cookie
  if (window.cookieStore) {
    window.cookieStore.delete(RENKU_USER_SIGNED_IN_COOKIE);
  }
}
