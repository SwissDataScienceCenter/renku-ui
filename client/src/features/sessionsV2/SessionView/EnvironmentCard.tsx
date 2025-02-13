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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { ReactNode, useEffect } from "react";
import {
  Bricks,
  CircleFill,
  Clock,
  Globe2,
  Link45deg,
} from "react-bootstrap-icons";
import { Badge, Card, CardBody, Col, Row } from "reactstrap";

import { Loader } from "../../../components/Loader";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { ErrorLabel } from "../../../components/formlabels/FormLabels";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import type { Build, SessionLauncher } from "../api/sessionLaunchersV2.api";
import {
  sessionLaunchersV2Api,
  useGetEnvironmentsByEnvironmentIdBuildsQuery as useGetBuildsQuery,
} from "../api/sessionLaunchersV2.api";
import { BUILDER_IMAGE_NOT_READY_VALUE } from "../session.constants";
import { safeStringify } from "../session.utils";

export function EnvironmentCard({ launcher }: { launcher: SessionLauncher }) {
  const environment = launcher.environment;
  if (!environment) return null;
  const { environment_kind, name } = environment;
  const cardName = environment_kind === "GLOBAL" ? name || "" : launcher.name;

  return (
    <>
      <Card className={cx("border")}>
        <CardBody className={cx("d-flex", "flex-column")}>
          <Row>
            <EnvironmentRow>
              <h5 className={cx("fw-bold", "mb-0")}>
                <small>{cardName}</small>
              </h5>
            </EnvironmentRow>
            <EnvironmentRow>
              {environment.environment_kind === "GLOBAL" ? (
                <>
                  <Globe2 size={24} />
                  Global environment
                </>
              ) : environment.environment_image_source === "build" ? (
                <>
                  <Bricks size={24} />
                  Built by RenkuLab
                </>
              ) : (
                <>
                  <Link45deg size={24} />
                  Custom image
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
  const { environment } = launcher;

  const {
    data: builds,
    isLoading,
    error,
  } = useGetBuildsQuery(
    environment.environment_image_source === "build"
      ? { environmentId: environment.id }
      : skipToken
  );

  const lastBuild = builds?.at(0);

  sessionLaunchersV2Api.endpoints.getEnvironmentsByEnvironmentIdBuilds.useQuerySubscription(
    lastBuild?.status === "in_progress"
      ? { environmentId: environment.id }
      : skipToken,
    {
      // TODO: use 1 second once the backend has a k8s cache
      pollingInterval: 30_000,
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

      <EnvironmentRowWithLabel label="Repository" value={repository || ""} />
      <EnvironmentRowWithLabel
        label="Environment type"
        value={builder_variant || ""}
      />
      <EnvironmentRowWithLabel
        label="User interface"
        value={frontend_variant || ""}
      />

      {environment.container_image !== "image:unknown-at-the-moment" && (
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

function BuildStatusBadge({ status }: BuildStatusBadgeProps) {
  const badgeIcon =
    status === "in_progress" ? (
      <Loader className="me-1" inline size={12} />
    ) : (
      <CircleFill className={cx("me-1", "bi")} />
    );

  const badgeText =
    status === "in_progress"
      ? "In progress"
      : status === "cancelled"
      ? "Cancelled"
      : status === "succeeded"
      ? "Succeeded"
      : "Failed";

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
