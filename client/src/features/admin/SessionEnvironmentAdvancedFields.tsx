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

import CollapseBody from "~/components/container/CollapseBody";
import ChevronFlippedIcon from "../../components/icons/ChevronFlippedIcon";
import { AdvancedSettingsFields } from "../sessionsV2/components/SessionForm/AdvancedSettingsFields";
import { SessionEnvironmentForm } from "./SessionEnvironmentFormContent";

interface SessionEnvironmentAdvancedFieldsProps {
  control: Control<SessionEnvironmentForm, unknown>;
  errors: FieldErrors<SessionEnvironmentForm>;
}

export default function SessionEnvironmentAdvancedFields({
  control,
  errors,
}: SessionEnvironmentAdvancedFieldsProps) {
  const [isAdvancedSettingOpen, setIsAdvancedSettingsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () =>
      setIsAdvancedSettingsOpen(
        (isAdvancedSettingOpen) => !isAdvancedSettingOpen
      ),
    []
  );
  return (
    <>
      <div>
        <button
          className={cx(
            "align-items-center",
            "bg-transparent",
            "border-0",
            "d-flex",
            "fs-4",
            "fw-bold",
            "gap-1",
            "p-0",
            "w-100"
          )}
          type="button"
          onClick={toggleIsOpen}
        >
          Advanced settings{" "}
          <ChevronFlippedIcon flipped={isAdvancedSettingOpen} />
        </button>

        <Collapse isOpen={isAdvancedSettingOpen}>
          <CollapseBody className={cx("ms-0", "mt-4")}>
            <AdvancedSettingsFields<SessionEnvironmentForm>
              control={control}
              errors={errors}
            />
          </CollapseBody>
        </Collapse>
      </div>
    </>
  );
}
