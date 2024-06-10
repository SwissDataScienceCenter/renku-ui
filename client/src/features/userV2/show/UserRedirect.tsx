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

import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import LazyNotFound from "../../../not-found/LazyNotFound";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import UserNotFound from "../../projectsV2/notFound/UserNotFound";
import { useGetUserQuery } from "../../user/dataServicesUser.api";

export default function UserRedirect() {
  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );

  const {
    data: user,
    isLoading,
    error,
  } = useGetUserQuery(isUserLoggedIn ? undefined : skipToken);

  if (!isUserLoggedIn) {
    return <LazyNotFound />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  if (user) {
    return (
      <ContainerWrap>
        <p>
          TODO: Handle redirect for {user.first_name} {user.last_name}.
        </p>
      </ContainerWrap>
    );
  }

  return <UserNotFound error={error} />;
}
