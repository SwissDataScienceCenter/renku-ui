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
import { useCallback, useEffect, useState } from "react";
import { PencilSquare, PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { StateModelProject } from "../../Project";
import { useAddCloudStorageForProjectMutation } from "./projectCloudStorage.api";
import { CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER } from "./projectCloudStorage.constants";
import { CloudStorage } from "./projectCloudStorage.types";
import { parseCloudStorageConfiguration } from "../../utils/projectCloudStorage.utils";
import { ExternalLink } from "../../../../components/ExternalLinks";
import AddCloudStorageModal from "./AddCloudStorageModal";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";

interface AddCloudStorageButtonProps {
  currentStorage?: CloudStorage | null;
  devAccess: boolean;
}
export default function AddCloudStorageButton({
  currentStorage,
  devAccess,
}: AddCloudStorageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const isEdit = !!currentStorage?.storage.storage_id;
  const localId = isEdit
    ? `edit-cloud-storage-${currentStorage?.storage.storage_id}`
    : "add-cloud-storage";
  const buttonContent = isEdit ? (
    <>
      <PencilSquare className={cx("bi", "me-1")} />
      Edit
    </>
  ) : (
    <>
      <PlusLg className={cx("bi", "me-1")} />
      Add Cloud Storage
    </>
  );
  const content = devAccess ? (
    <>
      <Button
        id={`${localId}-button`}
        className={cx("btn-outline-rk-green")}
        onClick={toggle}
      >
        {buttonContent}
      </Button>
      <div id={`${localId}-modal`} key={`${localId}-key`}>
        <AddCloudStorageModal
          currentStorage={currentStorage}
          isOpen={isOpen}
          toggle={toggle}
        />
      </div>
    </>
  ) : (
    <>
      <Button
        id={`${localId}-button`}
        color="outline-secondary"
        disabled={true}
      >
        {buttonContent}
      </Button>
      <UncontrolledTooltip target={localId}>
        Only developers and maintainers can edit cloud storage settings.
      </UncontrolledTooltip>
    </>
  );

  return (
    <div className={cx("d-inline-block", "mb-2")} id={localId}>
      {content}
    </div>
  );
}

interface AddCloudStorageProps {
  goToCredentialsStep: (storageDefinition: CloudStorage) => void;
  toggle: () => void;
}
// ! TEMP - remove
export function AdvancedAddCloudStorage({
  goToCredentialsStep,
  toggle,
}: AddCloudStorageProps) {
  const projectId = useLegacySelector<StateModelProject["metadata"]["id"]>(
    (state) => state.stateModel.project.metadata.id
  );

  const [addCloudStorageForProject, result] =
    useAddCloudStorageForProjectMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<AdvancedAddCloudStorageForm>({
    defaultValues: {
      configuration: "",
      name: "",
      private: true,
      readonly: false,
      source_path: "",
    },
  });
  const onSubmit = useCallback(
    (data: AdvancedAddCloudStorageForm) => {
      const configuration = parseCloudStorageConfiguration(data.configuration);
      addCloudStorageForProject({
        configuration,
        name: data.name,
        private: data.private,
        readonly: data.readonly,
        project_id: `${projectId}`,
        source_path: data.source_path,
        target_path: data.name,
      });
    },
    [addCloudStorageForProject, projectId]
  );

  // Handle picking required credentials if necessary
  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    if (
      !result.data.storage.private ||
      result.data.sensitive_fields == null ||
      result.data.sensitive_fields.length == 0
    ) {
      toggle();
      return;
    }
    goToCredentialsStep(result.data);
  }, [goToCredentialsStep, result.data, result.isSuccess, toggle]);

  return (
    <>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <div className="form-rk-green">
            <p className="mb-0">
              Advanced mode uses <code>rclone</code> configurations to set up
              cloud storage.
            </p>
            <p className="mb-3">
              Learn more at the{" "}
              <ExternalLink
                url="https://rclone.org/"
                title="rclone documentation"
                role="link"
              />
              .
            </p>

            <div className="mb-3">
              <Label className="form-label" for="addCloudStorageName">
                Name
              </Label>
              <FormText id="addCloudStorageNameHelp" tag="div">
                The name also determines the mount location, though it is
                possible to change it later.
              </FormText>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    aria-describedby="addCloudStorageNameHelp"
                    className={cx("form-control", errors.name && "is-invalid")}
                    id="addCloudStorageName"
                    placeholder="storage"
                    type="text"
                    {...field}
                  />
                )}
                rules={{ required: true }}
              />
              <div className="invalid-feedback">Please provide a name</div>
            </div>

            <div className="mb-3">
              <Controller
                control={control}
                name="private"
                render={({ field }) => (
                  <Input
                    aria-describedby="addCloudStoragePrivateHelp"
                    className="form-check-input"
                    id="addCloudStoragePrivate"
                    type="checkbox"
                    checked={field.value}
                    innerRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
              <Label
                className={cx("form-check-label", "ms-2")}
                for="addCloudStoragePrivate"
              >
                Requires credentials
              </Label>
              <FormText id="addCloudStoragePrivateHelp" tag="div">
                Check this box if this cloud storage requires credentials to be
                used.
              </FormText>
            </div>

            <div className="mb-3">
              <Controller
                control={control}
                name="readonly"
                render={({ field }) => (
                  <Input
                    aria-describedby="addCloudStorageReadOnlyHelp"
                    className="form-check-input"
                    id="addCloudStorageReadOnly"
                    type="checkbox"
                    checked={field.value}
                    innerRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
              <Label
                className={cx("form-check-label", "ms-2")}
                for="addCloudStorageReadOnly"
              >
                Read-only
              </Label>
              <FormText id="addCloudStorageReadOnlyHelp" tag="div">
                Check this box to mount the storage in read-only mode. Use this
                setting to prevent accidental data modifications.
              </FormText>
            </div>

            <div className="mb-3">
              <Label className="form-label" for="addCloudStorageSourcePath">
                Source Path
              </Label>
              <Controller
                control={control}
                name="source_path"
                render={({ field }) => (
                  <Input
                    className={cx(
                      "form-control",
                      errors.source_path && "is-invalid"
                    )}
                    id="addCloudStorageSourcePath"
                    placeholder="bucket/folder"
                    type="text"
                    {...field}
                  />
                )}
                rules={{ required: true }}
              />
              <div className="invalid-feedback">
                Please provide a valid source path
              </div>
            </div>

            <div>
              <Label className="form-label" for="addCloudStorageConfig">
                Configuration
              </Label>
              <FormText id="addCloudStorageConfigHelp" tag="div">
                You can paste here the output of{" "}
                <code className="user-select-all">
                  rclone config show &lt;name&gt;
                </code>
                .
              </FormText>
              <Controller
                control={control}
                name="configuration"
                render={({ field }) => (
                  <textarea
                    aria-describedby="addCloudStorageConfigHelp"
                    className={cx(
                      "form-control",
                      errors.configuration && "is-invalid"
                    )}
                    id="addCloudStorageConfig"
                    placeholder={CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER}
                    rows={10}
                    {...field}
                  />
                )}
                rules={{ required: true }}
              />
              <div className="invalid-feedback">
                Please provide a valid <code>rclone</code> configuration
              </div>
            </div>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          disabled={result.isLoading}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          Add Storage
        </Button>
      </ModalFooter>
    </>
  );
}

interface AdvancedAddCloudStorageForm {
  configuration: string;
  name: string;
  private: boolean;
  readonly: boolean;
  source_path: string;
}
