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
import { useCallback, useState } from "react";
import { Send } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";

import type { Project } from "~/features/projectsV2/api/projectV2.api";
import type { SessionLauncher } from "../../../api/sessionLaunchersV2.api";
import JobSubmitModal from "../../SessionModals/JobSubmitModal";

export function jobSubmitButtonTargetId(launcherId: string) {
  return `launch-btn-${launcherId}`;
}

interface JobSubmitButtonProps {
  className?: string;
  disabled?: boolean;
  launcher: SessionLauncher;
  launcherId: string;
  project: Project;
  tooltip?: string;
}

export default function JobSubmitButton({
  className,
  disabled,
  launcher,
  launcherId,
  project,
  tooltip,
}: JobSubmitButtonProps) {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const targetId = jobSubmitButtonTargetId(launcherId);

  const toggleSubmit = useCallback(() => {
    setIsSubmitOpen((open) => !open);
  }, []);

  return (
    <>
      <span id={targetId}>
        <Button
          className={cx("text-nowrap", className)}
          color="primary"
          data-cy="submit-job-button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            toggleSubmit();
          }}
          size="sm"
        >
          <Send className={cx("bi", "me-1")} />
          Submit
        </Button>
      </span>
      {tooltip ? (
        <UncontrolledTooltip placement="top" target={targetId}>
          {tooltip}
        </UncontrolledTooltip>
      ) : null}
      <JobSubmitModal
        isOpen={isSubmitOpen}
        launcher={launcher}
        project={project}
        toggle={toggleSubmit}
      />
    </>
  );
}
