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
import { useMemo } from "react";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import {
  useController,
  type Control,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "reactstrap";

import { ExternalLink } from "~/components/LegacyExternalLinks";
import { NEW_DOCS_CONFIG_AI_AGENTS } from "~/utils/constants/NewDocs";
import { CODING_AGENTS } from "../../session.constants";
import type { BuilderSelectorOption } from "../../sessionsV2.types";
import BuilderMultiSelectorCommon from "./BuilderMultiSelectorCommon";

interface BuilderAiAgentsSelectorProps<
  T extends FieldValues,
> extends UseControllerProps<T> {
  control: Control<T>;
}

const EMPTY_PLACEHOLDER = "No agents selected";

export default function BuilderAiAgentsSelector<T extends FieldValues>({
  control,
  ...controllerProps
}: BuilderAiAgentsSelectorProps<T>) {
  const {
    field: { onBlur, onChange, value, disabled },
    fieldState: { error },
  } = useController({ control, ...controllerProps });

  const selectedValues = useMemo(
    () => (Array.isArray(value) ? (value as string[]) : []),
    [value],
  );
  const options = useMemo(
    () => codingAgentOptions(selectedValues),
    [selectedValues],
  );

  return (
    <div>
      <Label for="builder-coding-agents-select-input">
        Coding agents{" "}
        <span className={cx("small", "text-muted", "fw-normal")}>
          (Optional)
        </span>
        {" - "}
        <ExternalLink role="link" url={NEW_DOCS_CONFIG_AI_AGENTS}>
          Learn more
          <BoxArrowUpRight className={cx("bi", "ms-1")} />
        </ExternalLink>
      </Label>
      <div className={cx(error && "is-invalid")} data-cy="coding-agents-select">
        <BuilderMultiSelectorCommon
          disabled={disabled}
          id="builder-coding-agents-select"
          inputId="builder-coding-agents-select-input"
          name={controllerProps.name}
          onBlur={onBlur}
          onChange={onChange}
          options={options}
          placeholder={EMPTY_PLACEHOLDER}
          value={selectedValues}
        />
      </div>
      {error?.message && (
        <div className="invalid-feedback d-block">{error.message}</div>
      )}
    </div>
  );
}

function codingAgentOptions(
  selected: readonly string[],
): BuilderSelectorOption[] {
  const known = new Set(CODING_AGENTS.map((agent) => agent.value));
  const saved = selected
    .filter((agent) => !known.has(agent))
    .map((agent) => ({ label: agent, value: agent }));
  return [...CODING_AGENTS, ...saved];
}
