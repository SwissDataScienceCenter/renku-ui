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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError, skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  BootstrapReboot,
  BoxArrowUpRight,
  CircleFill,
  Clock,
  ExclamationTriangleFill,
  FileEarmarkText,
  XCircle,
  XLg,
  XOctagon,
} from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Col,
  DropdownItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import RtkOrDataServicesError from "../../../components/errors/RtkOrDataServicesError";
import { ExternalLink } from "../../../components/LegacyExternalLinks";
import { Loader } from "../../../components/Loader";
// import { EnvironmentLogsPresent, ILogs } from "../../../components/LogsV2";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import { TimeCaption } from "../../../components/TimeCaption";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import type { ResourcePoolWithId } from "../api/computeResources.api";
import type {
  Build,
  BuildList,
  CreationDate,
} from "../api/sessionLaunchersV2.api";
import {
  SessionLauncher,
  useGetBuildsByBuildIdLogsQuery as useGetBuildLogsQuery,
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
  usePatchBuildsByBuildIdMutation as usePatchBuildMutation,
  usePostEnvironmentsByEnvironmentIdBuildsMutation as usePostBuildMutation,
} from "../api/sessionLaunchersV2.api";
import type { ImageCheckResponse } from "../api/sessionsV2.api";
import { IMAGE_BUILD_DOCS } from "../session.constants";
import { isImageCompatibleWith } from "../session.utils";

interface BuildStatusBadgeProps {
  buildStatus: Build["status"];
  imageCheck?: ImageCheckResponse | null;
  resourcePool?: ResourcePoolWithId;
}

export function BuildStatusBadge({
  buildStatus,
  imageCheck,
  resourcePool,
}: BuildStatusBadgeProps) {
  const isCompatible = useMemo(() => {
    if (imageCheck == null || resourcePool == null) {
      return "unknown";
    }
    return isImageCompatibleWith(imageCheck, resourcePool.platform);
  }, [imageCheck, resourcePool]);

  const badgeIcon =
    buildStatus === "in_progress" ? (
      <Loader className="me-1" inline size={12} />
    ) : (
      <CircleFill className={cx("me-1", "bi")} />
    );

  const badgeText =
    isCompatible === false
      ? "Image incompatible"
      : buildStatus === "in_progress"
      ? "Build in progress"
      : buildStatus === "cancelled"
      ? "Build cancelled"
      : buildStatus === "succeeded"
      ? "Build succeeded"
      : "Build failed";

  const badgeColorClasses =
    isCompatible === false
      ? ["border-danger", "bg-danger-subtle", "text-danger-emphasis"]
      : buildStatus === "in_progress"
      ? ["border-warning", "bg-warning-subtle", "text-warning-emphasis"]
      : buildStatus === "succeeded"
      ? ["border-success", "bg-success-subtle", "text-success-emphasis"]
      : ["border-danger", "bg-danger-subtle", "text-danger-emphasis"];

  return (
    <Badge pill className={cx("border", badgeColorClasses)}>
      {badgeIcon}
      {badgeText && <span className="fw-normal">{badgeText}</span>}
    </Badge>
  );
}

interface BuildStatusDescriptionProps {
  status?: Build["status"];
  createdAt?: Build["created_at"];
  completedAt?: CreationDate;
  isOldImage?: boolean;
}
export function BuildStatusDescription({
  status,
  createdAt,
  completedAt,
  isOldImage,
}: BuildStatusDescriptionProps) {
  if (!status) return null;

  const startTimeText = (
    <TimeCaption datetime={createdAt} enableTooltip noCaption />
  );

  const completedTimeText = completedAt && (
    <TimeCaption datetime={completedAt} enableTooltip noCaption />
  );

  return status === "succeeded" && isOldImage ? (
    <div className={cx("d-flex", "gap-2", "time-caption")}>
      <ExclamationTriangleFill
        size="16"
        className={cx("flex-shrink-0", "text-warning-emphasis")}
      />
      <span className="text-warning-emphasis">
        Last successfully built {completedTimeText}
      </span>
    </div>
  ) : status === "succeeded" ? (
    <div
      className={cx("d-flex", "align-items-center", "gap-2", "time-caption")}
    >
      <Clock size="16" className="flex-shrink-0" />
      <span>Last successfully built {completedTimeText}</span>
    </div>
  ) : status === "in_progress" ? (
    <div
      className={cx("d-flex", "align-items-center", "gap-2", "time-caption")}
    >
      <Clock size="16" className="flex-shrink-0" />
      <span>Building since {startTimeText}</span>
    </div>
  ) : status === "failed" ? (
    <div
      className={cx("d-flex", "align-items-center", "gap-2", "time-caption")}
    >
      <XCircle size="16" className="flex-shrink-0" />
      <span>Build failed {startTimeText}</span>
    </div>
  ) : null;
}

interface BuildActionFailedModalProps {
  error: FetchBaseQueryError | SerializedError | undefined;
  reset: () => void;
  title: ReactNode;
}

export function BuildActionFailedModal({
  error,
  reset,
  title,
}: BuildActionFailedModalProps) {
  return (
    <ScrollableModal
      backdrop="static"
      centered
      isOpen={error != null}
      size="lg"
      toggle={reset}
    >
      <ModalHeader tag="h2" toggle={reset}>
        {title}
      </ModalHeader>
      <ModalBody>
        <RtkOrDataServicesError error={error} dismissible={false} />
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={reset}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

interface BuildLogsModalProps {
  builds: BuildList | undefined;
  isOpen: boolean;
  toggle: () => void;
}

export function BuildLogsModal({
  builds,
  isOpen,
  toggle,
}: BuildLogsModalProps) {
  const lastBuild = builds?.at(0);
  const name = lastBuild?.id ?? "build_logs";
  const inProgressBuild = useMemo(
    () => builds?.find(({ status }) => status === "in_progress"),
    [builds]
  );
  const hasInProgressBuild = !!inProgressBuild;

  // const [logs, setLogs] = useState<ILogs>({
  //   data: {},
  //   fetched: false,
  //   fetching: false,
  //   show: isOpen,
  // });

  // const { data, isFetching, refetch } = useGetBuildLogsQuery(
  //   isOpen && lastBuild
  //     ? {
  //         buildId: lastBuild.id,
  //       }
  //     : skipToken
  // );
  // const fetchLogs = useCallback(
  //   () =>
  //     refetch().then((result) => {
  //       if (result.error) {
  //         throw result.error;
  //       }
  //       if (result.data == null) {
  //         throw new Error("Could not retrieve logs");
  //       }
  //       return result.data;
  //     }),
  //   [refetch]
  // );

  // useEffect(() => {
  //   setLogs((prevState) => ({ ...prevState, show: isOpen ? name : false }));
  // }, [isOpen, name]);
  // useEffect(() => {
  //   setLogs((prevState) => ({ ...prevState, fetching: isFetching }));
  // }, [isFetching]);
  // useEffect(() => {
  //   setLogs((prevState) => ({
  //     ...prevState,
  //     fetched: !!data,
  //     data: data ? data : {},
  //   }));
  // }, [data]);

  if (lastBuild == null) {
    return null;
  }

  return null;
  // <EnvironmentLogsPresent
  //   fetchLogs={fetchLogs}
  //   toggleLogs={toggle}
  //   logs={logs}
  //   name={name}
  //   title={`${hasInProgressBuild ? "Current" : "Last"} build logs`}
  //   defaultTab="step-build-and-push"
  // />
}

interface BuildErrorReasonProps {
  build: Build;
}

export function BuildErrorReason({ build }: BuildErrorReasonProps) {
  const { error_reason, status } = build;

  if (status !== "failed") {
    return null;
  }

  // Note: We provide a help text for some of the error conditions for image builds.
  // See Shipwright's documentation for the error reasons:
  // https://shipwright.io/docs/build/buildrun/#understanding-the-state-of-a-buildrun
  const helpText =
    error_reason === "Failed" ? (
      <>
        The build process failed, consult the build logs and{" "}
        <ExternalLink role="link" url={IMAGE_BUILD_DOCS}>
          our documentation
          <BoxArrowUpRight className={cx("bi", "ms-1")} />
        </ExternalLink>{" "}
        to see how to fix the issue.
      </>
    ) : error_reason === "BuildRunTimeout" ? (
      <>
        The build process did not complete in time. Try to identify which
        packages may take too long to install or contact an administrator to see
        if builds can have longer timeouts.
      </>
    ) : error_reason === "StepOutOfMemory" ? (
      <>
        The build process ran out of memory. Try to identify which packages may
        cause issues or contact an administrator to see if builds can have
        access to more memory.
      </>
    ) : error_reason === "BuildRegistrationFailed" ? (
      <>
        The container image build has an invalid configuration. Contact an
        administrator to learn more.
      </>
    ) : null;

  return (
    <Col xs={12} className={cx("d-flex", "flex-column", "py-2", "gap-2")}>
      <div className={cx("alert", "alert-danger", "m-0")}>
        <div className="d-block">
          <label className={cx("text-nowrap", "mb-0", "me-2")}>
            Error reason:
          </label>
          <code className={cx("text-danger-emphasis", "fw-bold")}>
            {error_reason}
          </code>
        </div>
        {helpText && <p className="mb-0">{helpText}</p>}
      </div>
    </Col>
  );
}

export interface BuildActionsProps {
  launcher: SessionLauncher;
  isMainButton?: boolean;
  otherActions?: ReactNode;
}

export function BuildActions({ launcher }: BuildActionsProps) {
  const { project_id: projectId } = launcher;
  const permissions = useProjectPermissions({ projectId });

  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const toggleLogs = useCallback(() => {
    setIsLogsOpen((open) => !open);
  }, []);

  const { data: builds } = useGetBuildsQuery(
    launcher.environment.environment_image_source === "build"
      ? { environmentId: launcher.environment.id }
      : skipToken
  );
  const inProgressBuild = useMemo(
    () => builds?.find(({ status }) => status === "in_progress"),
    [builds]
  );
  const hasInProgressBuild = !!inProgressBuild;

  const [postBuild, postResult] = usePostBuildMutation();
  const triggerBuild = useCallback(() => {
    postBuild({ environmentId: launcher.environment.id });
  }, [launcher.environment.id, postBuild]);

  const [patchBuild, patchResult] = usePatchBuildMutation();
  const onCancelBuild = useCallback(() => {
    if (inProgressBuild != null) {
      patchBuild({
        buildId: inProgressBuild?.id,
        buildPatch: { status: "cancelled" },
      });
    }
  }, [inProgressBuild, patchBuild]);

  const defaultAction = hasInProgressBuild ? (
    <Button
      className="text-nowrap"
      color="outline-primary"
      data-cy="session-view-menu-cancel-build"
      onClick={onCancelBuild}
      size="sm"
    >
      <XOctagon className={cx("bi", "me-1")} />
      Cancel build
    </Button>
  ) : (
    <Button
      className="text-nowrap"
      color="outline-primary"
      data-cy="session-view-menu-rebuild"
      onClick={triggerBuild}
      size="sm"
    >
      <BootstrapReboot className={cx("bi", "me-1")} />
      Rebuild
    </Button>
  );

  const buttonGroup =
    builds && builds.length > 0 ? (
      <ButtonWithMenuV2
        color="outline-primary"
        default={defaultAction}
        preventPropagation
        size="sm"
      >
        <DropdownItem
          data-cy="session-view-menu-show-last-build-logs"
          onClick={toggleLogs}
        >
          <FileEarmarkText className={cx("bi", "me-1")} />
          Show logs
        </DropdownItem>
      </ButtonWithMenuV2>
    ) : (
      defaultAction
    );

  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <>
            {buttonGroup}
            <BuildActionFailedModal
              error={postResult.error}
              reset={postResult.reset}
              title="Error: could not rebuild session image"
            />
            <BuildActionFailedModal
              error={patchResult.error}
              reset={patchResult.reset}
              title="Error: could not cancel image build"
            />
            <BuildLogsModal
              builds={builds}
              isOpen={isLogsOpen}
              toggle={toggleLogs}
            />
          </>
        }
        requestedPermission="write"
        userPermissions={permissions}
      />
    </>
  );
}
