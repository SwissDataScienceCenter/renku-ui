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
import { useContext } from "react";
import { Control, Controller } from "react-hook-form";
import { ButtonGroup } from "reactstrap";
import AppContext from "../../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../../utils/context/appParams.constants";
import { SessionLauncherForm } from "../../sessionsV2.types";

interface EnvironmentKindFieldProps {
  control: Control<SessionLauncherForm>;
}
export default function EnvironmentKindField({
  control,
}: EnvironmentKindFieldProps) {
  const { params } = useContext(AppContext);
  const imageBuildersEnabled =
    params?.IMAGE_BUILDERS_ENABLED ?? DEFAULT_APP_PARAMS.IMAGE_BUILDERS_ENABLED;

  return (
    <Controller
      control={control}
      name="environmentSelect"
      render={({ field }) => (
        <div className={cx("d-flex", "gap-4")}>
          <ButtonGroup size="sm">
            <input
              type="radio"
              className="btn-check"
              name={field.name}
              autoComplete="off"
              checked={field.value === "global"}
              id="environment-kind-global-radio"
              onChange={() => field.onChange("global")}
              onBlur={field.onBlur}
            />
            <label
              className={cx("btn", "btn-outline-primary")}
              data-cy="environment-kind-global"
              htmlFor="environment-kind-global-radio"
            >
              Global environment
            </label>

            <input
              type="radio"
              className="btn-check"
              name={field.name}
              autoComplete="off"
              checked={field.value === "custom + image"}
              id="environment-kind-custom-radio"
              onChange={() => field.onChange("custom + image")}
              onBlur={field.onBlur}
            />
            <label
              className={cx("btn", "btn-outline-primary")}
              data-cy="environment-kind-custom"
              htmlFor="environment-kind-custom-radio"
            >
              Custom Environment
            </label>

            {imageBuildersEnabled && (
              <>
                <input
                  type="radio"
                  className="btn-check"
                  name={field.name}
                  autoComplete="off"
                  checked={field.value === "custom + build"}
                  id="environment-kind-builder-radio"
                  onChange={() => field.onChange("custom + build")}
                  onBlur={field.onBlur}
                />
                <label
                  className={cx("btn", "btn-outline-primary")}
                  htmlFor="environment-kind-builder-radio"
                >
                  Create from code
                </label>
              </>
            )}
          </ButtonGroup>
        </div>
      )}
    />
  );
}
