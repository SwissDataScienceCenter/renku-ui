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

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useDispatch } from "react-redux";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import {
  setFiles,
  useDatasetFormSelector,
} from "../../features/project/dataset";
import type { DatasetFormState } from "../../features/project/dataset";

import DropzoneFileUploader, { FILE_STATUS } from "./DropzoneFileUploader";
import { IDatasetFiles } from "../../features/project/Project";

// Not sure where this comes from -- just trying to maintain existing behavior.
const UPLOAD_THRESHOLD_SOFT = 104_857_600;

type NotificationFunctionArgs = {
  dataset: any;
  edit: boolean;
  name: string;
  notifications: any;
  projectPathWithNamespace: string;
  location: any;
};
function notificationFunction(props: NotificationFunctionArgs) {
  return (success = true, error: any) => {
    const datasetName = props.edit
      ? `dataset ${props.dataset.name}`
      : "new dataset";
    const redirectUrl = props.edit
      ? `/projects/${props.projectPathWithNamespace}/datasets/${props.dataset.name}/modify`
      : `/projects/${props.projectPathWithNamespace}/datasets/new`;
    if (success) {
      props.notifications.addSuccess(
        props.notifications.Topics.DATASET_FILES_UPLOADED,
        `Files for the ${datasetName} in ${props.projectPathWithNamespace} finished uploading.`,
        redirectUrl,
        "Go to dataset",
        props.location.pathname
      );
    } else {
      const fullError = `An error occurred while uploading a file to the
    ${datasetName} in ${props.projectPathWithNamespace}.
    Error message: "${error.reason}"`;
      props.notifications.addError(
        props.notifications.Topics.DATASET_FILES_UPLOADED,
        `Unable to upload file to ${datasetName}.`,
        redirectUrl,
        "Try again",
        props.location.pathname,
        fullError
      );
    }
  };
}

type FileUploaderInputProps = {
  dataset: unknown;
  error?: FieldError;
  existingFiles: IDatasetFiles | undefined;
  help?: string | React.ReactNode;
  label: string;
  location: unknown;
  name: string;
  notifications: unknown;
  projectPathWithNamespace: string;
  register: UseFormRegisterReturn;
  value: DatasetFormState["form"]["files"];
  setValue: (value: DatasetFormState["form"]["files"]) => void;
  versionUrl: string;
};

function FileUploaderInput(props: FileUploaderInputProps) {
  const datasetUploaderFiles = useDatasetFormSelector(
    (state) => state.form.files
  );
  const dispatch = useDispatch();
  const { setValue } = props;
  const setDisplayFiles = React.useCallback(
    (files: DatasetFormState["form"]["files"]) => {
      dispatch(setFiles(files));
      setValue(files);
    },
    [dispatch, setValue]
  );
  return (
    <DropzoneFileUploader
      alert={props.error?.message}
      displayFiles={datasetUploaderFiles}
      existingFiles={props.existingFiles}
      help={props.help}
      label={props.label}
      name={props.name}
      notifyFunction={notificationFunction({
        dataset: props.dataset,
        edit: false,
        name: props.name,
        notifications: props.notifications,
        projectPathWithNamespace: props.projectPathWithNamespace,
        location: props.location,
      })}
      setDisplayFiles={setDisplayFiles}
      uploadThresholdSoft={UPLOAD_THRESHOLD_SOFT}
      value={props.value}
      versionUrl={props.versionUrl}
    />
  );
}

export default FileUploaderInput;

export { FILE_STATUS };
export type { FileUploaderInputProps };
