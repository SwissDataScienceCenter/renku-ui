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
 * limitations under the License
 */

import cx from "classnames";
import { Route, Routes } from "react-router-dom-v5-compat";

import ContainerWrap from "../../components/container/ContainerWrap";
import LazyNotFound from "../../not-found/LazyNotFound";
import LazyProjectV2List from "../projectsV2/LazyProjectV2List";
import LazyProjectV2New from "../projectsV2/LazyProjectV2New";
import LazyProjectV2Show from "../projectsV2/LazyProjectV2Show";
import LazySessionStartAlt1Page from "../sessionsV2/LazySessionStartAlt1Page";
import LazySessionStartPage from "../sessionsV2/LazySessionStartPage";
import NavbarV2 from "./NavbarV2";

export default function RootV2() {
  return (
    <div className="w-100">
      <NavbarV2 />

      <div className={cx("d-flex", "flex-grow-1", "h-100")}>
        <Routes>
          <Route
            path="projects/*"
            element={
              // <ContainerWrap>
              <ProjectsV2Routes />
              // </ContainerWrap>
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

function ProjectsV2Routes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ContainerWrap>
            <LazyProjectV2List />
          </ContainerWrap>
        }
      />
      <Route
        path="new"
        element={
          <ContainerWrap>
            <LazyProjectV2New />
          </ContainerWrap>
        }
      />
      <Route
        path=":id"
        element={
          <ContainerWrap>
            <LazyProjectV2Show />
          </ContainerWrap>
        }
      />
      <Route path=":id/sessions/*" element={<ProjectSessionsRoutes />} />
    </Routes>
  );
}

function ProjectSessionsRoutes() {
  return (
    <Routes>
      <Route
        path=":launcherId/start"
        element={
          <ContainerWrap>
            <LazySessionStartPage />
          </ContainerWrap>
        }
      />
      <Route
        path=":launcherId/startAlt1"
        element={
          <ContainerWrap>
            <LazySessionStartAlt1Page />
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
  );
}
