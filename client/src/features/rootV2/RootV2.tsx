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
import {
  Route,
  Routes,
  generatePath,
  useNavigate,
} from "react-router-dom-v5-compat";

import ContainerWrap from "../../components/container/ContainerWrap";
import LazyNotFound from "../../not-found/LazyNotFound";
import {
  ABSOLUTE_ROUTES,
  RELATIVE_ROUTES,
} from "../../routing/routes.constants";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { setFlag } from "../../utils/feature-flags/featureFlags.slice";
import LazyConnectedServicesPage from "../connectedServices/LazyConnectedServicesPage";
import LazyDashboardV2 from "../dashboardV2/LazyDashboardV2";
import LazyHelpV2 from "../dashboardV2/LazyHelpV2";
import LazyGroupContainer from "../groupsV2/LazyGroupContainer";
import LazyGroupV2Overview from "../groupsV2/LazyGroupV2Overview";
import LazyGroupV2Settings from "../groupsV2/LazyGroupV2Settings";
import GroupNew from "../groupsV2/new/GroupNew";
import LazyProjectPageV2Show from "../ProjectPageV2/LazyProjectPageV2Show";
import LazyProjectPageOverview from "../ProjectPageV2/ProjectPageContent/LazyProjectPageOverview";
import LazyProjectPageSettings from "../ProjectPageV2/ProjectPageContent/LazyProjectPageSettings";
import LazyProjectV2ShowByProjectId from "../projectsV2/LazyProjectV2ShowByProjectId";
import ProjectV2New from "../projectsV2/new/ProjectV2New";
import LazySearchV2 from "../searchV2/LazySearchV2";
import LazySecretsV2 from "../secretsV2/LazySecretsV2";
import LazySessionStartPage from "../sessionsV2/LazySessionStartPage";
import LazyShowSessionPage from "../sessionsV2/LazyShowSessionPage";
import LazyUserRedirect from "../usersV2/LazyUserRedirect";
import LazyUserShow from "../usersV2/LazyUserShow";
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
      <ProjectV2New />
      <GroupNew />

      <div className={cx("d-flex", "flex-grow-1")}>
        <Routes>
          <Route
            index
            element={
              <ContainerWrap fullSize={true}>
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
            path={RELATIVE_ROUTES.v2.help.root}
            element={
              <ContainerWrap>
                <HelpV2Routes />
              </ContainerWrap>
            }
          />
          <Route
            path={RELATIVE_ROUTES.v2.search}
            element={
              <ContainerWrap>
                <LazySearchV2 />
              </ContainerWrap>
            }
          />
          <Route
            path={RELATIVE_ROUTES.v2.connectedServices}
            element={
              <ContainerWrap>
                <LazyConnectedServicesPage />
              </ContainerWrap>
            }
          />
          <Route
            path={RELATIVE_ROUTES.v2.secrets}
            element={
              <ContainerWrap>
                <LazySecretsV2 />
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
      <Route index element={<RedirectToSearch entityType="group" />} />
      <Route path={RELATIVE_ROUTES.v2.groups.show.root}>
        <Route element={<LazyGroupContainer />}>
          <Route index element={<LazyGroupV2Overview />} />
          <Route
            path={RELATIVE_ROUTES.v2.groups.show.settings}
            element={<LazyGroupV2Settings />}
          />
        </Route>
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

function RedirectToSearch({ entityType }: { entityType: string }) {
  const navigate = useNavigate();
  navigate(
    {
      pathname: generatePath(ABSOLUTE_ROUTES.v2.search),
      search: `q=type:${entityType}`,
    },
    { replace: true }
  );

  return null;
}

function ProjectsV2Routes() {
  return (
    <Routes>
      <Route index element={<RedirectToSearch entityType="project" />} />
      <Route path={RELATIVE_ROUTES.v2.projects.show.root}>
        <Route element={<LazyProjectPageV2Show />}>
          <Route index element={<LazyProjectPageOverview />} />
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
