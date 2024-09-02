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
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Input, Label } from "reactstrap";
import { MoreInfo } from "../../../../components/MoreInfo";
import { DEFAULT_URL, getFormCustomValuesDesc } from "../../session.utils";
import { SessionLauncherForm } from "../../sessionsV2.types";

interface AdvanceSettingsProp {
  control: Control<SessionLauncherForm, unknown>;
  errors?: FieldErrors<SessionLauncherForm>;
}
export function AdvanceSettingsFields({
  control,
  errors,
}: AdvanceSettingsProp) {
  const desc = getFormCustomValuesDesc();
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <div className="row">
        <div className={cx("col-12", "col-md-9")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherDefaultUrl"
          >
            Default URL
          </Label>
          <MoreInfo help={desc.urlPath} />
          <Controller
            control={control}
            name="default_url"
            render={({ field }) => (
              <Input
                className="form-control"
                id="addSessionLauncherDefaultUrl"
                placeholder={DEFAULT_URL}
                type="text"
                {...field}
              />
            )}
          />
        </div>
        <div className={cx("col-12", "col-md-3")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherPort"
          >
            Port (Optional)
          </Label>
          <MoreInfo help={desc.port} />
          <Controller
            control={control}
            name="port"
            render={({ field }) => (
              <Input
                className={cx(errors?.port && "is-invalid")}
                id="addSessionLauncherPort"
                placeholder="e.g. 8080"
                type="text"
                {...field}
              />
            )}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherMountDirectory"
          >
            Mount directory (Optional)
          </Label>
          <MoreInfo help={desc.mountDirectory} />
          <Controller
            control={control}
            name="mount_directory"
            render={({ field }) => (
              <Input
                className={cx(errors?.mount_directory && "is-invalid")}
                id="addSessionLauncherMountDirectory"
                placeholder=""
                type="text"
                {...field}
              />
            )}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12", "col-md-9")}>
          <Label className={cx("form-label", "me-2", "fw-bold")}>
            Docker settings
          </Label>
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherWorkingDirectory"
          >
            Working directory (Optional)
          </Label>
          <MoreInfo help={desc.workingDirectory} />
          <Controller
            control={control}
            name="working_directory"
            render={({ field }) => (
              <Input
                className={cx(errors?.working_directory && "is-invalid")}
                id="addSessionLauncherWorkingDirectory"
                placeholder=""
                type="text"
                {...field}
              />
            )}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12", "col-md-6")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherGid"
          >
            GID (Optional)
          </Label>
          <MoreInfo help={desc.gid} />
          <Controller
            control={control}
            name="gid"
            rules={{ required: false, min: 1000 }}
            render={({ field }) => (
              <Input
                className={cx(errors?.gid && "is-invalid")}
                id="addSessionLauncherGID"
                placeholder="e.g. 1000"
                type="number"
                {...field}
              />
            )}
          />
        </div>
        <div className={cx("col-12", "col-md-6")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherUid"
          >
            UID (Optional)
          </Label>
          <MoreInfo help={desc.uid} />
          <Controller
            control={control}
            name="uid"
            rules={{ required: false, min: 1000 }}
            render={({ field }) => (
              <Input
                className={cx(errors?.uid && "is-invalid")}
                id="addSessionLauncherUID"
                placeholder="e.g 1000"
                type="number"
                {...field}
              />
            )}
          />
        </div>
      </div>
      <div className="row">
        <div className={cx("col-12", "col-md-6")}>
          <Controller
            control={control}
            name="command"
            render={({ field }) => (
              <div className="d-flex flex-column justify-content-between h-100">
                <div>
                  <Label
                    className={cx("form-label", "me-2")}
                    for="addSessionLauncherCommand"
                  >
                    Command ENTRYPOINT (Optional)
                  </Label>
                  <MoreInfo help={desc.command} />
                  <div className={cx("small", "text-light-emphasis")}>
                    e.g. <code>{'["python3","main.py"]'}</code> or{" "}
                    <code>python3 main.py</code>
                  </div>
                </div>
                <div>
                  <Input
                    className={cx(errors?.uid && "is-invalid")}
                    id="addSessionLauncherCommand"
                    placeholder=""
                    type="text"
                    {...field}
                  />
                </div>
              </div>
            )}
          />
        </div>
        <div className={cx("col-12", "col-md-6")}>
          <Label
            className={cx("form-label", "me-2")}
            for="addSessionLauncherArgs"
          >
            Command Arguments CMD (Optional)
          </Label>
          <MoreInfo help={desc.args} />
          <Controller
            control={control}
            name="args"
            render={({ field }) => (
              <>
                <div className={cx("small", "text-light-emphasis")}>
                  e.g. <code>{'["--arg1", "--arg2", "--pwd=/home/user"]'}</code>
                </div>
                <div className={cx("small", "text-light-emphasis", "mb-2")}>
                  or <code>--arg1 --arg2 --pwd=$HOME</code>
                </div>
                <Input
                  className={cx(errors?.uid && "is-invalid")}
                  id="addSessionLauncherArgs"
                  placeholder=""
                  type="text"
                  {...field}
                />
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
