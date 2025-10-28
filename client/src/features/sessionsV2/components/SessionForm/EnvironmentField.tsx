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
import BuilderEnvironmentFields from "./BuilderEnvironmentFields";
import { CustomEnvironmentFields } from "./CustomEnvironmentFields";
import EnvironmentKindField from "./EnvironmentKindField";
import { GlobalEnvironmentFields } from "./GlobalEnvironmentFields";

export interface EnvironmentFieldsProps {
  control: Control<SessionLauncherForm, unknown>;
  errors: FieldErrors<SessionLauncherForm>;
  setValue: UseFormSetValue<SessionLauncherForm>;
  touchedFields: Partial<
    Readonly<FieldNamesMarkedBoolean<SessionLauncherForm>>
  >;
  watch: UseFormWatch<SessionLauncherForm>;
}

export function EnvironmentFields({
  control,
  errors,
  setValue,
  touchedFields,
  watch,
}: EnvironmentFieldsProps) {
  const watchEnvironmentSelect = watch("environmentSelect");
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <h3 className="mb-0">1 of 2. Define environment</h3>
      <div>
        <EnvironmentKindField control={control} />
      </div>
      <div className={cx(watchEnvironmentSelect !== "global" && "d-none")}>
        <GlobalEnvironmentFields
          control={control}
          errors={errors}
          setValue={setValue}
          touchedFields={touchedFields}
          watch={watch}
        />
      </div>
      <div
        className={cx(watchEnvironmentSelect !== "custom + image" && "d-none")}
      >
        <CustomEnvironmentFields
          control={control}
          errors={errors}
          setValue={setValue}
          touchedFields={touchedFields}
          watch={watch}
        />
      </div>
      {watchEnvironmentSelect === "custom + build" && (
        <BuilderEnvironmentFields control={control} />
      )}
    </div>
  );
}
