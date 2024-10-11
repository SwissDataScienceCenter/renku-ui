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
import {
  Control,
  FieldErrors,
  FieldNamesMarkedBoolean,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { SessionLauncherForm } from "../../sessionsV2.types";
import { CustomEnvironmentFields } from "./CustomEnvironmentFields";
import { EnvironmentKindField } from "./EnvironmentKindField";
import { GlobalEnvironmentFields } from "./GlobalEnvironmentFields";

export interface EnvironmentFieldsProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
  watch: UseFormWatch<SessionLauncherForm>;
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<SessionLauncherForm>>
  >;
  setValue: UseFormSetValue<SessionLauncherForm>;
}

export function EnvironmentFields({
  watch,
  control,
  errors,
  touchedFields,
  setValue,
}: EnvironmentFieldsProps) {
  const watchEnvironmentKind = watch("environment_kind");
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className={cx("form-label", "mb-0")}>
        <span className="fw-bold">1 of 2. Define environment</span>
      </div>
      <div>
        <EnvironmentKindField control={control} setValue={setValue} />
      </div>
      <div className={cx(watchEnvironmentKind !== "GLOBAL" && "d-none")}>
        <GlobalEnvironmentFields
          errors={errors}
          touchedFields={touchedFields}
          control={control}
          watch={watch}
          setValue={setValue}
        />
      </div>
      <div className={cx(watchEnvironmentKind !== "CUSTOM" && "d-none")}>
        <CustomEnvironmentFields
          errors={errors}
          touchedFields={touchedFields}
          control={control}
          watch={watch}
          setValue={setValue}
        />
      </div>
    </div>
  );
}
