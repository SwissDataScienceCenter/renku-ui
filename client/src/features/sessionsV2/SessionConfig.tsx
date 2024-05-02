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
import { useEffect, useMemo } from "react";
import { Loader } from "../../components/Loader";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import { SessionRepositoryConfig } from "../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay.tsx";
import type { Project } from "../projectsV2/api/projectV2.api";
import sessionConfigV2Slice from "./sessionConfigV2.slice";
import { RepositorySupport } from "./sessionConfigV2.types";

interface SessionConfigProps {
  project: Project;
}

/**
 * This component computes which repositories of a project the user
 * has access to.
 */
export default function SessionConfig({ project }: SessionConfigProps) {
  const repositories = useMemo(
    () => project.repositories ?? [],
    [project.repositories]
  );

  const projectSupport = useAppSelector(
    ({ sessionConfigV2 }) => sessionConfigV2.projectSupport[project.id]
  );
  const { repositorySupport } = useAppSelector(
    ({ sessionConfigV2 }) => sessionConfigV2
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      sessionConfigV2Slice.actions.initializeProject({
        projectId: project.id,
        repositories,
      })
    );
  }, [dispatch, project.id, repositories]);

  useEffect(() => {
    repositories.forEach((url, index) => {
      const canonicalUrl = `${url.replace(/.git$/i, "")}.git`;
      const support = repositorySupport[canonicalUrl];
      if (support && !support.isLoading) {
        dispatch(
          sessionConfigV2Slice.actions.updateProjectRepository({
            projectId: project.id,
            index,
            ...(support as RepositorySupport & { isLoading: false }),
          })
        );
      }
    });
  }, [dispatch, project.id, repositories, repositorySupport]);

  if (repositories.length == 0) {
    return null;
  }

  return (
    <>
      <h3 className="fs-5">
        {(!projectSupport || projectSupport.isLoading) && (
          <Loader className={cx("bi", "ms-1")} inline size={16} />
        )}
      </h3>
      <ol className="list-unstyled">
        {repositories.map((url, idx) => (
          <SessionRepositoryConfig
            key={idx}
            project={project}
            url={url}
            viewMode="inline-view-mode"
          />
        ))}
      </ol>
    </>
  );
}
