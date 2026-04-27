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

import { Route, Routes } from "react-router";

import LegacyDatasetAddToProject from "./features/legacy/LegacyDatasetAddToProject";
import LegacyDatasets from "./features/legacy/LegacyDatasets";
import LegacyProjectView from "./features/legacy/LegacyProjectView";
import LegacyRoot from "./features/legacy/LegacyRoot";
import LegacyShowDataset from "./features/legacy/LegacyShowDataset";
import LazyRootV2 from "./features/rootV2/LazyRootV2";

/**
 * "Catch all" component
 *
 * Renders pages with client-side routing.
 */
export default function CatchallApp() {
  return (
    <Routes>
      <Route path="/projects/*" element={<LegacyProjectView />} />
      <Route
        path="/datasets/:identifier/add"
        element={<LegacyDatasetAddToProject />}
      />
      <Route path="/datasets/:identifier" element={<LegacyShowDataset />} />
      <Route path="/datasets" element={<LegacyDatasets />} />
      <Route path="/v1/*" element={<LegacyRoot />} />
      <Route path="*" element={<LazyRootV2 />} />
    </Routes>
  );
}
