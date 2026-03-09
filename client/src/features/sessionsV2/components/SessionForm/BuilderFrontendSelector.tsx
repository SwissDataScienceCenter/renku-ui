/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useEffect, useMemo } from "react";
import {
  useController,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "reactstrap";

/* eslint-disable spellcheck/spell-checker */
import {
  BUILDER_FRONTEND_COMBINATIONS,
  BUILDER_FRONTENDS,
  getCompatibleFrontends,
} from "../../session.constants";
/* eslint-enable spellcheck/spell-checker */
import BuilderSelectorCommon from "./BuilderSelectorCommon";

interface BuilderFrontendSelectorProps<T extends FieldValues>
  extends UseControllerProps<T> {
  control: Control<T>;
}

export default function BuilderFrontendSelector<T extends FieldValues>({
  control,
  ...controllerProps
}: BuilderFrontendSelectorProps<T>) {
  const builderVariant = useWatch({
    control,
    name: "builder_variant" as Path<T>,
  }) as string;

  /* eslint-disable spellcheck/spell-checker */
  const {
    field: { onBlur, onChange, value: currentFrontend, disabled },
    fieldState: { error },
  } = useController({
    control,
    ...controllerProps,
    rules: controllerProps.rules ?? {
      required: "Please select an environment type.",
    },
  });

  const compatibleFrontends = useMemo(() => {
    const compatible = getCompatibleFrontends(builderVariant);
    return BUILDER_FRONTENDS.filter((f) => compatible.includes(f.value));
  }, [builderVariant]);

  const isCompatible =
    BUILDER_FRONTEND_COMBINATIONS[builderVariant]?.includes(currentFrontend) ??
    true;

  useEffect(() => {
    if (!isCompatible && compatibleFrontends.length > 0) {
      onChange(compatibleFrontends[0].value);
    }
  }, [isCompatible, compatibleFrontends, onChange]);

  const defaultOption = useMemo(
    () => compatibleFrontends[0] ?? BUILDER_FRONTENDS[0],
    [compatibleFrontends]
  );

  return (
    <div>
      <Label for="builder-environment-frontend-select-input">
        User interface
      </Label>
      <div
        className={cx(error && "is-invalid")}
        data-cy="environment-type-select"
      >
        <BuilderSelectorCommon
          defaultValue={defaultOption}
          disabled={disabled}
          id="builder-environment-frontend-select"
          inputId="builder-environment-frontend-select-input"
          name={controllerProps.name}
          onBlur={onBlur}
          onChange={onChange}
          options={compatibleFrontends}
          value={currentFrontend}
        />
      </div>
      <div className="invalid-feedback">
        {error?.message ? (
          <>{error.message}</>
        ) : (
          <>Please select a valid environment type.</>
        )}
      </div>
    </div>
  );
  /* eslint-enable spellcheck/spell-checker */
}
