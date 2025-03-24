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
import { generatePath, Link } from "react-router";
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
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import { Links } from "../../../../utils/constants/Docs.js";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { toHumanDateTime } from "../../../../utils/helpers/DateTimeUtils";
import {
  RepositoriesList,
  useGetRenkuV1ProjectsByV1IdMigrationsQuery,
  usePostRenkuV1ProjectsByV1IdMigrationsMutation,
} from "../../../projectsV2/api/projectV2.api";
import { useGetSessionLauncherData } from "../../hook/useGetSessionLauncherData";
import {
  ProjectMetadata,
  ProjectMigrationForm,
} from "./ProjectMigration.types";
import {
  DetailsMigration,
  DetailsNotIncludedInMigration,
} from "./ProjectMigrationDetails";
import { ProjectMigrationFormInputs } from "./ProjectMigrationForm";

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
      <WarnAlert>
        <p>This project can be migrated to Renku 2.0</p>
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
      <MigrationModal
        isOpen={isOpenModal}
        toggle={toggle}
        description={description?.isLoading ? undefined : description?.value}
        tagList={tagList}
        projectMetadata={projectMetadata}
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
  const [migrateProject, result] =
    usePostRenkuV1ProjectsByV1IdMigrationsMutation();
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
      ? generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
          namespace: result.data.namespace,
          slug: result.data.slug,
        })
      : "";
  }, [result.data]);

  const onSubmit = useCallback(
    (data: ProjectMigrationForm) => {
      if (!containerImage) return;
      const nowFormatted = toHumanDateTime({ datetime: DateTime.now() });
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
        session_launcher: {
          container_image: containerImage,
          name: `${templateName ?? data.name} ${nowFormatted}`,
          default_url: projectConfig?.config?.sessions?.defaultUrl ?? "",
          resource_class_id: resourceClass?.id,
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
              Container image not available, it does not exist or is currently
              building.
            </ErrorAlert>
          )}
          {!isProjectSupported && !isFetchingData && (
            <ErrorAlert dismissible={false}>
              Please update this project before migrating it to Renku 2.0.
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
