/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useCallback, useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { SuccessAlert } from "~/components/Alert";
import { computeResourcesApi } from "../../api/computeResources.api";
import type { SessionLauncher } from "../../api/sessionLaunchersV2.api";
import { safeStringify } from "../../session.utils";
import { EnvironmentCode } from "../EnvironmentCode";
import { LauncherEnvironmentIcon } from "../SessionForm/LauncherEnvironmentIcon";
import { SessionRowResourceRequests } from "../SessionsList";

interface SubmitJobModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  toggle: () => void;
}

function getEnvironmentKindLabel(launcher: SessionLauncher) {
  const { environment } = launcher;
  if (environment.environment_kind === "GLOBAL") {
    return "Global environment";
  }
  if (environment.environment_image_source === "build") {
    return "Code based environment";
  }
  return "External image environment";
}

function getEnvironmentDetail(launcher: SessionLauncher) {
  const { environment } = launcher;
  if (environment.environment_kind === "GLOBAL") {
    return environment.name;
  }
  if (environment.environment_image_source === "build") {
    return environment.build_parameters?.repository;
  }
  return environment.container_image;
}

export default function SubmitJobModal({
  isOpen,
  launcher,
  toggle,
}: SubmitJobModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: resourcePools } =
    computeResourcesApi.endpoints.getResourcePools.useQueryState({});

  const resourcePool = useMemo(
    () =>
      resourcePools?.find((pool) =>
        pool.classes.some(({ id }) => id === launcher.resource_class_id)
      ),
    [launcher.resource_class_id, resourcePools]
  );

  const resourceClass = useMemo(() => {
    if (resourcePools == null) {
      return undefined;
    }
    return resourcePools
      .flatMap((pool) => pool.classes)
      .find(({ id }) => id === launcher.resource_class_id);
  }, [launcher.resource_class_id, resourcePools]);

  const environmentDetail = getEnvironmentDetail(launcher);
  const { environment } = launcher;
  const commandValue = environment.command
    ? safeStringify(environment.command)
    : "-";
  const argsValue = environment.args ? safeStringify(environment.args) : "-";

  const handleToggle = useCallback(() => {
    setIsSubmitted(false);
    toggle();
  }, [toggle]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  const sectionHeadingClass = cx("fs-6", "fw-bold", "mb-2");

  return (
    <Modal
      backdrop="static"
      centered
      data-cy="submit-job-modal"
      isOpen={isOpen}
      size="lg"
      toggle={handleToggle}
    >
      <ModalHeader tag="h2" toggle={handleToggle}>
        Review and submit Job
      </ModalHeader>
      <ModalBody>
        {isSubmitted ? (
          <SuccessAlert dismissible={false} timeout={0}>
            <p className="mb-0">
              Job submission preview completed. Backend execution is not yet
              available.
            </p>
          </SuccessAlert>
        ) : (
          <div className={cx("d-flex", "flex-column", "gap-3")}>
            <div>
              <h3 className={sectionHeadingClass}>Environment</h3>
              <div
                className={cx("d-flex", "align-items-center", "gap-2")}
                data-cy="submit-job-environment"
              >
                <LauncherEnvironmentIcon launcher={launcher} />
                <span>{getEnvironmentKindLabel(launcher)}</span>
              </div>
              {environmentDetail != null && environmentDetail !== "" && (
                <div className={cx("mt-1", "text-break")}>
                  {environmentDetail}
                </div>
              )}
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Launcher name</h3>
              <div data-cy="submit-job-launcher-name">{launcher.name}</div>
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Command</h3>
              <div data-cy="submit-job-command">
                <EnvironmentCode value={commandValue} />
              </div>
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Command Arguments</h3>
              <div data-cy="submit-job-command-arguments">
                <EnvironmentCode value={argsValue} />
              </div>
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Resource class</h3>
              <div data-cy="submit-job-resource-class">
                {resourceClass ? (
                  <SessionRowResourceRequests
                    resourceRequests={{
                      poolName: resourcePool?.name,
                      name: resourceClass.name,
                      cpu: resourceClass.cpu,
                      memory: resourceClass.memory,
                      storage:
                        launcher.disk_storage ?? resourceClass.default_storage,
                      gpu: resourceClass.gpu,
                    }}
                  />
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={handleToggle}>
          {isSubmitted ? "Close" : "Cancel"}
        </Button>
        {!isSubmitted && (
          <Button
            color="primary"
            data-cy="submit-job-confirm-button"
            onClick={handleSubmit}
          >
            Submit Job
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
