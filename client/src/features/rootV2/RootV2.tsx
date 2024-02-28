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
import NavbarV2 from "./NavbarV2";
import { useContext, useEffect } from "react";
import { LocalStorageFeatureFlagsContext } from "../../utils/feature-flags/LocalStorageFeatureFlags.context";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import { setFlag } from "../../utils/feature-flags/featureFlags.slice";

export default function RootV2() {
  const { renku10Enabled } = useAppSelector(({ featureFlags }) => featureFlags);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (!renku10Enabled) {
  //     setFlag("renku10Enabled", true);
  //   }
  // }, [renku10Enabled, setFlag]);

  useEffect(() => {
    if (!renku10Enabled) {
      dispatch(setFlag({ flag: "renku10Enabled", value: true }));
    }
  }, [dispatch, renku10Enabled]);

  return (
    <div className="w-100">
      <NavbarV2 />

      <div className={cx("d-flex", "flex-grow-1", "h-100")}>
        <Routes>
          <Route
            path="projects/*"
            element={
              <ContainerWrap>
                <ProjectsV2Routes />
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

function ProjectsV2Routes() {
  return (
    <Routes>
      <Route path="/" element={<LazyProjectV2List />} />
      <Route path="new" element={<LazyProjectV2New />} />
      <Route path=":id" element={<LazyProjectV2Show />} />
    </Routes>
  );
}
