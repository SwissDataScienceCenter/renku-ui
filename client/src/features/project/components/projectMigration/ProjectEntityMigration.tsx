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
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom-v5-compat";
import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import {
  ErrorAlert,
  InfoAlert,
  SuccessAlert,
  WarnAlert,
} from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { Links } from "../../../../utils/constants/Docs.js";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { useGetMigrationQuery } from "../../../projects/projectMigration.api";
import {
  RepositoriesList,
  usePostProjectMigrationsMutation,
} from "../../../projectsV2/api/projectV2.api";
import { safeParseJSONStringArray } from "../../../sessionsV2/session.utils";
import { useGetSessionLauncherData } from "../../hook/useGetSessionLauncherData";
import {
  MIGRATION_ARGS,
  MIGRATION_COMMAND,
  MIGRATION_MOUNT_DIRECTORY,
  MIGRATION_PORT,
  MIGRATION_WORKING_DIRECTORY,
} from "../../ProjectMigration.constants";
import { getProjectV2Path } from "../../utils/projectMigration.utils";
import {
  ProjectMetadata,
  ProjectMigrationForm,
} from "./ProjectMigration.types";
import { ProjectMigrationFormInputs } from "./ProjectMigrationForm";
import {
  DetailsMigration,
  DetailsNotIncludedInMigration,
} from "./ProjectMigrationDetails";

interface ProjectEntityMigrationProps {
  projectId: number;
  description?: { isLoading?: boolean; unavailable?: string; value: string };
  tagList: string[];
}
export function ProjectEntityMigration({
  projectId,
  description,
  tagList,
}: ProjectEntityMigrationProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const {
    data: projectMigration,
    isFetching: isFetchingMigrations,
    isLoading: isLoadingMigrations,
    refetch: refetchMigrations,
  } = useGetMigrationQuery(projectId);

  const linkToProject = useMemo(() => {
    return projectMigration
      ? getProjectV2Path(projectMigration.namespace, projectMigration.slug)
      : "";
  }, [projectMigration]);

  const projectMetadata: unknown = useLegacySelector<string>(
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
          <Link
            to={Links.RENKU_2_MIGRATION_INFO}
            className={cx("btn", "btn-outline-info")}
            rel="noreferrer noopener"
            target="_blank"
          >
            Learn more
          </Link>
        </div>
      </InfoAlert>
    );

  return (
    <>
      <WarnAlert>
        <p>
          This version of Renku will be deprecated in the future. Please migrate
          your project to Renku 2.0.
        </p>
        <div className={cx("d-flex", "flex-row", "gap-2")}>
          <Button size="sm" color="warning" onClick={toggle}>
            Yes, I want to migrate this project to Renku 2.0
          </Button>
          <Link
            to={Links.RENKU_2_MIGRATION_INFO}
            className={cx("btn", "btn-outline-warning")}
            rel="noreferrer noopener"
            target="_blank"
          >
            Learn more
          </Link>
        </div>
      </WarnAlert>
      <MigrationModal
        isOpen={isOpenModal}
        toggle={toggle}
        description={description?.isLoading ? undefined : description?.value}
        tagList={tagList}
        projectMetadata={projectMetadata as ProjectMetadata}
      />
    </>
  );
}

function MigrationModal({
  isOpen,
  toggle,
  projectMetadata,
  description,
  tagList,
}: {
  isOpen: boolean;
  toggle: () => void;
  projectMetadata: ProjectMetadata;
  description?: string;
  tagList: string[];
}) {
  const {
    control,
    formState: { dirtyFields, errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<ProjectMigrationForm>({
    defaultValues: {
      name: projectMetadata.title,
      namespace: "",
      slug: projectMetadata.path,
      visibility:
        projectMetadata.visibility === "public" ? "public" : "private",
    },
  });
  const [migrateProject, result] = usePostProjectMigrationsMutation();
  const {
    registryTag,
    isFetchingData,
    projectConfig,
    branch,
    commits,
    templateName,
    resourcePools,
    isProjectSupported,
  } = useGetSessionLauncherData();

  const isPinnedImage = !!projectConfig?.config?.sessions?.dockerImage;

  const containerImage = useMemo(() => {
    return (
      projectConfig?.config?.sessions?.dockerImage ?? registryTag?.location
    );
  }, [projectConfig, registryTag]);

  const defaultSessionClass = useMemo(
    () =>
      resourcePools?.flatMap((pool) => pool.classes).find((c) => c.default) ??
      resourcePools?.find(() => true)?.classes[0] ??
      undefined,
    [resourcePools]
  );

  const resourceClass = useMemo(() => {
    return (
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id && c.matching) ??
      resourcePools
        ?.filter((pool) => pool.default)
        .flatMap((pool) => pool.classes)
        .find((c) => c.matching) ??
      resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id == defaultSessionClass?.id) ??
      undefined
    );
  }, [resourcePools, defaultSessionClass]);

  const linkToProject = useMemo(() => {
    return result?.data
      ? getProjectV2Path(result.data.namespace, result.data.slug)
      : "";
  }, [result.data]);

  const onSubmit = useCallback(
    (data: ProjectMigrationForm) => {
      if (!containerImage) return;
      const nowFormatted = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
      const commandFormatted = safeParseJSONStringArray(MIGRATION_COMMAND);
      const argsFormatted = safeParseJSONStringArray(MIGRATION_ARGS);

      const dataMigration = {
        project: {
          name: data.name,
          namespace: data.namespace,
          slug: data.slug,
          visibility: data.visibility,
          description: description,
          keywords: tagList,
          repositories: [projectMetadata.httpUrl ?? ""] as RepositoriesList,
        },
        sessionLauncher: {
          containerImage,
          name: `${templateName ?? data.name} ${nowFormatted}`,
          defaultUrl: projectConfig?.config?.sessions?.defaultUrl ?? "",
          working_directory: MIGRATION_WORKING_DIRECTORY,
          mount_directory: MIGRATION_MOUNT_DIRECTORY,
          port: MIGRATION_PORT,
          command: commandFormatted.data,
          args: argsFormatted.data,
          resourceClassId: resourceClass?.id,
        },
      };
      migrateProject({
        projectMigrationPost: dataMigration,
        v1Id: parseInt(projectMetadata.id),
      });
    },
    [
      migrateProject,
      projectMetadata.id,
      projectMetadata.httpUrl,
      tagList,
      description,
      projectConfig,
      containerImage,
      templateName,
      resourceClass,
    ]
  );

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form className="bg-white" noValidate onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={toggle}>Migrate project to Renku 2.0</ModalHeader>
        <ModalBody>
          {result.error && <RtkErrorAlert error={result.error} />}
          {!result.data && (
            <ProjectMigrationFormInputs
              errors={errors}
              setValue={setValue}
              watch={watch}
              control={control}
              dirtyFields={dirtyFields}
            />
          )}
          {isFetchingData && (
            <div className="py-2">
              <Loader inline size={16} /> Loading session data...
            </div>
          )}
          {!result.data && !isFetchingData && (
            <>
              <DetailsMigration
                isPinnedImage={isPinnedImage}
                containerImage={containerImage}
                branch={branch}
                commits={commits}
                description={description}
                keywords={tagList.join(",")}
                codeRepository={projectMetadata.httpUrl ?? ""}
                resourceClass={resourceClass}
                isProjectSupported={isProjectSupported}
              />
              <DetailsNotIncludedInMigration />
            </>
          )}
          {result?.data && (
            <SuccessAlert dismissible={false} timeout={0}>
              <p>This project has been successfully migrated to Renku 2.0</p>
              <Link
                className={cx("btn", "btn-sm", "btn-success", "text-white")}
                to={linkToProject}
              >
                Go to the 2.0 version of the project
              </Link>
            </SuccessAlert>
          )}
          {!containerImage && !isFetchingData && (
            <ErrorAlert dismissible={false}>
              Container image not available, it is building or not exist
            </ErrorAlert>
          )}
          {!isProjectSupported && !isFetchingData && (
            <ErrorAlert dismissible={false}>
              Sessions might not work. Please update the project to migrate it
              to Renku 2.0.
            </ErrorAlert>
          )}
        </ModalBody>
        <ModalFooter>
          {!result.data && (
            <>
              <Button className="btn-outline-rk-green" onClick={toggle}>
                <XLg className={cx("bi", "me-1")} />
                Cancel
              </Button>
              <Button
                disabled={
                  result?.isLoading ||
                  isFetchingData ||
                  !containerImage ||
                  !isProjectSupported
                }
                type="submit"
              >
                {result.isLoading ? (
                  <Loader className="me-1" inline size={16} />
                ) : (
                  "Migrate project to Renku 2.0"
                )}
              </Button>
            </>
          )}
          {result.data && (
            <Button className="btn-outline-rk-green" onClick={toggle}>
              Close
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
}
