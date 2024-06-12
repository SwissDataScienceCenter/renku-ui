/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";

import { Loader } from "../../../components/Loader";
import LazyNotFound from "../../../not-found/LazyNotFound";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import UserNotFound from "../../projectsV2/notFound/UserNotFound";
import { useGetUserQuery } from "../../user/dataServicesUser.api";

export default function UserRedirect() {
  const navigate = useNavigate();

  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );

  const {
    data: user,
    isLoading,
    error,
  } = useGetUserQuery(isUserLoggedIn ? undefined : skipToken);

  useEffect(() => {
    if (user?.username) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.users.show, {
          username: user.username,
        }),
        { replace: true }
      );
    }
  }, [navigate, user?.username]);

  if (!isUserLoggedIn) {
    return <LazyNotFound />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  return <UserNotFound error={error} />;
}
