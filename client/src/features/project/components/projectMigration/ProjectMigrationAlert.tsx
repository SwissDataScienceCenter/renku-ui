import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { generatePath, Link } from "react-router";
import { Button } from "reactstrap";

import { InfoAlert, WarnAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/LegacyExternalLinks";
import { Loader } from "../../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { Links } from "../../../../utils/constants/Docs";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { useGetRenkuV1ProjectsByV1IdMigrationsQuery } from "../../../projectsV2/api/projectV2.api";
import MigrationV1Modal from "./MigrationV1Modal";
import { ProjectMetadata } from "./ProjectMigration.types";

interface ProjectMigrationAlertProps {
  projectId: number;
  description?: { isLoading?: boolean; unavailable?: string; value: string };
  tagList: string[];
}
export default function ProjectMigrationAlert({
  projectId,
  description,
  tagList,
}: ProjectMigrationAlertProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const {
    data: projectMigration,
    isFetching: isFetchingMigrations,
    isLoading: isLoadingMigrations,
    refetch: refetchMigrations,
  } = useGetRenkuV1ProjectsByV1IdMigrationsQuery({ v1Id: projectId });

  const linkToProject = useMemo(() => {
    return projectMigration
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: projectMigration.namespace,
          slug: projectMigration.slug,
        })
      : "";
  }, [projectMigration]);

  const projectMetadata = useLegacySelector<ProjectMetadata>(
    (state) => state.stateModel.project.metadata
  );

  useEffect(() => {
    if (!isOpenModal) {
      refetchMigrations();
    }
  }, [isOpenModal, refetchMigrations]);

  const toggle = useCallback(() => {
    setIsOpenModal((open) => !open);
  }, []);

  if (isFetchingMigrations || isLoadingMigrations) return <Loader />;

  if (projectMigration)
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p>
          This project has been migrated to a newer version of Renku, Renku 2.0
        </p>
        <div className={cx("d-flex", "flex-row", "gap-2")}>
          <Link className={cx("btn", "btn-sm", "btn-info")} to={linkToProject}>
            Go to the 2.0 version of the project
          </Link>
          <ExternalLink
            role="button"
            showLinkIcon={true}
            title="Learn more"
            color="outline-info"
            url={Links.RENKU_2_LEARN_MORE}
          />
        </div>
      </InfoAlert>
    );

  return (
    <>
      <WarnAlert data-cy="sunset-project-banner">
        <h4>Renku Legacy will be discontinued in October 2025</h4>
        <p className="mb-2">
          Migrate your projects to Renku 2.0 to continue creating and managing
          your work.
        </p>
        <p>
          Renku Legacy will be shut down in October 2025, after which this page
          will no longer be accessible.
        </p>
        <div className={cx("d-flex", "flex-row", "gap-2")}>
          <Button size="sm" color="warning" onClick={toggle}>
            Migrate this project to Renku 2.0
          </Button>
          <ExternalLink
            role="button"
            showLinkIcon={true}
            title="Learn more"
            color="outline-warning"
            url={Links.RENKU_2_MIGRATION_INFO}
          />
        </div>
      </WarnAlert>
      <MigrationV1Modal
        isOpen={isOpenModal}
        toggle={toggle}
        description={description?.value}
        tagList={tagList}
        projectMetadata={projectMetadata}
      />
    </>
  );
}
