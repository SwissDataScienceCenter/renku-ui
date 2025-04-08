import cx from "classnames";
import { useState } from "react";
import { CheckCircle, Folder } from "react-bootstrap-icons";
import { Button, Form, InputGroup } from "reactstrap";
import VisibilityIcon from "../../components/entities/VisibilityIcon";
import { Loader } from "../../components/Loader";
import Pagination from "../../components/Pagination.tsx";
import { GitlabProjectsToMigrate } from "./ProjectMigration.types.ts";

interface GitlabProjectListProps {
  projects: GitlabProjectsToMigrate[];
  onSelectProject: (project: GitlabProjectsToMigrate) => void;
  onSearch: (searchTerm: string) => void;
  isLoading: boolean;
  searchTerm?: string;
  page: number;
  perPage: number;
  totalResult: number;
  onPageChange?: (page: number) => void;
}

export function GitlabProjectList({
  projects,
  onSelectProject,
  onSearch,
  isLoading,
  page,
  perPage,
  totalResult,
  onPageChange,
}: GitlabProjectListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(searchTerm);
    }
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const notFoundProjects = projects.length === 0 && (
    <small className="text-muted">
      Not found projects {searchTerm && `with name ${searchTerm}`} to migrate{" "}
    </small>
  );

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
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
      {isLoading && (
        <>
          <Loader /> Loading projects...
        </>
      )}
      {notFoundProjects}
      <div className={cx("list-group")}>
        {projects.map((project) => (
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
              <h6 className={cx("mb-0", "fw-bold")}>
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
              </h6>
              <small className="text-muted">
                @{project.namespace.full_path}
              </small>
            </div>
            <VisibilityIcon visibility={project.visibility} />
          </button>
        ))}
      </div>
      {onPageChange && (
        <Pagination
          currentPage={page}
          perPage={perPage}
          totalItems={totalResult ?? 0}
          onPageChange={onPageChange}
          showDescription={true}
        />
      )}
    </div>
  );
}
