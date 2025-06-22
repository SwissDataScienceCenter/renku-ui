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

import { Route, Routes } from "react-router";
import ContainerWrap from "../../components/container/ContainerWrap";
import LazyNotFound from "../../not-found/LazyNotFound";
import LazyProjectList from "../../project/list/LazyProjectList";
import { RELATIVE_ROUTES } from "../../routing/routes.constants";
import SunsetBanner from "../projectsV2/shared/SunsetV1Banner";

export default function RootV1() {
  return (
    <Routes>
      <Route
        index
        element={
          <ContainerWrap>
            <LazyProjectList />
          </ContainerWrap>
        }
      />
      <Route
        path={RELATIVE_ROUTES.v1.projects.starred}
        element={
          <ContainerWrap>
            <LazyProjectList />
          </ContainerWrap>
        }
      />
      <Route
        path={RELATIVE_ROUTES.v1.projects.all}
        element={
          <ContainerWrap>
            <LazyProjectList />
          </ContainerWrap>
        }
      />
      <Route
        path={RELATIVE_ROUTES.v1.projects.new}
        element={
          <ContainerWrap>
            <SunsetBanner />
          </ContainerWrap>
        }
      />
      <Route
        path="*"
        element={
          <ContainerWrap>
            <LazyNotFound />
          </ContainerWrap>
        }
      />
    </Routes>
  );
}
