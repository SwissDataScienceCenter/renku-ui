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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useMemo } from "react";
import { Link45deg, Pencil, PlayCircle, Trash } from "react-bootstrap-icons";
import { Card, CardBody, Col, DropdownItem, Row } from "reactstrap";

import SessionEnvironmentGitLabWarningBadge from "~/features/legacy/SessionEnvironmentGitLabWarnBadge";
import { useGetRepositoryQuery } from "~/features/repositories/api/repositories.api";
import { Loader } from "../../../components/Loader";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import { computeResourcesApi } from "../api/computeResources.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import { sessionLaunchersV2Api } from "../api/sessionLaunchersV2.api";
import {
  BuildStatusBadge,
  BuildStatusDescription,
} from "../components/BuildStatusComponents";
import { LauncherActions } from "../components/launcherActions/LauncherActions";
import { LauncherEnvironmentIcon } from "../components/SessionForm/LauncherEnvironmentIcon";
import SessionImageBadge from "../components/SessionStatus/SessionImageBadge";
import { SessionBadge } from "../components/SessionStatus/SessionStatus";
import { getEnvironmentKindLabel } from "../launcherEnvironment.utils";
import {
  getLauncherCategory,
  getLauncherCategoryDefinition,
  sessionLauncherKindToCategory,
} from "../session.utils";
import { SessionV2 } from "../sessionsV2.types";
import useLauncherEnvironmentReadiness from "../useLauncherEnvironmentReadiness.hook";
import SessionCard from "./SessionCard";

import styles from "./Session.module.scss";

interface SessionLauncherCardProps {
  launcher?: SessionLauncher;
  name?: string;
  project: Project;
  sessions?: SessionV2[];
  toggleUpdate?: () => void;
  toggleDelete?: () => void;
  toggleUpdateEnvironment?: () => void;
  toggleShareLink?: () => void;
  toggleSessionView?: () => void;
}
export default function SessionLauncherCard({
  launcher,
  name,
  project,
  sessions,
  toggleDelete,
  toggleUpdate,
  toggleUpdateEnvironment,
  toggleSessionView,
  toggleShareLink,
}: SessionLauncherCardProps) {
  const {
    builds,
    isBuildInProgress,
    isCodeEnvironment,
    isLoadingBuilds,
    isLoadingContainerImage,
    lastBuild,
    lastSuccessfulBuild,
    useOldImage,
    containerImage,
  } = useLauncherEnvironmentReadiness({ launcher });

  const environment = launcher?.environment;
  const hasSession = !!sessions?.length;
  const sessionType = sessions?.at(0)?.session_type ?? "interactive";
  const launcherCategory = sessionLauncherKindToCategory(
    launcher?.launcher_type || sessionType,
  );
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);
  const LauncherTypeIcon = launcherDefinition?.icon || PlayCircle;
  const launcherTypeLabel = launcherDefinition?.text.display || null;

  sessionLaunchersV2Api.endpoints.getEnvironmentsByEnvironmentIdBuilds.useQuerySubscription(
    launcher && isBuildInProgress
      ? { environmentId: launcher.environment.id }
      : skipToken,
    {
      pollingInterval: 1_000,
    },
  );

  const otherLauncherActions = launcher &&
    (toggleUpdate ||
      toggleDelete ||
      toggleShareLink ||
      toggleUpdateEnvironment) && (
      <LauncherDropdownActions
        project={project}
        launcher={launcher}
        toggleDelete={toggleDelete}
        toggleUpdate={toggleUpdate}
        toggleUpdateEnvironment={toggleUpdateEnvironment}
        toggleShareLink={toggleShareLink}
      />
    );

  const ENVIRONMENT_KIND_CLASSES = [
    "align-items-center",
    "d-flex",
    "gap-2",
    "me-2",
    "small",
    "text-muted",
  ];

  const {
    data: imageRepositorySource,
    isLoading: isLoadingImageRepositorySource,
  } = useGetRepositoryQuery(
    environment?.environment_image_source === "build"
      ? { url: environment.build_parameters.repository }
      : skipToken,
  );

  const { data: resourcePools, isLoading: isLoadingResourcePools } =
    computeResourcesApi.endpoints.getResourcePools.useQueryState({});
  // Ref: https://github.com/facebook/react/issues/35577
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const resourcePool = useMemo(() => {
    if (launcher?.resource_class_id == null || resourcePools == null) {
      return undefined;
    }
    return resourcePools.find(({ classes }) =>
      classes.some(({ id }) => id === launcher.resource_class_id),
    );
  }, [launcher?.resource_class_id, resourcePools]);

  return (
    <Card
      className={cx(
        styles.SessionLauncherCard,
        "cursor-pointer",
        "shadow-none",
        "rounded-0",
      )}
      data-cy="session-launcher-item"
      onClick={toggleSessionView}
      tabIndex={0}
    >
      <CardBody className={cx("p-0")}>
        <div className={cx(hasSession && "border-bottom", "p-3")}>
          <Row className="g-2">
            <Col className={cx("align-items-center")} xs={12} lg={6} xl={8}>
              {launcher && (
                <Row className={cx("g-2", "mb-0")}>
                  <Col
                    xs={12}
                    xl={4}
                    className={cx(
                      "d-inline-block",
                      "link-primary",
                      "text-body",
                    )}
                  >
                    <span
                      className={cx(
                        "small",
                        "text-muted",
                        "me-3",
                        "d-inline-flex",
                        "align-items-center",
                        "gap-1",
                      )}
                    >
                      <LauncherTypeIcon className={cx("bi")} size={14} />
                      <span className="fw-bold">{launcherTypeLabel}</span>{" "}
                      Launcher
                    </span>
                  </Col>
                  <Col xs={12} xl="auto">
                    {launcher?.environment &&
                      getEnvironmentKindLabel(launcher.environment) != null && (
                        <span className={cx(ENVIRONMENT_KIND_CLASSES)}>
                          <LauncherEnvironmentIcon launcher={launcher} />
                          {getEnvironmentKindLabel(launcher.environment)}
                        </span>
                      )}
                  </Col>
                </Row>
              )}
              <Row className={cx("g-2", isCodeEnvironment && "mb-2")}>
                <Col
                  xs={12}
                  className={cx("d-inline-block", "link-primary", "text-body")}
                >
                  <span
                    className={cx("fw-semibold", "fs-3")}
                    data-cy="session-name"
                  >
                    {name ? (
                      name
                    ) : (
                      <span className="fst-italic">
                        Orphan {launcherDefinition.text.display}
                      </span>
                    )}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col data-cy="session-gitlab-warning" xs={12}>
                  <SessionEnvironmentGitLabWarningBadge launcher={launcher} />
                </Col>
              </Row>
              {isCodeEnvironment ? (
                <Row className="g-2">
                  <Col xs={12} xl={4}>
                    {isCodeEnvironment &&
                    (isLoadingBuilds ||
                      isLoadingContainerImage ||
                      isLoadingImageRepositorySource ||
                      isLoadingResourcePools) ? (
                      <SessionBadge
                        className={cx("border-warning", "bg-warning-subtle")}
                      >
                        <Loader
                          size={12}
                          className={cx("me-1", "text-warning-emphasis")}
                          inline
                        />
                        <span className="text-warning-emphasis">
                          Loading build status
                        </span>
                      </SessionBadge>
                    ) : isCodeEnvironment && lastBuild ? (
                      <BuildStatusBadge
                        buildStatus={lastBuild?.status}
                        imageCheck={containerImage}
                        imageSourceCheck={imageRepositorySource}
                        resourcePool={resourcePool}
                      />
                    ) : (
                      <SessionImageBadge
                        data={containerImage}
                        isLoading={isLoadingContainerImage}
                        resourcePool={resourcePool}
                        isLoadingResourcePools={isLoadingResourcePools}
                      />
                    )}
                  </Col>
                  <Col xs={12} xl="auto" className="d-flex">
                    <BuildStatusDescription
                      status={lastBuild?.status ?? lastSuccessfulBuild?.status}
                      createdAt={
                        lastBuild?.created_at ?? lastSuccessfulBuild?.created_at
                      }
                      completedAt={
                        lastBuild?.status === "succeeded"
                          ? lastBuild?.result?.completed_at
                          : lastSuccessfulBuild?.status === "succeeded"
                            ? lastSuccessfulBuild?.result?.completed_at
                            : undefined
                      }
                    />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col>
                    <SessionImageBadge
                      data={containerImage}
                      isLoading={isLoadingContainerImage}
                      resourcePool={resourcePool}
                      isLoadingResourcePools={isLoadingResourcePools}
                    />
                  </Col>
                </Row>
              )}
            </Col>
            <Col className={cx("ms-md-auto")} xs={12} md="auto">
              {launcher != null && (
                <div
                  className={cx(
                    "d-flex",
                    "flex-column",
                    "align-items-end",
                    "gap-2",
                  )}
                >
                  <LauncherActions
                    placement="launcher-card"
                    builds={builds}
                    hasSession={hasSession}
                    lastBuild={lastBuild}
                    launcher={launcher}
                    otherActions={otherLauncherActions}
                    project={project}
                  />
                  {useOldImage && lastSuccessfulBuild && (
                    <BuildStatusDescription
                      isOldImage={true}
                      status={lastSuccessfulBuild?.status}
                      createdAt={lastSuccessfulBuild?.created_at}
                      completedAt={
                        lastSuccessfulBuild?.status === "succeeded"
                          ? lastSuccessfulBuild?.result?.completed_at
                          : undefined
                      }
                    />
                  )}
                </div>
              )}
            </Col>
          </Row>
        </div>
        {hasSession && (
          <div className="p-0">
            {sessions &&
              sessions?.length > 0 &&
              sessions.map((session) => (
                <SessionCard
                  key={`session-item-${session.name}`}
                  project={project}
                  session={session}
                />
              ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

interface LauncherDropdownActionsProps {
  launcher: SessionLauncher;
  toggleUpdate?: () => void;
  toggleDelete?: () => void;
  toggleUpdateEnvironment?: () => void;
  toggleShareLink?: () => void;
  project: Project;
}
function LauncherDropdownActions({
  launcher,
  toggleDelete,
  toggleUpdate,
  toggleUpdateEnvironment,
  toggleShareLink,
}: LauncherDropdownActionsProps) {
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });
  const launcherCategory = getLauncherCategory(launcher);
  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <>
            {toggleUpdateEnvironment && (
              <DropdownItem
                data-cy="session-launcher-menu-edit-env"
                onClick={toggleUpdateEnvironment}
              >
                <LauncherEnvironmentIcon
                  className={cx("me-1")}
                  launcher={launcher}
                />
                Edit environment
              </DropdownItem>
            )}
            {toggleUpdate && (
              <DropdownItem
                data-cy="session-launcher-menu-edit"
                onClick={toggleUpdate}
              >
                <Pencil className={cx("bi", "me-1")} />
                Edit launcher
              </DropdownItem>
            )}
            {toggleShareLink && launcherCategory === "session" && (
              <DropdownItem
                data-cy="session-launcher-menu-share-link"
                onClick={toggleShareLink}
              >
                <Link45deg className={cx("bi", "me-1")} />
                Share session launch link
              </DropdownItem>
            )}
            {toggleDelete && (
              <>
                <DropdownItem divider />
                <DropdownItem
                  data-cy="session-launcher-menu-delete"
                  onClick={toggleDelete}
                >
                  <Trash className={cx("bi", "me-1")} />
                  Delete launcher
                </DropdownItem>
              </>
            )}
          </>
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
    </>
  );
}
