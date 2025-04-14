/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  ButtonGroup,
  Card,
  CardBody,
  Col,
  DropdownItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";

import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { ErrorLabel } from "../../../components/formlabels/FormLabels";
import { Loader } from "../../../components/Loader";
import { type ILogs, EnvironmentLogsPresent } from "../../../components/Logs";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import { TimeCaption } from "../../../components/TimeCaption.tsx";
import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import useProjectPermissions from "../../ProjectPageV2/utils/useProjectPermissions.hook";
import type {
  Build,
  BuildList,
  SessionLauncher,
} from "../api/sessionLaunchersV2.api";
import {
  CreationDate,
  sessionLaunchersV2Api,
  useGetBuildsByBuildIdLogsQuery as useGetBuildLogsQuery,
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
  usePatchBuildsByBuildIdMutation as usePatchBuildMutation,
  usePostEnvironmentsByEnvironmentIdBuildsMutation as usePostBuildMutation,
} from "../api/sessionLaunchersV2.api";
import { EnvironmentIcon } from "../components/SessionForm/LauncherEnvironmentIcon.tsx";
import {
  BUILDER_IMAGE_NOT_READY_VALUE,
  IMAGE_BUILD_DOCS,
} from "../session.constants";
import { safeStringify } from "../session.utils";

export function EnvironmentCard({ launcher }: { launcher: SessionLauncher }) {
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const environment = launcher.environment;

  if (!environment) {
    return null;
  }

  const { environment_kind, name } = environment;
  const cardName = environment_kind === "GLOBAL" ? name || "" : launcher.name;

  const buildActions = imageBuildersEnabled &&
    launcher.environment.environment_kind === "CUSTOM" &&
    launcher.environment.environment_image_source === "build" && (
      <BuildActions launcher={launcher} />
    );

  return (
    <>
      <Card className={cx("border")}>
        <CardBody className={cx("d-flex", "flex-column")}>
          <Row>
            <Col
              xs={12}
              className={cx(
                "d-flex",
                "flex-wrap",
                "flex-sm-nowrap",
                "align-items-start",
                "justify-content-between",
                "pb-2",
                "gap-2"
              )}
            >
              <h5 className={cx("fw-bold", "mb-0", "text-break")}>
                <small>{cardName}</small>
              </h5>
              {buildActions}
            </Col>
            <EnvironmentRow>
              {environment.environment_kind === "GLOBAL" ? (
                <>
                  <EnvironmentIcon type="global" />
                  Global environment
                </>
              ) : environment.environment_image_source === "build" ? (
                <>
                  <EnvironmentIcon type="codeBased" size={16} />
                  Code based environment
                </>
              ) : (
                <>
                  <EnvironmentIcon type="custom" size={16} />
                  Custom image environment
                </>
              )}
            </EnvironmentRow>
            {environment_kind === "GLOBAL" && (
              <>
                <EnvironmentRow>
                  {environment?.description ? (
                    <p>{environment.description}</p>
                  ) : (
                    <p className="fst-italic mb-0">No description</p>
                  )}
                </EnvironmentRow>
                <EnvironmentRowWithLabel
                  label="Container image"
                  value={environment?.container_image || ""}
                />
                <EnvironmentRow>
                  <Clock size="16" className="flex-shrink-0" />
                  Created by <strong>Renku</strong> on{" "}
                  {toHumanDateTime({
                    datetime: launcher.creation_date,
                    format: "date",
                  })}
                </EnvironmentRow>
              </>
            )}
            {environment_kind === "CUSTOM" && (
              <>
                <CustomEnvironmentValues launcher={launcher} />
              </>
            )}
          </Row>
        </CardBody>
      </Card>
    </>
  );
}

function CustomEnvironmentValues({ launcher }: { launcher: SessionLauncher }) {
  const { environment } = launcher;

  if (environment.environment_image_source === "image") {
    return <CustomImageEnvironmentValues launcher={launcher} />;
  }

  return <CustomBuildEnvironmentValues launcher={launcher} />;
}

function CustomImageEnvironmentValues({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  const environment = launcher.environment;

  if (environment.environment_kind !== "CUSTOM") {
    return null;
  }

  return (
    <>
      <EnvironmentRowWithLabel
        label="Container image"
        value={environment?.container_image || ""}
      />
      <EnvironmentRowWithLabel
        label="Default URL path"
        value={environment.default_url}
      />
      <EnvironmentRowWithLabel label="Port" value={environment.port} />
      <EnvironmentRowWithLabel
        label="Working directory"
        value={environment.working_directory}
      />
      <EnvironmentRowWithLabel
        label="Mount directory"
        value={environment.mount_directory}
      />
      <EnvironmentRowWithLabel label="UID" value={environment.uid} />
      <EnvironmentRowWithLabel label="GID" value={environment.gid} />
      <EnvironmentJSONArrayRowWithLabel
        label="Command"
        value={safeStringify(environment.command)}
      />
      <EnvironmentJSONArrayRowWithLabel
        label="Args"
        value={safeStringify(environment.args)}
      />
    </>
  );
}

function CustomBuildEnvironmentValues({
  launcher,
}: {
  launcher: SessionLauncher;
}) {
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  const { environment } = launcher;

  const {
    data: builds,
    isLoading,
    error,
  } = useGetBuildsQuery(
    imageBuildersEnabled && environment.environment_image_source === "build"
      ? { environmentId: environment.id }
      : skipToken
  );

  const lastBuild = builds?.at(0);

  sessionLaunchersV2Api.endpoints.getEnvironmentsByEnvironmentIdBuilds.useQuerySubscription(
    lastBuild?.status === "in_progress"
      ? { environmentId: environment.id }
      : skipToken,
    {
      pollingInterval: 1_000,
    }
  );

  // Invalidate launchers if the container image is not the same as the
  // image from the last successful build
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (
      lastBuild?.status === "succeeded" &&
      lastBuild.result.image !== launcher.environment.container_image
    ) {
      dispatch(sessionLaunchersV2Api.endpoints.invalidateLaunchers.initiate());
    }
  }, [dispatch, lastBuild, launcher.environment.container_image]);

  if (environment.environment_image_source !== "build") {
    return null;
  }

  const { build_parameters } = environment;
  const { builder_variant, frontend_variant, repository } = build_parameters;

  return (
    <>
      <EnvironmentRow>
        {environment.container_image === BUILDER_IMAGE_NOT_READY_VALUE ? (
          <NotReadyStatusBadge />
        ) : (
          <ReadyStatusBadge />
        )}
      </EnvironmentRow>
      {!imageBuildersEnabled && (
        <EnvironmentRow>
          <p className={cx("mb-0", "alert", "alert-danger")}>
            This session environment is not currently supported by this instance
            of RenkuLab. Contact an administrator to learn more.
          </p>
        </EnvironmentRow>
      )}
      <EnvironmentRow>
        {isLoading ? (
          <span>
            <Loader className="me-1" inline size={16} />
            Loading build status...
          </span>
        ) : error || !builds ? (
          <div>
            <p className="mb-0">Error: could not load build status</p>
            {error && <RtkOrNotebooksError error={error} dismissible={false} />}
          </div>
        ) : lastBuild == null ? (
          <span className="fst-italic">
            This session environment does not have a build yet.
          </span>
        ) : (
          <div className="d-block">
            <label className={cx("text-nowrap", "mb-0", "me-2")}>
              Last build status:
            </label>
            <span>
              <BuildStatusBadge status={lastBuild.status} />
            </span>
          </div>
        )}
      </EnvironmentRow>

      {lastBuild && lastBuild.status === "failed" && (
        <BuildErrorReason build={lastBuild} />
      )}
      <EnvironmentRowWithLabel
        label="Built from code repository"
        value={repository || ""}
      />
      <EnvironmentRowWithLabel
        label="Environment type"
        value={builder_variant || ""}
      />
      <EnvironmentRowWithLabel
        label="User interface"
        value={frontend_variant || ""}
      />

      {environment.container_image !== BUILDER_IMAGE_NOT_READY_VALUE && (
        <CustomImageEnvironmentValues launcher={launcher} />
      )}
    </>
  );
}

function EnvironmentRow({ children }: { children?: ReactNode }) {
  return (
    <Col
      xs={12}
      className={cx("d-flex", "align-items-center", "py-2", "gap-2")}
    >
      {children}
    </Col>
  );
}

function EnvironmentRowWithLabel({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <EnvironmentRow>
      <div className="d-block">
        <label className={cx("text-nowrap", "mb-0", "me-2")}>{label}:</label>
        <code>{value ?? "-"}</code>
      </div>
    </EnvironmentRow>
  );
}

function EnvironmentJSONArrayRowWithLabel({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <EnvironmentRow>
      <div className="d-block">
        <label className={cx("text-nowrap", "mb-0", "me-2")}>{label}:</label>
        {value === null ? (
          <ErrorLabel text={"Invalid JSON array value"} />
        ) : (
          <code> {value} </code>
        )}
      </div>
    </EnvironmentRow>
  );
}

function ReadyStatusBadge() {
  return (
    <Badge
      className={cx(
        "border",
        "bg-success-subtle",
        "border-success",
        "text-success-emphasis",
        "fs-small",
        "fw-normal"
      )}
      pill
    >
      <CircleFill className={cx("bi", "me-1")} />
      Ready
    </Badge>
  );
}

function NotReadyStatusBadge() {
  return (
    <Badge
      className={cx(
        "border",
        "bg-danger-subtle",
        "border-danger",
        "text-danger-emphasis",
        "fs-small",
        "fw-normal"
      )}
      pill
    >
      <CircleFill className={cx("bi", "me-1")} />
      Not ready
    </Badge>
  );
}

interface BuildStatusBadgeProps {
  status: Build["status"];
}

export function BuildStatusBadge({ status }: BuildStatusBadgeProps) {
  const badgeIcon =
    status === "in_progress" ? (
      <Loader className="me-1" inline size={12} />
    ) : (
      <CircleFill className={cx("me-1", "bi")} />
    );

  const badgeText =
    status === "in_progress"
      ? "Build in progress"
      : status === "cancelled"
      ? "Build cancelled"
      : status === "succeeded"
      ? "Build succeeded"
      : "Build failed";

  const badgeColorClasses =
    status === "in_progress"
      ? ["border-warning", "bg-warning-subtle", "text-warning-emphasis"]
      : status === "succeeded"
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

interface BuildActionsProps {
  launcher: SessionLauncher;
  isMainButton?: boolean;
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
      {"Rebuild"}
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

export function BuildActionsCard({
  launcher,
  isMainButton = true,
}: BuildActionsProps) {
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

  if (launcher.environment.environment_image_source !== "build") return null;

  const onClickFix = (e: React.MouseEvent) => e.stopPropagation();

  const buttons = hasInProgressBuild ? (
    <>
      <Button
        className="text-nowrap"
        color="outline-primary"
        data-cy="session-view-menu-show-logs"
        onClick={toggleLogs}
        size="sm"
      >
        <FileEarmarkText className={cx("bi", "me-1")} />
        Logs
      </Button>
      <Button
        className="text-nowrap"
        color={isMainButton ? "primary" : "outline-primary"}
        data-cy="session-view-menu-cancel-build"
        onClick={onCancelBuild}
        size="sm"
      >
        <XOctagon className={cx("bi", "me-1")} />
        Cancel build
      </Button>
    </>
  ) : (
    <>
      <Button
        className="text-nowrap"
        color="outline-primary"
        data-cy="session-view-menu-show-logs"
        onClick={toggleLogs}
        size="sm"
      >
        <FileEarmarkText className={cx("bi", "me-1")} />
        Logs
      </Button>
      <Button
        className="text-nowrap"
        color={isMainButton ? "primary" : "outline-primary"}
        data-cy="session-view-menu-rebuild"
        onClick={triggerBuild}
        size="sm"
      >
        <BootstrapReboot className={cx("bi", "me-1")} />
        {"Rebuild"}
      </Button>
    </>
  );

  const groupButtons = isMainButton ? (
    <ButtonGroup onClick={onClickFix}>{buttons}</ButtonGroup>
  ) : (
    buttons
  );

  return (
    <>
      <PermissionsGuard
        disabled={null}
        enabled={
          <>
            {groupButtons}
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

interface BuildActionFailedModalProps {
  error: FetchBaseQueryError | SerializedError | undefined;
  reset: () => void;
  title: ReactNode;
}

function BuildActionFailedModal({
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
      <ModalHeader toggle={reset}>{title}</ModalHeader>
      <ModalBody>
        <RtkOrNotebooksError error={error} dismissible={false} />
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

function BuildLogsModal({ builds, isOpen, toggle }: BuildLogsModalProps) {
  const lastBuild = builds?.at(0);
  const name = lastBuild?.id ?? "build_logs";
  const inProgressBuild = useMemo(
    () => builds?.find(({ status }) => status === "in_progress"),
    [builds]
  );
  const hasInProgressBuild = !!inProgressBuild;

  const [logs, setLogs] = useState<ILogs>({
    data: {},
    fetched: false,
    fetching: false,
    show: isOpen,
  });

  const { data, isFetching, refetch } = useGetBuildLogsQuery(
    isOpen && lastBuild
      ? {
          buildId: lastBuild.id,
        }
      : skipToken
  );
  const fetchLogs = useCallback(
    () =>
      refetch().then((result) => {
        if (result.error) {
          throw result.error;
        }
        if (result.data == null) {
          throw new Error("Could not retrieve logs");
        }
        return result.data;
      }),
    [refetch]
  );

  useEffect(() => {
    setLogs((prevState) => ({ ...prevState, show: isOpen ? name : false }));
  }, [isOpen, name]);
  useEffect(() => {
    setLogs((prevState) => ({ ...prevState, fetching: isFetching }));
  }, [isFetching]);
  useEffect(() => {
    setLogs((prevState) => ({
      ...prevState,
      fetched: !!data,
      data: data ? data : {},
    }));
  }, [data]);

  if (lastBuild == null) {
    return null;
  }

  return (
    <EnvironmentLogsPresent
      fetchLogs={fetchLogs}
      toggleLogs={toggle}
      logs={logs}
      name={name}
      title={`${hasInProgressBuild ? "Current" : "Last"} build logs`}
      defaultTab="step-build-and-push"
    />
  );
}

interface BuildErrorReasonProps {
  build: Build;
}

function BuildErrorReason({ build }: BuildErrorReasonProps) {
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
