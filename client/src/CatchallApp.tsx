/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

import { ReactNode } from "react";
import { Route, Routes } from "react-router";

import LazyAdminPage from "./features/admin/LazyAdminPage";
import LazyAnonymousHome from "./features/landing/LazyAnonymousHome";
import LegacyDatasetAddToProject from "./features/legacy/LegacyDatasetAddToProject";
import LegacyDatasets from "./features/legacy/LegacyDatasets";
import LegacyProjectView from "./features/legacy/LegacyProjectView";
import LegacyRoot from "./features/legacy/LegacyRoot";
import LegacyShowDataset from "./features/legacy/LegacyShowDataset";
import LazyRootV2 from "./features/rootV2/LazyRootV2";
import { useGetUserQueryState } from "./features/usersV2/api/users.api";

import "./App.css";

interface ContainerWrapProps {
  children?: ReactNode;
  fullSize?: boolean;
}

export const ContainerWrap = ({
  children,
  fullSize = false,
}: ContainerWrapProps) => {
  const classContainer = !fullSize
    ? "container-xxl py-4 mt-2 renku-container"
    : "w-100";
  return <div className={classContainer}>{children}</div>;
};

export default function CatchallApp() {
  const { data: user } = useGetUserQueryState();
  return (
    <Routes>
      <Route
        index
        element={
          user?.isLoggedIn ? (
            <LazyRootV2 />
          ) : (
            <div className="w-100">
              <LazyAnonymousHome />
            </div>
          )
        }
      />
      <Route path="/projects/*" element={<LegacyProjectView />} />
      <Route
        path="/datasets/:identifier/add"
        element={<LegacyDatasetAddToProject />}
      />
      <Route path="/datasets/:identifier" element={<LegacyShowDataset />} />
      <Route path="/datasets" element={<LegacyDatasets />} />
      <Route path="/v1/*" element={<LegacyRoot />} />
      {user?.isLoggedIn && user.is_admin && (
        <Route
          path="/admin"
          element={
            <ContainerWrap>
              <LazyAdminPage />
            </ContainerWrap>
          }
        />
      )}
      <Route path="*" element={<LazyRootV2 />} />
    </Routes>
  );
}
