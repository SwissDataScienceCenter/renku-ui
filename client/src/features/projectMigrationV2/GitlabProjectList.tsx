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

import cx from "classnames";
import { useCallback, useMemo, useState } from "react";
import { CheckCircle, Folder } from "react-bootstrap-icons";
import { useSearchParams } from "react-router";
import { Button, Form, InputGroup } from "reactstrap";

import { ErrorAlert } from "../../components/Alert";
import VisibilityIcon from "../../components/entities/VisibilityIcon";
import { Loader } from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { useGetAllProjectsQuery } from "../project/projectGitLab.api";
import { useGetRenkuV1ProjectsMigrationsQuery } from "../projectsV2/api/projectV2.api.ts";
import { GitlabProjectsToMigrate } from "./ProjectMigration.types";

export const DEFAULT_PER_PAGE_PROJECT_MIGRATION = 5;

interface GitlabProjectListProps {
  onSelectProject: (project: GitlabProjectsToMigrate) => void;
}

export default function GitlabProjectList({
  onSelectProject,
}: GitlabProjectListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const onSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (term != "") {
        setSearchParams((prev) => {
          prev.set("page", "1");
          return prev;
        });
      }
    },
    [setSearchTerm, setSearchParams]
  );

  const page = useMemo(() => {
    const pageRaw = searchParams.get("page");
    if (!pageRaw) {
      return 1;
    }
    try {
      const page = parseInt(pageRaw, 10);
      return page > 0 ? page : 1;
    } catch {
      return 1;
    }
  }, [searchParams]);

  const { data: dataProjectsMigrations } =
    useGetRenkuV1ProjectsMigrationsQuery();

  const {
    data: dataGitlabProjects,
    error: errorGitlabProjects,
    isLoading: isLoadingGitlabProjects,
  } = useGetAllProjectsQuery(
    {
      page: page,
      perPage: DEFAULT_PER_PAGE_PROJECT_MIGRATION,
      membership: true,
      search: searchTerm,
      min_access_level: 50,
    },
    {
      skip: !dataProjectsMigrations,
    }
  );

  const mappedGitlabProjects: GitlabProjectsToMigrate[] = useMemo(() => {
    if (!dataGitlabProjects?.data || !dataProjectsMigrations) return [];
    return dataGitlabProjects?.data.map((project) => {
      return {
        ...project,
        alreadyMigrated: dataProjectsMigrations.some(
          (migration: { v1_id: number }) => migration.v1_id === project.id
        ),
      };
    });
  }, [dataGitlabProjects, dataProjectsMigrations]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchTerm(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchTerm(searchTerm);
    }
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSearchTerm(searchTerm);
  };

  const notFoundProjects = mappedGitlabProjects.length === 0 && (
    <small className="text-muted">
      Not found projects {searchTerm && `with name ${searchTerm}`} to migrate{" "}
    </small>
  );

  if (errorGitlabProjects) {
    return (
      <ErrorAlert dismissible={false}>
        Error loading projects. Please try again.
      </ErrorAlert>
    );
  }

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <p className="mb-0">
        Here is the list of all your projects found in Renku Legacy. Please
        select the one you would like to migrate to Renku 2.0.
      </p>
      <div>
        <Form noValidate onSubmit={handleSubmit}>
          <InputGroup data-cy="search-bar-project-list">
            <input
              autoComplete="project-migration-search"
              className="form-control"
              data-cy="project-migration-search"
              id="project-migration-search"
              placeholder="Search project..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              color="primary"
              data-cy="project-migration-search-button"
              id="project-migration-search-button"
              type="submit"
              onClick={handleSearchClick}
            >
              Search
            </Button>
          </InputGroup>
        </Form>
      </div>
      {isLoadingGitlabProjects && (
        <>
          <Loader /> Loading projects...
        </>
      )}
      {notFoundProjects}
      <div className={cx("list-group")}>
        {mappedGitlabProjects.map((project) => (
          <button
            key={project.id}
            className={cx(
              "list-group-item",
              "list-group-item-action",
              "d-flex",
              "justify-content-between",
              "align-items-center"
            )}
            disabled={project.alreadyMigrated}
            onClick={() => onSelectProject(project)}
          >
            <div>
              <h4 className={cx("mb-0", "fw-bold")}>
                <Folder className={cx("bi", "me-1")} /> {project.name}
                {project.alreadyMigrated && (
                  <span
                    className={cx(
                      "border",
                      "border-success",
                      "bg-success-subtle",
                      "text-success-emphasis",
                      "badge",
                      "rounded-pill",
                      "ms-3"
                    )}
                  >
                    <CheckCircle className={cx("bi", "me-1")} /> Already
                    migrated
                  </span>
                )}
              </h4>
              <small className="text-muted">
                @{project.namespace.full_path}
              </small>
            </div>
            <VisibilityIcon visibility={project.visibility} />
          </button>
        ))}
      </div>
      <Pagination
        currentPage={page}
        perPage={DEFAULT_PER_PAGE_PROJECT_MIGRATION}
        totalItems={dataGitlabProjects?.pagination?.totalItems ?? 0}
        pageQueryParam="page"
        showDescription={true}
        totalInPage={mappedGitlabProjects.length ?? 0}
      />
    </div>
  );
}
