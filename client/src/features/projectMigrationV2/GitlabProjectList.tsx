import cx from "classnames";
import { useState } from "react";
import { Button, Form, InputGroup } from "reactstrap";
import VisibilityIcon from "../../components/entities/VisibilityIcon";
import { Loader } from "../../components/Loader";
import { GitlabProjectResponse } from "../project/GitLab.types";

interface GitlabProjectListProps {
  projects: GitlabProjectResponse[];
  onSelectProject: (project: GitlabProjectResponse) => void;
  onSearch: (searchTerm: string) => void;
  isLoading: boolean;
}

export function GitlabProjectList({
  projects,
  onSelectProject,
  onSearch,
  isLoading,
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

  return (
    <>
      <div className="mb-3">
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
      <div className={cx("list-group")}>
        {projects.map((project) => (
          <button
            key={project.id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onClick={() => onSelectProject(project)}
          >
            <div>
              <h6 className="mb-0">{project.name}</h6>
              <small className="text-muted">
                @{project.namespace.full_path}
              </small>
            </div>
            <VisibilityIcon visibility={project.visibility} />
          </button>
        ))}
      </div>
    </>
  );
}
