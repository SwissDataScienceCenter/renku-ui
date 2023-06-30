/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { useContext } from "react";
import ContainerWrap from "../../../components/container/ContainerWrap";
import AppContext from "../../../utils/context/appContext";
import { RootStateOrAny, useSelector } from "react-redux";
import { User } from "../../../model/RenkuModels";
import LoginAlert from "../../../components/loginAlert/LoginAlert";

export default function AnonymousSessionsList() {
  const { params } = useContext(AppContext);
  const anonymousSessionsEnabled = !!(
    params as { ANONYMOUS_SESSIONS?: boolean }
  ).ANONYMOUS_SESSIONS;

  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  if (!logged && !anonymousSessionsEnabled) {
    return (
      <ContainerWrap>
        <AnonymousSessionsDisabledNotice />
      </ContainerWrap>
    );
  }

  return <ContainerWrap>SESSIONS LIST</ContainerWrap>;
}

function AnonymousSessionsDisabledNotice() {
  const textIntro =
    "This Renkulab deployment does not allow unauthenticated users to start sessions.";
  const textPost = "to use sessions.";
  return (
    <LoginAlert logged={false} textIntro={textIntro} textPost={textPost} />
  );
}
