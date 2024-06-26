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
import { RELATIVE_ROUTES } from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { setFlag } from "../../utils/feature-flags/featureFlags.slice";

import LazyProjectPageV2Show from "../ProjectPageV2/LazyProjectPageV2Show";
import LazyProjectInformation from "../ProjectPageV2/ProjectPageContent/LazyProjectInformation";
import LazyProjectPageOverview from "../ProjectPageV2/ProjectPageContent/LazyProjectPageOverview";
import LazyProjectPageSettings from "../ProjectPageV2/ProjectPageContent/LazyProjectPageSettings";
import LazyConnectedServicesPage from "../connectedServices/LazyConnectedServicesPage";
import LazyDashboardV2 from "../dashboardV2/LazyDashboardV2";
import LazyHelpV2 from "../dashboardV2/LazyHelpV2";
import LazyGroupV2Show from "../groupsV2/LazyGroupV2Show";
import LazyGroupV2List from "../projectsV2/LazyGroupList";
import LazyGroupV2New from "../projectsV2/LazyGroupNew";
import LazyProjectV2List from "../projectsV2/LazyProjectV2List";
import LazyProjectV2New from "../projectsV2/LazyProjectV2New";
import LazyProjectV2ShowByProjectId from "../projectsV2/LazyProjectV2ShowByProjectId";
import LazySearchV2 from "../searchV2/LazySearchV2";
import LazySessionStartPage from "../sessionsV2/LazySessionStartPage";
import LazyShowSessionPage from "../sessionsV2/LazyShowSessionPage";
import LazyUserRedirect from "../usersV2/LazyUserRedirect";
import LazyUserShow from "../usersV2/LazyUserShow";
import NavbarV2 from "./NavbarV2";
import LazyGroupV2Settings from "../groupsV2/LazyGroupV2Settings";

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
            index
            element={
              <ContainerWrap>
                <LazyDashboardV2 />
              </ContainerWrap>
            }
          />
          <Route
            path={RELATIVE_ROUTES.v2.user}
            element={<LazyUserRedirect />}
          />
          <Route
            path={RELATIVE_ROUTES.v2.users.show}
            element={<LazyUserShow />}
          />
          <Route
            path={RELATIVE_ROUTES.v2.groups.root}
            element={<GroupsV2Routes />}
          />
          <Route
            path={RELATIVE_ROUTES.v2.projects.root}
            element={<ProjectsV2Routes />}
          />
          <Route
            path="help/*"
            element={
              <ContainerWrap>
                <HelpV2Routes />
              </ContainerWrap>
            }
          />
          <Route
            path="search/*"
            element={
              <ContainerWrap>
                <LazySearchV2 />
              </ContainerWrap>
            }
          />
          <Route
            path="connected-services"
            element={
              <ContainerWrap>
                <LazyConnectedServicesPage />
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
      <Route index element={<LazyGroupV2List />} />
      <Route
        path={RELATIVE_ROUTES.v2.groups.new}
        element={<LazyGroupV2New />}
      />
      <Route
        path={RELATIVE_ROUTES.v2.groups.show.root}
      >
        <Route index element={<LazyGroupV2Show />} />
        <Route
          path={RELATIVE_ROUTES.v2.groups.show.settings}
          element={<LazyGroupV2Settings />}
        />
      </Route>
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

function HelpV2Routes() {
  return (
    <Routes>
      <Route path="/*" element={<LazyHelpV2 />} />
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
        path={RELATIVE_ROUTES.v2.projects.new}
        element={
          <ContainerWrap>
            <LazyProjectV2New />
          </ContainerWrap>
        }
      />
      <Route path={RELATIVE_ROUTES.v2.projects.show.root}>
        <Route element={<LazyProjectPageV2Show />}>
          <Route index element={<LazyProjectPageOverview />} />
          <Route
            path={RELATIVE_ROUTES.v2.projects.show.info}
            element={<LazyProjectInformation />}
          />
          <Route
            path={RELATIVE_ROUTES.v2.projects.show.settings}
            element={<LazyProjectPageSettings />}
          />
        </Route>
        <Route
          path={RELATIVE_ROUTES.v2.projects.show.sessions.root}
          element={<ProjectSessionsRoutes />}
        />
        <Route
          path="*"
          element={
            <ContainerWrap fullSize>
              <LazyNotFound />
            </ContainerWrap>
          }
        />
      </Route>
      <Route
        path={RELATIVE_ROUTES.v2.projects.showById}
        element={<LazyProjectV2ShowByProjectId />}
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
