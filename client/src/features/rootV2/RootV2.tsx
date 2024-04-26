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
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom-v5-compat";

import ContainerWrap from "../../components/container/ContainerWrap";
import LazyNotFound from "../../not-found/LazyNotFound";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { setFlag } from "../../utils/feature-flags/featureFlags.slice";

import LazyProjectPageV2Container from "../ProjectPageV2/LazyProjectPageV2Container.tsx";
import { ProjectPageContentType } from "../ProjectPageV2/ProjectPageContainer/ProjectPageContainer";
import LazyGroupV2List from "../projectsV2/LazyGroupList";
import LazyGroupV2New from "../projectsV2/LazyGroupNew";
import LazyGroupV2Show from "../projectsV2/LazyGroupShow";
import LazyProjectV2List from "../projectsV2/LazyProjectV2List";
import LazyProjectV2New from "../projectsV2/LazyProjectV2New";
import LazyProjectV2Show from "../projectsV2/LazyProjectV2Show";
import LazySearchV2 from "../searchV2/LazySearchV2";
import LazySessionStartPage from "../sessionsV2/LazySessionStartPage";
import LazyShowSessionPage from "../sessionsV2/LazyShowSessionPage";
import NavbarV2 from "./NavbarV2";

export default function RootV2() {
  const navigate = useNavigate();

  const { renku10Enabled } = useAppSelector(({ featureFlags }) => featureFlags);
  const dispatch = useAppDispatch();

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender && !renku10Enabled) {
      dispatch(setFlag({ flag: "renku10Enabled", value: true }));
      return;
    }
    if (!renku10Enabled) {
      navigate("/");
    }
  }, [dispatch, isFirstRender, navigate, renku10Enabled]);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return (
    <div className="w-100">
      <NavbarV2 />

      <div className={cx("d-flex", "flex-grow-1", "h-100")}>
        <Routes>
          <Route
            path="groups/*"
            element={
              <ContainerWrap>
                <GroupsV2Routes />
              </ContainerWrap>
            }
          />
          <Route
            path="projects/*"
            element={
              // <ContainerWrap>
              <ProjectsV2Routes />
              // </ContainerWrap>
            }
          />
          <Route
            path="search*"
            element={
              <ContainerWrap>
                <LazySearchV2 />
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

function GroupsV2Routes() {
  return (
    <Routes>
      <Route path="/" element={<LazyGroupV2List />} />
      <Route path="new" element={<LazyGroupV2New />} />
      <Route path=":slug" element={<LazyGroupV2Show />} />
    </Routes>
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
        path=":namespace/:slug"
        element={
          <ContainerWrap fullSize className="container-lg">
            <LazyProjectPageV2Container
              content={ProjectPageContentType.Overview}
            />
          </ContainerWrap>
        }
      />
      <Route
        path=":id"
        element={
          <ContainerWrap fullSize className="container-lg">
            <LazyProjectPageV2Container
              content={ProjectPageContentType.Overview}
            />
          </ContainerWrap>
        }
      />
      <Route
        path=":namespace/:slug/info"
        element={
          <ContainerWrap fullSize className="container-lg">
            <LazyProjectPageV2Container
              content={ProjectPageContentType.ProjectInfo}
            />
          </ContainerWrap>
        }
      />
      <Route
        path=":namespace/:slug/settings"
        element={
          <ContainerWrap fullSize className="container-lg">
            <LazyProjectPageV2Container
              content={ProjectPageContentType.Settings}
            />
          </ContainerWrap>
        }
      />
      <Route
        path="/old/:namespace/:slug"
        element={
          <ContainerWrap>
            <LazyProjectV2Show />
          </ContainerWrap>
        }
      />
      <Route
        path=":namespace/:slug/sessions/*"
        element={<ProjectSessionsRoutes />}
      />
    </Routes>
  );
}

function ProjectSessionsRoutes() {
  return (
    <Routes>
      <Route
        path="show/:session"
        element={
          <ContainerWrap fullSize>
            <LazyShowSessionPage />
          </ContainerWrap>
        }
      />
      <Route
        path=":launcherId/start"
        element={
          <ContainerWrap>
            <LazySessionStartPage />
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
