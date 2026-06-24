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
import { Send } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import type { SessionLauncher } from "../api/sessionLaunchersV2.api";

interface SubmitJobLauncherActionProps {
  launcher: SessionLauncher;
  disabled?: boolean;
  className?: string;
}

export default function SubmitJobLauncherAction({
  disabled,
  className,
}: SubmitJobLauncherActionProps) {
  return (
    <>
      <Button
        className={cx("text-nowrap", className)}
        color="primary"
        data-cy="submit-job-button"
        onClick={(event) => {
          event.stopPropagation(); // TODO: implement action when submit a job in other PR
        }}
        size="sm"
        disabled={disabled}
      >
        <Send className={cx("bi", "me-1")} />
        Submit
      </Button>
    </>
  );
}
