import cx from "classnames";
import { useCallback, useState } from "react";
import { Airplane } from "react-bootstrap-icons";
import { Button } from "reactstrap";
import { useGetAllProjectsQuery } from "../project/projectGitLab.api.ts";
import style from "./ProjectMigrationBanner.module.scss";
import { MigrationModal } from "../project/components/projectMigration/ProjectEntityMigration.tsx";

export function ProjectMigrationBanner() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggle = useCallback(() => {
    setIsOpenModal((open) => !open);
  }, []);

  const {
    data: dataGitlabProjects,
    error: errorGitlabProjects,
    isLoading: isLoadingGitlabProjects,
    refetch: refetchGitlabProjects,
  } = useGetAllProjectsQuery({
    page: 1,
    perPage: 15,
    membership: true,
    search: searchTerm,
    min_access_level: 50,
  });

  return (
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
        setSearchTerm={setSearchTerm}
        dataGitlabProjects={dataGitlabProjects}
        errorGitlabProjects={errorGitlabProjects}
        isLoadingGitlabProjects={isLoadingGitlabProjects}
        refetchGitlabProjects={refetchGitlabProjects}
      />
    </>
  );
}
