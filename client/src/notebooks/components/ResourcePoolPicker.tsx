/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { IMigration } from "../../features/project/Project";
import { useGetConfigQuery } from "../../features/project/projectCoreApi";
import { useGetNotebooksQuery } from "../../features/versions/versionsApi";
import { useGetResourcePoolsQuery } from "../../features/dataServices/dataServicesApi";
import { Loader } from "../../components/Loader";

interface ResourcePoolPickerProps {
  projectRepositoryUrl: string;
}

export const ResourcePoolPicker = ({
  projectRepositoryUrl,
}: ResourcePoolPickerProps) => {
  const test = useSelector<RootStateOrAny, IMigration["core"]>(
    (state) => state.stateModel.notebooks
  );
  console.log(test);

  const projectMigrationCore = useSelector<RootStateOrAny, IMigration["core"]>(
    (state) => state.stateModel.project.migration.core
  );
  const fetchedVersion = !!projectMigrationCore.fetched;
  const versionUrl = projectMigrationCore.versionUrl ?? "";

  const { data: projectConfig, isLoading: projectConfigIsLoading } =
    useGetConfigQuery(
      {
        projectRepositoryUrl,
        versionUrl,
      },
      { skip: !fetchedVersion }
    );

  const { data: sessionsVersion, isLoading: sessionsVersionIsLoading } =
    useGetNotebooksQuery({}, { skip: !fetchedVersion });

  const { data: resourcePools, isLoading: resourcePoolsIsLoading } =
    useGetResourcePoolsQuery({}, { skip: !fetchedVersion });

  if (!fetchedVersion) return null;

  const isLoading =
    projectConfigIsLoading ||
    sessionsVersionIsLoading ||
    resourcePoolsIsLoading;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      Resource pool picker
      <div className="py-2">
        <pre>{JSON.stringify(projectMigrationCore, null, 2)}</pre>
      </div>
      <div className="py-2">
        <pre>{JSON.stringify(projectConfig, null, 2)}</pre>
      </div>
      <div className="py-2">
        <pre>{JSON.stringify(sessionsVersion, null, 2)}</pre>
      </div>
      <div className="py-2">
        <pre>{JSON.stringify(resourcePools, null, 2)}</pre>
      </div>
    </div>
  );
};
