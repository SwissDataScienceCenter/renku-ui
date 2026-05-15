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

import { ReactNode, useCallback, useState } from "react";
import { Button } from "reactstrap";

import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import type { SessionLauncher } from "../api/sessionLaunchersV2.api";
import SubmitJobModal from "./SessionModals/SubmitJobModal";

interface JobLauncherButtonsProps {
  launcher: SessionLauncher;
  otherActions?: ReactNode;
}

export default function JobLauncherButtons({
  launcher,
  otherActions,
}: JobLauncherButtonsProps) {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const toggleSubmit = useCallback(() => {
    setIsSubmitOpen((open) => !open);
  }, []);

  const defaultAction = (
    <Button
      className="text-nowrap"
      color="primary"
      data-cy="submit-job-button"
      onClick={(event) => {
        event.stopPropagation();
        toggleSubmit();
      }}
      size="sm"
    >
      Submit
    </Button>
  );

  return (
    <>
      <ButtonWithMenuV2
        color="primary"
        default={defaultAction}
        preventPropagation
        size="sm"
        isDisabledDropdownToggle={false}
      >
        {otherActions}
      </ButtonWithMenuV2>
      <SubmitJobModal
        isOpen={isSubmitOpen}
        launcher={launcher}
        toggle={toggleSubmit}
      />
    </>
  );
}
