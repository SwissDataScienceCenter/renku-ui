import cx from "classnames";
import { useCallback, useMemo, useState, useEffect } from "react";
import { BoxArrowInUp, XLg, XSquare } from "react-bootstrap-icons";
import { useSearchParams } from "react-router";
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { SuccessAlert } from "../../components/Alert.jsx";
import { Loader } from "../../components/Loader.tsx";
import { useGetAllProjectsQuery } from "../project/projectGitLab.api.ts";
import { useGetRenkuV1ProjectsMigrationsQuery } from "../projectsV2/api/projectV2.api.ts";
import {
  useGetUserPreferencesQuery,
  usePostUserPreferencesDismissProjectMigrationBannerMutation,
  UserPreferences,
} from "../usersV2/api/users.api.ts";
import { GitlabProjectsToMigrate } from "./ProjectMigration.types.ts";
import style from "./ProjectMigrationBanner.module.scss";
import { MigrationModal } from "../project/components/projectMigration/ProjectMigration.tsx";

export const DEFAULT_PER_PAGE_PROJECT_MIGRATION = 10;

export function ProjectMigrationBanner() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenDismissMigration, setIsOpenDismissMigration] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [dismissProjectMigrationBanner, result] =
    usePostUserPreferencesDismissProjectMigrationBannerMutation();

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

  const { data: dataUserPreferences, isLoading: isLoadingUserPreferences } =
    useGetUserPreferencesQuery();

  const isDismissedProjectMigrationBanner = useMemo(() => {
    if (isLoadingUserPreferences) return true;
    return dataUserPreferences
      ? dataUserPreferences.dismiss_project_migration_banner
      : false;
  }, [isLoadingUserPreferences, dataUserPreferences]);

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
      skip:
        isLoadingProjectMigrations ||
        !dataProjectsMigrations ||
        isDismissedProjectMigrationBanner,
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

  const onToggleDismissAlert = useCallback(() => {
    setIsOpenDismissMigration((open) => !open);
  }, []);

  const onDismissBanner = useCallback(() => {
    dismissProjectMigrationBanner();
  }, [dismissProjectMigrationBanner]);

  return (
    !isDismissedProjectMigrationBanner &&
    !isLoadingGitlabProjects &&
    !isLoadingProjectMigrations &&
    hasInitialProjectsToMigrate && (
      <Alert
        className={cx(
          style.ProjectMigrationBanner,
          "rounded-3",
          "pt-3",
          "border-dark-subtle"
        )}
        toggle={onToggleDismissAlert}
      >
        <div
          className={cx(
            "d-flex",
            "flex-row",
            "justify-content-between",
            "align-items-center",
            "p-0"
          )}
        >
          <p className={cx("text-primary", "mb-0")}>
            Looking for your Renku Legacy projects?
          </p>
          <Button size="sm" color="outline-primary" onClick={toggle}>
            <BoxArrowInUp className={cx("bi", "me-1")} /> Migrate from Renku
            Legacy
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
        <DismissMigrationConfirmationModal
          onDismissBanner={onDismissBanner}
          toggle={onToggleDismissAlert}
          isOpen={isOpenDismissMigration}
          result={result?.data}
        />
      </Alert>
    )
  );
}

function DismissMigrationConfirmationModal({
  isOpen,
  toggle,
  onDismissBanner,
  result,
}: {
  isOpen: boolean;
  toggle: () => void;
  onDismissBanner: () => void;
  result?: UserPreferences;
}) {
  const isLoadingDismissMigration = false;
  return (
    <Modal isOpen={isOpen} centered size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <XSquare className={cx("bi", "me-1")} />
        Dismiss project migration banner
      </ModalHeader>
      <ModalBody className="p-4">
        {!result && (
          <p>
            Are you sure you want to hide this banner? It won&apos;t display on
            the dashboard anymore, but you will still be able to migrate your
            project from the Renku legacy project page.
          </p>
        )}
        {result?.dismiss_project_migration_banner && (
          <SuccessAlert>Banner dismissed successfully</SuccessAlert>
        )}
      </ModalBody>
      <ModalFooter>
        {!result && (
          <>
            <Button color="outline-primary" onClick={toggle}>
              <XLg className={cx("bi", "me-1")} /> Cancel
            </Button>
            <Button color="primary" onClick={onDismissBanner}>
              {isLoadingDismissMigration ? (
                <Loader className="me-1" inline size={16} />
              ) : (
                "Dismiss project migration banner"
              )}
            </Button>
          </>
        )}
        {result?.dismiss_project_migration_banner && (
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} /> Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
