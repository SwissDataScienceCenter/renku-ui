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
import SessionEnvironmentGitLabWarningBadge from "~/features/legacy/SessionEnvironmentGitLabWarnBadge";
import cx from "classnames";
import { useContext } from "react";
import { CircleFill, Link45deg, Pencil, Trash } from "react-bootstrap-icons";
import { Card, CardBody, Col, DropdownItem, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import { Project } from "../../projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import {
  sessionLaunchersV2Api,
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
} from "../api/sessionLaunchersV2.api";
import { useGetSessionsImagesQuery } from "../api/sessionsV2.api";
import {
  BuildStatusBadge,
  BuildStatusDescription,
} from "../components/BuildStatusComponents";
import {
  EnvironmentIcon,
  LauncherEnvironmentIcon,
} from "../components/SessionForm/LauncherEnvironmentIcon";
import { SessionLauncherButtons } from "../components/SessionLauncherButtons";
import SessionImageBadge from "../components/SessionStatus/SessionImageBadge";
import { SessionBadge } from "../components/SessionStatus/SessionStatus";
import { SessionV2 } from "../sessionsV2.types";
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
  const { params } = useContext(AppContext);
  const environment = launcher?.environment;
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;
  const isCodeEnvironment = environment?.environment_image_source === "build";
  const isExternalImageEnvironment =
    environment?.environment_kind === "CUSTOM" &&
    environment?.environment_image_source === "image";

  const { data: builds, isLoading } = useGetBuildsQuery(
    imageBuildersEnabled && isCodeEnvironment
      ? { environmentId: environment.id }
      : skipToken
  );

  const lastBuild = builds?.at(0);
  const lastSuccessfulBuild = builds?.find(
    (build) => build.status === "succeeded" && build.id !== lastBuild?.id
  );
  const hasSession = !!sessions?.length;

  sessionLaunchersV2Api.endpoints.getEnvironmentsByEnvironmentIdBuilds.useQuerySubscription(
    isCodeEnvironment && lastBuild?.status === "in_progress"
      ? { environmentId: environment.id }
      : skipToken,
    {
      pollingInterval: 1_000,
    }
  );

  const otherLauncherActions = launcher &&
    toggleUpdate &&
    toggleDelete &&
    toggleShareLink &&
    toggleUpdateEnvironment && (
      <SessionLauncherDropdownActions
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

  const { data: containerImage, isLoading: loadingContainerImage } =
    useGetSessionsImagesQuery(
      environment &&
        environment.environment_kind === "CUSTOM" &&
        environment.container_image
        ? { imageUrl: environment.container_image }
        : skipToken
    );

  return (
    <Card
      className={cx(
        styles.SessionLauncherCard,
        "cursor-pointer",
        "shadow-none",
        "rounded-0"
      )}
      data-cy="session-launcher-item"
      onClick={toggleSessionView}
      tabIndex={0}
    >
      <CardBody className={cx("p-0")}>
        <div className={cx(hasSession && "border-bottom", "p-3")}>
          <Row className="g-2">
            <Col className={cx("align-items-center")} xs={12} lg={6} xl={8}>
              <Row className={cx("g-2", "mb-0")}>
                <Col
                  xs={12}
                  xl={4}
                  className={cx("d-inline-block", "link-primary", "text-body")}
                >
                  <span className={cx("small", "text-muted", "me-3")}>
                    Session Launcher
                  </span>
                </Col>
                <Col xs={12} xl="auto">
                  {environment?.environment_kind === "GLOBAL" ? (
                    <span className={cx(ENVIRONMENT_KIND_CLASSES)}>
                      <EnvironmentIcon type="global" />
                      Global environment
                    </span>
                  ) : isCodeEnvironment ? (
                    <span className={cx(ENVIRONMENT_KIND_CLASSES)}>
                      <EnvironmentIcon type="codeBased" size={16} />
                      Code based environment
                    </span>
                  ) : isExternalImageEnvironment ? (
                    <span className={cx(ENVIRONMENT_KIND_CLASSES)}>
                      <EnvironmentIcon type="custom" size={16} />
                      External image environment
                    </span>
                  ) : null}
                </Col>
              </Row>
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
                      <span className="fst-italic">Orphan session</span>
                    )}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col data-cy="session-gitlab-warning" xs={12}>
                  <SessionEnvironmentGitLabWarningBadge launcher={launcher} />
                </Col>
              </Row>
              {isCodeEnvironment && (
                <Row className="g-2">
                  <Col xs={12} xl={4}>
                    {isCodeEnvironment && isLoading ? (
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
                      <BuildStatusBadge status={lastBuild?.status} />
                    ) : !hasSession ? (
                      <SessionBadge
                        className={cx("border-dark-subtle", "bg-light")}
                      >
                        <CircleFill
                          className={cx("me-1", "bi", "text-light-emphasis")}
                        />
                        <span
                          className="text-dark-emphasis"
                          data-cy="session-status"
                        >
                          Not Running
                        </span>
                      </SessionBadge>
                    ) : null}
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
              )}
              {isExternalImageEnvironment && (
                <Row>
                  <Col>
                    <SessionImageBadge
                      data={containerImage}
                      loading={loadingContainerImage}
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
                    "gap-2"
                  )}
                >
                  <SessionLauncherButtons
                    hasSession={hasSession}
                    lastBuild={lastBuild}
                    launcher={launcher}
                    namespace={project.namespace}
                    otherActions={otherLauncherActions}
                    slug={project.slug}
                    useOldImage={
                      isCodeEnvironment &&
                      lastBuild?.status !== "succeeded" &&
                      !!lastSuccessfulBuild
                    }
                  />
                  {isCodeEnvironment &&
                    lastBuild?.status !== "succeeded" &&
                    lastSuccessfulBuild && (
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

interface SessionLauncherDropdownActionsProps {
  launcher: SessionLauncher;
  toggleUpdate: () => void;
  toggleDelete: () => void;
  toggleUpdateEnvironment: () => void;
  toggleShareLink: () => void;
  project: Project;
}
function SessionLauncherDropdownActions({
  launcher,
  toggleDelete,
  toggleUpdate,
  toggleUpdateEnvironment,
  toggleShareLink,
}: SessionLauncherDropdownActionsProps) {
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });

  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <>
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
            <DropdownItem
              data-cy="session-launcher-menu-edit"
              onClick={toggleUpdate}
            >
              <Pencil className={cx("bi", "me-1")} />
              Edit launcher
            </DropdownItem>
            <DropdownItem
              data-cy="session-launcher-menu-share-link"
              onClick={toggleShareLink}
            >
              <Link45deg className={cx("bi", "me-1")} />
              Share session launch link
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              data-cy="session-launcher-menu-delete"
              onClick={toggleDelete}
            >
              <Trash className={cx("bi", "me-1")} />
              Delete launcher
            </DropdownItem>
          </>
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
    </>
  );
}
