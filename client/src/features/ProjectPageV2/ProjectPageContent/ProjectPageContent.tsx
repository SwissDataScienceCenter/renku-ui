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
 * limitations under the License.
 */
import cx from "classnames";
import { Project } from "../../projectsV2/api/projectV2.api.ts";
import { ProjectPageContentType } from "../ProjectPageContainer/ProjectPageContainer.tsx";
import ProjectInformation from "./ProjectInformation/ProjectInformation.tsx";
import ProjectPageOverview from "./ProjectOverview/ProjectOverview.tsx";
import ProjectPageSettings from "./Settings/ProjectSettings.tsx";

export default function ProjectPageContent({
  project,
  selectedContent,
}: {
  project: Project;
  selectedContent: ProjectPageContentType;
}) {
  const isSettingsPage = selectedContent === ProjectPageContentType.Settings;
  const isInfoPage = selectedContent === ProjectPageContentType.ProjectInfo;
  return (
    <main>
      {isSettingsPage && <ProjectPageSettings projectId={project.id} />}
      {isInfoPage && (
        <div className={cx("d-block", "d-lg-none", "d-sm-block")}>
          <ProjectInformation project={project} />
        </div>
      )}
      {!isSettingsPage && !isInfoPage && <ProjectPageOverview />}
    </main>
  );
}