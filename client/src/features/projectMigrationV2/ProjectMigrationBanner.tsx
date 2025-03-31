import cx from "classnames";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Airplane } from "react-bootstrap-icons";
import { useSearchParams } from "react-router";
import { Button } from "reactstrap";
import { useGetAllProjectsQuery } from "../project/projectGitLab.api.ts";
import { useGetRenkuV1ProjectsMigrationsQuery } from "../projectsV2/api/projectV2.api.ts";
import { GitlabProjectsToMigrate } from "./ProjectMigration.types.ts";
import style from "./ProjectMigrationBanner.module.scss";
import { MigrationModal } from "../project/components/projectMigration/ProjectMigration.tsx";

export const DEFAULT_PER_PAGE_PROJECT_MIGRATION = 10;

export function ProjectMigrationBanner() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const onPageChange = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        prev.set("page", `${page}`);
        return prev;
      });
    },
    [setSearchParams]
  );

  const onSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);
      onPageChange(1);
    },
    [setSearchTerm, onPageChange]
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

  const toggle = useCallback(() => {
    setIsOpenModal((open) => !open);
  }, []);

  const {
    data: dataProjectsMigrations,
    isLoading: isLoadingProjectMigrations,
    refetch: refetchMigrations,
  } = useGetRenkuV1ProjectsMigrationsQuery();

  useEffect(() => {
    if (!isOpenModal) {
      refetchMigrations();
      onSearchTerm("");
    }
  }, [isOpenModal, refetchMigrations, onSearchTerm]);

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
      skip: isLoadingProjectMigrations || !dataProjectsMigrations,
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

  // initially if there are project to migrate should display the banner, if a search by term doesn't return values it should show the banner.
  const hasInitialProjectsToMigrate = true;

  return (
    !isLoadingGitlabProjects &&
    !isLoadingProjectMigrations &&
    hasInitialProjectsToMigrate && (
      <>
        <div
          className={cx(
            "d-flex",
            "flex-row",
            "justify-content-between",
            "align-items-center",
            style.ProjectMigrationBanner,
            "p-3",
            "rounded-3",
            "border"
          )}
        >
          <p className={cx("text-primary", "mb-0")}>
            Looking for your Renku Legacy projects?
          </p>
          <Button size="sm" color="outline-primary" onClick={toggle}>
            <Airplane className={cx("bi", "me-1")} /> Migrate from Renku Legacy
          </Button>
        </div>
        <MigrationModal
          isOpen={isOpenModal}
          toggle={toggle}
          searchTerm={searchTerm}
          setSearchTerm={onSearchTerm}
          dataGitlabProjects={mappedGitlabProjects}
          errorGitlabProjects={errorGitlabProjects}
          isLoadingGitlabProjects={isLoadingGitlabProjects}
          totalResult={dataGitlabProjects?.pagination?.totalItems ?? 0}
          page={page}
          onPageChange={onPageChange}
          perPage={DEFAULT_PER_PAGE_PROJECT_MIGRATION}
        />
      </>
    )
  );
}
