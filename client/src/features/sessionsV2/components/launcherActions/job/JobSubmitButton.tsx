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
import { useCallback, useRef } from "react";
import { Send } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";

import { getLaunchActionTooltip } from "~/features/sessionsV2/session.utils";
import { ImageStatus } from "~/features/sessionsV2/sessionsV2.types";

interface JobSubmitButtonProps {
  className?: string;
  disabled?: boolean;
  canWriteProject: boolean;
  imageStatus: ImageStatus;
}

export default function JobSubmitButton({
  className,
  disabled = false,
  imageStatus,
  canWriteProject,
}: JobSubmitButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipMessage = getLaunchActionTooltip(
    canWriteProject,
    imageStatus,
    "job",
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (disabled) {
        event.preventDefault();
      }
    },
    [disabled],
  );

  return (
    <>
      <Button
        innerRef={buttonRef}
        aria-disabled={disabled || undefined}
        className={cx("text-nowrap", className, disabled && "opacity-75")}
        color="primary"
        data-cy="submit-job-button"
        onClick={handleClick}
        size="sm"
        type="button"
      >
        <Send className={cx("bi", "me-1")} />
        Submit
      </Button>
      {tooltipMessage ? (
        <UncontrolledTooltip placement="top" target={buttonRef}>
          {tooltipMessage}
        </UncontrolledTooltip>
      ) : null}
    </>
  );
}
