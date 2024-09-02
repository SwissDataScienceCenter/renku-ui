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
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Button, ButtonGroup } from "reactstrap";
import { SessionLauncherForm } from "../../sessionsV2.types";

interface EnvironmentKindField {
  control: Control<SessionLauncherForm, unknown>;
  setValue: UseFormSetValue<SessionLauncherForm>;
}
export function EnvironmentKindField({
  control,
  setValue,
}: EnvironmentKindField) {
  return (
    <Controller
      control={control}
      name="environment_kind"
      render={({ field }) => (
        <div className={cx("d-flex", "gap-4")}>
          <ButtonGroup size="sm">
            <Button
              active={field.value === "GLOBAL"}
              data-cy="existing-global-button"
              onClick={() => setValue("environment_kind", "GLOBAL")}
              className={cx(
                field.value === "GLOBAL"
                  ? "text-white bg-primary"
                  : "text-primary bg-white"
              )}
            >
              Global environment
            </Button>
            <Button
              active={field.value === "CUSTOM"}
              data-cy="existing-custom-button"
              onClick={() => setValue("environment_kind", "CUSTOM")}
              className={cx(
                field.value === "CUSTOM"
                  ? "text-white bg-primary"
                  : "text-primary bg-white"
              )}
            >
              Custom Environment
            </Button>
          </ButtonGroup>
        </div>
      )}
    />
  );
}
