/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { Control, Controller } from "react-hook-form";
import { Label } from "reactstrap";

import { InfoAlert } from "../../../../components/Alert";
import { AddStorageMountForm } from "./AddOrEditCloudStorage";
import { AddCloudStorageState } from "./projectCloudStorage.types";

type AddStorageMountSaveCredentialsInfoProps = {
  control: Control<AddStorageMountForm>;
  onFieldValueChange: (field: "saveCredentials", value: boolean) => void;
  state: AddCloudStorageState;
};

export default function AddStorageMountSaveCredentialsInfo({
  control,
  onFieldValueChange,
  state,
}: AddStorageMountSaveCredentialsInfoProps) {
  return (
    <div className="mt-3">
      <Label className="form-label" for="saveCredentials">
        Save credentials
      </Label>

      <Controller
        name="saveCredentials"
        control={control}
        render={({ field }) => (
          <input
            id="saveCredentials"
            type="checkbox"
            {...field}
            className={cx("form-check-input", "ms-1")}
            onChange={(e) => {
              field.onChange(e);
              onFieldValueChange("saveCredentials", e.target.checked);
            }}
            value=""
            checked={state.saveCredentials}
          />
        )}
        rules={{ required: true }}
      />
      {state.saveCredentials && (
        <div className="mt-1">
          <InfoAlert dismissible={false}>
            <p className="mb-0">
              The credentials will be stored as secrets and only be for your
              use. Other users will have to supply their credentials to use this
              data connector.
            </p>
          </InfoAlert>
        </div>
      )}
      <div className={cx("form-text", "text-muted")}>
        Check this box to save credentials as secrets, so you will not have to
        provide them again when starting a session.
      </div>
    </div>
  );
}
