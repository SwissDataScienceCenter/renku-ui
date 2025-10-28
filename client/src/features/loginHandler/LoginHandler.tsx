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

import { useEffect, useState } from "react";
import { usersApi } from "../usersV2/api/users.api";

const ONE_MINUTE = 60 * 1_000; // milliseconds

export default function LoginHandler() {
  const { currentData: user, error } = usersApi.endpoints.getUser.useQuery(
    undefined,
    {
      pollingInterval: ONE_MINUTE,
      skipPollingIfUnfocused: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const [{ isLoggedIn }, setState] = useState<LoginState>({
    isLoggedIn: false,
  });

  useEffect(() => {
    if (error != null) {
      setState({ isLoggedIn: false });
    } else if (user != null) {
      setState({ isLoggedIn: user.isLoggedIn });
    }
  }, [error, user]);

  useEffect(() => {
    if (isLoggedIn && (error != null || (user != null && !user.isLoggedIn))) {
      window.location.reload();
    }
  }, [error, isLoggedIn, user]);

  return null;
}

interface LoginState {
  isLoggedIn: boolean;
}
