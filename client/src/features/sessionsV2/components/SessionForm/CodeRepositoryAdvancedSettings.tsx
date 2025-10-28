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

import CollapseBody from "~/components/container/CollapseBody";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";
import cx from "classnames";
import { useCallback, useState } from "react";
import { Controller, type Control } from "react-hook-form";
import { Collapse, Input, Label } from "reactstrap";
import type { SessionLauncherForm } from "../../sessionsV2.types";

interface CodeRepositoryAdvancedSettingsProps {
  control: Control<SessionLauncherForm>;
}

export default function CodeRepositoryAdvancedSettings({
  control,
}: CodeRepositoryAdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = useCallback(
    () => setIsOpen((isAdvancedSettingOpen) => !isAdvancedSettingOpen),
    []
  );
  return (
    <>
      <div>
        <button
          className={cx(
            "d-flex",
            "align-items-center",
            "w-100",
            "bg-transparent",
            "border-0"
          )}
          type="button"
          onClick={toggleIsOpen}
        >
          Advanced repository settings
          <ChevronFlippedIcon className="ms-1" flipped={isOpen} />
        </button>
      </div>
      <Collapse isOpen={isOpen}>
        <CollapseBody className={cx("d-flex", "flex-column", "gap-1")}>
          <div>
            <Label
              className="mb-1"
              for="builder-environment-code-repository-revision-input"
            >
              Git revision (branch, tag or commit)
            </Label>
            <Controller
              control={control}
              name="repository_revision"
              render={({ field, fieldState: { error } }) => (
                <Input
                  className={cx(error && "is-invalid")}
                  id="builder-environment-code-repository-revision-input"
                  placeholder="git revision"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: false, maxLength: 500 }}
            />
          </div>

          <div>
            <Label
              className="mb-1"
              for="builder-environment-code-context-dir-input"
            >
              Context directory
            </Label>
            <Controller
              control={control}
              name="context_dir"
              render={({ field, fieldState: { error } }) => (
                <Input
                  className={cx(error && "is-invalid")}
                  id="builder-environment-code-context-dir-input"
                  placeholder="path to folder"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: false, maxLength: 500 }}
            />
          </div>
        </CollapseBody>
      </Collapse>
    </>
  );
}
