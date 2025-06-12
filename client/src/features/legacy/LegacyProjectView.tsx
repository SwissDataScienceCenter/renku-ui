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
 * limitations under the License.
 */

// import {
//   useGetRenkuV1ProjectsByV1IdMigrationsQuery,
//   type Project as ProjectV2,
// } from "../projectsV2/api/projectV2.api";

export default function LegacyProjectView() {
  // TODO: figure out how to look up the project by namespace/slug
  //   const projectId = useLegacySelector<number | null>(
  //     (state) => state.stateModel.project.metadata.id ?? null
  //   );
  //   const { data: projectV2, isFetching: isFetchingMigrations } =
  //     useGetRenkuV1ProjectsByV1IdMigrationsQuery(
  //       projectId ? { v1Id: projectId } : skipToken
  //     );
  return (
    <div className="legacy-project-view">
      <h1>Legacy Project View</h1>
      <p>
        This view is for legacy projects that are not yet migrated to the new
        system.
      </p>
    </div>
  );
}
