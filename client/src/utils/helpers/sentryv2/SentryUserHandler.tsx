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

import * as Sentry from "@sentry/react-router";
import { useEffect } from "react";

import { useGetUserQuery } from "~/features/usersV2/api/users.api";

export default function SentryUserHandler() {
  const { data: user } = useGetUserQuery();

  useEffect(() => {
    if (user) {
      if (user.isLoggedIn) {
        Sentry.setUser({
          logged: true,
          id: user.id,
          username: user.username,
          email: user.email,
        });
        Sentry.setTag("user.username", user.username);
        console.log("set user for sentry", user);
      } else {
        Sentry.setUser({
          logged: false,
          id: 0,
          username: "0",
        });
        Sentry.setTag("user.username", "0");
      }
    }
  }, [user]);

  return null;
}
