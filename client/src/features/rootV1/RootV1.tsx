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
 * limitations under the License
 */

import cx from "classnames";
import { Route, Routes } from "react-router";

import ContainerWrap from "../../components/container/ContainerWrap";
import AnonymousNavBar from "../../components/navbar/AnonymousNavBar";
import LoggedInNavBar from "../../components/navbar/LoggedInNavBar";
import LazyNotFound from "../../not-found/LazyNotFound";
import LazyNotificationsPage from "../../notifications/LazyNotificationsPage";
import { RELATIVE_ROUTES } from "../../routing/routes.constants";
import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";
import ProjectRootV1 from "./ProjectRootV1";

export default function RootV1() {
  const user = useLegacySelector((state) => state.stateModel.user);
  return (
    <div className="w-100">
      {!user.logged ? <AnonymousNavBar /> : <LoggedInNavBar />}
      <div className={cx("d-flex", "flex-grow-1")}>
        <Routes>
          <Route
            path={RELATIVE_ROUTES.v1.notifications}
            element={
              <ContainerWrap>
                <LazyNotificationsPage />
              </ContainerWrap>
            }
          />
          <Route
            path={RELATIVE_ROUTES.v1.projects.root}
            element={
              <ContainerWrap>
                <ProjectRootV1 />
              </ContainerWrap>
            }
          />
          <Route
            path="*"
            element={
              <ContainerWrap fullSize>
                <LazyNotFound />
              </ContainerWrap>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
