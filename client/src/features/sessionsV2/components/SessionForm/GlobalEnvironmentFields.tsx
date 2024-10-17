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
import { Controller } from "react-hook-form";
import { Input, ListGroup } from "reactstrap";
import { WarnAlert } from "../../../../components/Alert";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { useGetSessionEnvironmentsQuery } from "../../sessionsV2.api";
import { EnvironmentFieldsProps } from "./EnvironmentField";
import { SessionEnvironmentItem } from "./SessionEnvironmentItem";

export function GlobalEnvironmentFields({
  watch,
  control,
  touchedFields,
  errors,
}: EnvironmentFieldsProps) {
  const {
    data: environments,
    error,
    isLoading,
  } = useGetSessionEnvironmentsQuery();
  const watchEnvironmentKind = watch("environment_kind");

  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <p className="mb-0">
        Reuse an environment already defined on RenkuLab to create an
        interactive session for your project
      </p>
      {isLoading && (
        <p>
          <Loader className="me-1" inline size={16} />
          Loading environments...
        </p>
      )}
      {error && (
        <>
          <p>Cannot load environments</p>
          <RtkErrorAlert dismissible={false} error={error} />
        </>
      )}
      {environments && environments.length === 0 && (
        <WarnAlert dismissible={false}>
          No existing environments available. Please contact an admin to update
          this list.
        </WarnAlert>
      )}
      {environments && environments.length > 0 && (
        <Controller
          control={control}
          name="environment_id"
          render={({ field }) => (
            <div>
              <Input
                className={cx(errors.environment_id && "is-invalid")}
                id="addSessionLauncherEnvironmentId"
                type="hidden"
                {...field}
              />
              <div className={cx("invalid-feedback", "mt-0")}>
                Please choose an environment
              </div>
              <ListGroup>
                {environments.map((environment) => (
                  <SessionEnvironmentItem
                    key={environment.id}
                    environment={environment}
                    field={field}
                    touchedFields={touchedFields}
                    errors={errors}
                    control={control}
                  />
                ))}
              </ListGroup>
            </div>
          )}
          rules={{
            required: watchEnvironmentKind === "GLOBAL",
          }}
        />
      )}
    </div>
  );
}
