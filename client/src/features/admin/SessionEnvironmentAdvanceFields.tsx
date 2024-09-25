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

import cx from "classnames";
import { useCallback, useState } from "react";
import { Control, FieldErrors } from "react-hook-form";
import { Collapse } from "reactstrap";
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { AdvanceSettingsFields } from "../sessionsV2/components/SessionForm/AdvanceSettingsFields";
import { SessionEnvironmentForm } from "./SessionEnvironmentFormContent";

interface SessionEnvironmentAdvanceFieldsProps {
  control: Control<SessionEnvironmentForm, unknown>;
  errors: FieldErrors<SessionEnvironmentForm>;
}

export default function SessionEnvironmentAdvanceFields({
  control,
  errors,
}: SessionEnvironmentAdvanceFieldsProps) {
  const [isAdvanceSettingOpen, setIsAdvanceSettingsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setIsAdvanceSettingsOpen((isAdvanceSettingOpen) => !isAdvanceSettingOpen),
    []
  );
  return (
    <>
      <div>
        <span
          className={cx("fw-bold", "cursor-pointer")}
          onClick={toggleIsOpen}
        >
          Advance settings <ChevronFlippedIcon flipped={isAdvanceSettingOpen} />
        </span>
      </div>
      <Collapse isOpen={isAdvanceSettingOpen}>
        <div className="mt-3">
          <AdvanceSettingsFields<SessionEnvironmentForm>
            control={control}
            errors={errors}
          />
        </div>
      </Collapse>
    </>
  );
}
