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
 * limitations under the License.
 */

import { useGetUserQuery } from "../usersV2/api/users.api";

const ONE_MINUTE = 60 * 1_000; // milliseconds

export default function LoginHandler() {
  const { currentData: user, error } = useGetUserQuery(undefined, {
    pollingInterval: ONE_MINUTE,
    skipPollingIfUnfocused: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
  });

  if (error != null) {
    return null;
  }

  if (user != null) {
    return <div>{JSON.stringify(user, null, 2)}</div>;
  }

  return null;
}
