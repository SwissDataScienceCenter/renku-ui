/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "reactstrap";

import { projectKgApi } from "../../features/project/projectKgApi";
import { ProjectIndexingStatuses } from "../../features/project/projectEnums";
import { InfoAlert, WarnAlert } from "../Alert";
import { Loader } from "../Loader";
import { Url } from "../../utils/helpers/url";

/**
 * Inject the lineage status to the File Lineage component
 */

interface KgStatusWrapperProps {
  children: React.ReactNode;
  maintainer: boolean;
  projectId: number;
  projectName: string;
  projectNamespace?: string;
  [key: string]: unknown;
}
export function KgStatusWrapper(props: KgStatusWrapperProps) {
  const NO_POLLING = 0;
  const SHORT_POLLING = 10 * 1000;

  // Set up the query
  const [pollingInterval, setPollingInterval] = useState(0);
  const skip = !props.projectId ? true : false;
  const { data, isError, isFetching, isLoading, isUninitialized, refetch } =
    projectKgApi.useGetProjectIndexingStatusQuery(props.projectId, {
      refetchOnMountOrArgChange: 20,
      skip,
      pollingInterval,
    });

  // Add polling for indexing projects
  useEffect(() => {
    if (!isUninitialized && !isFetching) {
      if (data?.details?.status === ProjectIndexingStatuses.InProgress)
        setPollingInterval(SHORT_POLLING);
      else setPollingInterval(NO_POLLING);
    }
  }, [data, isUninitialized, isFetching, NO_POLLING, SHORT_POLLING]);

  // Render the content
  if (isLoading) {
    return (
      <p>
        Checking project metadata status... <Loader size="14" inline="true" />
      </p>
    );
  } else if (isError) {
    return (
      <WarnAlert>
        <p>
          Unexpected error while checking project metadata! You can try to{" "}
          <Link
            to=""
            onClick={(e) => {
              e.preventDefault();
              refetch();
            }}
          >
            refresh the content
          </Link>
          .
        </p>
      </WarnAlert>
    );
  } else if (!data?.activated) {
    const projectUrl = Url.get(Url.pages.project, {
      namespace: "",
      path: props.projectPath,
    });
    const settingsUrl = Url.get(Url.pages.project.settings, {
      namespace: props.projectNamespace,
      path: props.projectName,
    });
    const goToSettings = props.maintainer ? (
      <p className="mb-0 mt-3">
        You can start processing the metadata from the{" "}
        <Link to={settingsUrl}>settings page</Link>.
      </p>
    ) : (
      <p className="mb-0 mt-3">
        Only maintainers can activate metadata processing; you can still fork
        the project from the <Link to={projectUrl}>overview page</Link> to get
        the lineage.
      </p>
    );
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          Project metadata needs to be processed to view the Lineage.
        </p>
        {goToSettings}
      </InfoAlert>
    );
  } else if (data?.details?.status === ProjectIndexingStatuses.InProgress) {
    const progress =
      data?.progress?.percentage !== undefined &&
      data.progress.percentage > 0 &&
      data.progress.percentage < 100 ? (
        <>
          <p>Processing project metadata: {data.progress.percentage}%</p>
          <Progress value={data.progress.percentage} />
        </>
      ) : (
        <p>
          Processing project metadata... <Loader size="14" />
        </p>
      );
    return (
      <InfoAlert dismissible={false} timeout={0}>
        {progress}
      </InfoAlert>
    );
  }
  return props.children;
}
