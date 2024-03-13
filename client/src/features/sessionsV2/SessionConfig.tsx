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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useEffect, useMemo, useRef } from "react";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import { Loader } from "../../components/Loader";
import useAppDispatch from "../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../utils/customHooks/useAppSelector.hook";
import type { GitlabProjectResponse } from "../project/GitLab.types";
import { useGetProjectByPathQuery } from "../project/projectGitLab.api";
import type { Project } from "../projectsV2/api/projectV2.api";
import sessionConfigV2Slice from "./sessionConfigV2.slice";
import { RepositorySupport } from "./sessionConfigV2.types";
import { UncontrolledTooltip } from "reactstrap";

interface SessionConfigProps {
  project: Project;
}

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
        Repository support for sessions
        {(!projectSupport || projectSupport.isLoading) && (
          <Loader className={cx("bi", "ms-1")} inline size={16} />
        )}
      </h3>
      <ol className="list-unstyled">
        {repositories.map((url, idx) => (
          <SessionRepositoryConfig key={idx} project={project} url={url} />
        ))}
      </ol>
    </>
  );
}

interface SessionRepositoryConfigProps {
  project: Project;
  url: string;
}

function SessionRepositoryConfig({ url }: SessionRepositoryConfigProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const canonicalUrl = useMemo(() => `${url.replace(/.git$/i, "")}.git`, [url]);

  const repository = useMemo(
    () => matchRepositoryUrl(canonicalUrl),
    [canonicalUrl]
  );

  const { currentData, isFetching, isError } = useGetProjectByPathQuery(
    repository ? repository : skipToken
  );

  const matchedRepositoryMetadata = useMemo(
    () =>
      currentData != null
        ? matchRepositoryMetadata(canonicalUrl, currentData)
        : null,
    [canonicalUrl, currentData]
  );

  const repositorySupport = useAppSelector(
    ({ sessionConfigV2 }) => sessionConfigV2.repositorySupport[canonicalUrl]
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (repositorySupport == null) {
      dispatch(sessionConfigV2Slice.actions.initializeRepository(canonicalUrl));
    }
  }, [canonicalUrl, dispatch, isFetching, repositorySupport]);

  useEffect(() => {
    if (!repository) {
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: false,
        })
      );
    }
  }, [canonicalUrl, dispatch, repository]);

  useEffect(() => {
    if (isFetching) {
      dispatch(sessionConfigV2Slice.actions.initializeRepository(canonicalUrl));
    }
  }, [canonicalUrl, dispatch, isFetching]);

  useEffect(() => {
    if (isError) {
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: false,
        })
      );
    }
  }, [canonicalUrl, dispatch, isError]);

  useEffect(() => {
    if (currentData == null) {
      return;
    }

    if (matchedRepositoryMetadata) {
      const {
        default_branch: defaultBranch,
        namespace,
        path: projectName,
      } = matchedRepositoryMetadata;
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: true,
          sessionConfiguration: {
            defaultBranch,
            namespace: namespace.full_path,
            projectName,
            repositoryMetadata: matchedRepositoryMetadata,
          },
        })
      );
    } else {
      dispatch(
        sessionConfigV2Slice.actions.setRepositorySupport({
          url: canonicalUrl,
          isLoading: false,
          supportsSessions: false,
        })
      );
    }
  }, [canonicalUrl, currentData, dispatch, matchedRepositoryMetadata]);

  return (
    <li>
      <span className="me-1" ref={ref} tabIndex={0}>
        {!repositorySupport || repositorySupport.isLoading ? (
          <Loader className="bi" inline size={16} />
        ) : repositorySupport.supportsSessions ? (
          <CheckCircleFill className={cx("bi", "text-success")} />
        ) : (
          <XCircleFill className={cx("bi", "text-danger")} />
        )}
      </span>
      <span>{canonicalUrl}</span>
      {repositorySupport && !repositorySupport.isLoading && (
        <UncontrolledTooltip target={ref} placement="top">
          {repositorySupport.supportsSessions ? (
            <>This repository will be mounted in sessions.</>
          ) : (
            <>This repository cannot be mounted in sessions.</>
          )}
        </UncontrolledTooltip>
      )}
    </li>
  );
}

function matchRepositoryUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const trimmedPath = url.pathname
      .replace(/^[/]/gi, "")
      .replace(/.git$/i, "");
    return trimmedPath ? trimmedPath : null;
  } catch (error) {
    return null;
  }
}

function matchRepositoryMetadata(
  canonicalUrl: string,
  data: GitlabProjectResponse
) {
  if (canonicalUrl !== data.http_url_to_repo) {
    return null;
  }
  return data;
}
