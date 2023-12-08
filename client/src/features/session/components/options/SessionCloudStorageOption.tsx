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
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CloudFill,
  EyeFill,
  EyeSlashFill,
  InfoCircleFill,
  PlusLg,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Form,
  FormText,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PopoverBody,
  Row,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "reactstrap";

import { ACCESS_LEVELS } from "../../../../api-client";
import { InfoAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import {
  RtkErrorAlert,
  RtkOrNotebooksError,
} from "../../../../components/errors/RtkErrorAlert";
import LazyRenkuMarkdown from "../../../../components/markdown/LazyRenkuMarkdown";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../../utils/helpers/url";
import { StateModelProject } from "../../../project/Project";
import {
  useGetCloudStorageForProjectQuery,
  useValidateCloudStorageConfigurationMutation,
} from "../../../project/components/cloudStorage/projectCloudStorage.api";
import { CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER } from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import { parseCloudStorageConfiguration } from "../../../project/utils/projectCloudStorage.utils";
import { useGetNotebooksVersionsQuery } from "../../../versions/versionsApi";
import { SessionCloudStorage } from "../../startSessionOptions.types";
import {
  addCloudStorageItem,
  setCloudStorage,
  updateCloudStorageItem,
} from "../../startSessionOptionsSlice";
import { CloudStorageItem as CloudStorageItemNew } from "../../../project/components/ProjectSettingsCloudStorage";

export default function SessionCloudStorageOption() {
  const { data: notebooksVersion, isLoading } = useGetNotebooksVersionsQuery();

  if (isLoading) {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading session options...
        </div>
      </div>
    );
  }

  return notebooksVersion?.cloudStorageEnabled ? (
    <SessionS3CloudStorageOption />
  ) : null;
}

function SessionS3CloudStorageOption() {
  const { accessLevel, namespace, path } = useLegacySelector<
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);
  const devAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;
  const settingsStorageUrl = Url.get(Url.pages.project.settings.storage, {
    namespace,
    path,
  });

  const storageSettingsRecommendation = devAccess ? (
    <div className={cx("form-text", "mt-0", "mb-1")}>
      It is recommended to configure cloud storage options from the{" "}
      <Link to={settingsStorageUrl}>Project&apos;s settings</Link>.
    </div>
  ) : null;

  return (
    <div className="field-group">
      <div className="form-label">Cloud Storage</div>
      {storageSettingsRecommendation}
      <CloudStorageSection devAccess={devAccess} />
    </div>
  );
}

interface CloudStorageListProps {
  devAccess: boolean;
}
function CloudStorageSection({ devAccess }: CloudStorageListProps) {
  const { id: projectId } = useLegacySelector<StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );
  const dispatch = useAppDispatch();
  const cloudStorageList = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.cloudStorage
  );

  const {
    data: storageForProject,
    error,
    isLoading,
  } = useGetCloudStorageForProjectQuery(
    {
      project_id: `${projectId}`,
    },
    { skip: !devAccess }
  );

  // Populate session cloud storage from project's settings
  useEffect(() => {
    if (storageForProject == null) {
      return;
    }
    const initialCloudStorage: SessionCloudStorage[] = storageForProject.map(
      ({ storage, sensitive_fields }) => ({
        active: true,
        ...(sensitive_fields
          ? {
              sensitive_fields: sensitive_fields.map(({ name, ...rest }) => ({
                ...rest,
                name,
                value: "",
              })),
            }
          : {}),
        ...storage,
      })
    );
    dispatch(setCloudStorage(initialCloudStorage));
  }, [dispatch, storageForProject]);

  if (isLoading) return <Loader />;

  if (error) {
    return <RtkOrNotebooksError error={error} />;
  }

  if (!cloudStorageList || cloudStorageList.length === 0) {
    return null;
  }

  const storageList = cloudStorageList.map((storage, index) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { active, sensitive_fields, ...otherStorageProps } = storage;
    const storageDefinition = {
      storage: otherStorageProps,
      sensitive_fields: storage.sensitive_fields,
    };
    const localId = `cloud-storage-${storage.name}`;

    const onToggleActive = () =>
      dispatch(
        updateCloudStorageItem({
          index,
          storage: { ...storage, active: !storage.active },
        })
      );

    const changeCredential = (name: string, value: string) => {
      if (sensitive_fields) {
        const fieldIndex = sensitive_fields.findIndex((f) => f.name === name);
        const newSensitiveFields = [...sensitive_fields];
        newSensitiveFields.splice(fieldIndex, 1, {
          ...sensitive_fields[fieldIndex],
          name,
          value,
        });
        dispatch(
          updateCloudStorageItem({
            index,
            storage: { ...storage, sensitive_fields: newSensitiveFields },
          })
        );
      }
    };

    const sensitiveFields =
      storage.sensitive_fields && storage.sensitive_fields.length
        ? storage.sensitive_fields.filter((f) => {
            if (storage.configuration[f.name]) {
              return true;
            }
          })
        : null;

    const requiredSensitiveFields =
      sensitiveFields && sensitiveFields.length ? (
        <div>
          <p className={cx("form-text", "mt-2", "mb-1")}>
            Please fill in the credentials required to use this cloud storage
          </p>
          {sensitiveFields.map((item, fieldIndex) => (
            <CredentialField
              key={`${item.name}-${fieldIndex}`}
              active={active}
              item={item}
              changeCredential={changeCredential}
            />
          ))}
        </div>
      ) : null;

    return (
      <CloudStorageItemNew
        devAccess={devAccess}
        disabled={!active}
        key={storage.name}
        noEdit={
          "Cannot edit storage from the session pages. Please go to the project settings."
        }
        storageDefinition={storageDefinition}
      >
        <div>
          <Input
            className={cx("form-check-input", "me-2")}
            checked={active}
            id={`${localId}-active`}
            onChange={onToggleActive}
            type="checkbox"
          />
          <Label for={`${localId}-active`}>
            {active
              ? "Mount the storage in this session"
              : "Non active for this session"}
          </Label>
        </div>
        {requiredSensitiveFields}
      </CloudStorageItemNew>
    );
  });

  return (
    <Container className={cx("p-0", "mt-2")} fluid>
      <Row className={cx("row-cols-1", "gy-2")}>{storageList}</Row>
    </Container>
  );
}

interface CredentialFieldProps {
  active: boolean;
  item: {
    name: string;
    help: string;
    value: string;
  };
  changeCredential: (name: string, value: string) => void;
}

function CredentialField({
  active,
  item,
  changeCredential,
}: CredentialFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const onToggleVisibility = useCallback(() => {
    setShowPassword((show) => !show);
  }, []);

  const ref = useRef<HTMLButtonElement>(null);

  const helpText = showPassword ? "Hide credential" : "Show credential";

  return (
    <div className="mb-3">
      <Label className="form-label" for={`credentials-${item.name}`}>
        {item.name}
        <span className={cx("fw-bold", "text-danger")}>*</span>
        <CredentialMoreInfo help={item.help} />
      </Label>
      <InputGroup>
        <Input
          className={cx(
            "rounded-0",
            "rounded-start",
            !item.value && active && "is-invalid"
          )}
          disabled={!active}
          id={`credentials-${item.name}`}
          type={showPassword ? "text" : "password"}
          value={item.value}
          onChange={(e) => changeCredential(item.name, e.target.value)}
        />
        <Button
          className="rounded-end"
          innerRef={ref}
          onClick={onToggleVisibility}
        >
          {showPassword ? (
            <EyeSlashFill className={cx("bi")} />
          ) : (
            <EyeFill className={cx("bi")} />
          )}
          <span className="visually-hidden">{helpText}</span>
        </Button>
        <UncontrolledTooltip placement="top" target={ref}>
          {helpText}
        </UncontrolledTooltip>
      </InputGroup>
    </div>
  );
}

function CredentialMoreInfo({ help }: { help: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={ref}>
        <InfoCircleFill className={cx("bi", "ms-1")} tabIndex={0} />
      </span>
      <UncontrolledPopover target={ref} placement="right" trigger="hover focus">
        <PopoverBody>
          <LazyRenkuMarkdown markdownText={help} />
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

// ! TODO: restore this?
export function AddTemporaryCloudStorageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Temporary Cloud Storage
      </Button>
      <AddTemporaryCloudStorageModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddTemporaryCloudStorageModalProps {
  isOpen: boolean;
  toggle: () => void;
}

// ! TODO: this should go away; we should adapt and re-use the current Cloud Storage modal
function AddTemporaryCloudStorageModal({
  isOpen,
  toggle,
}: AddTemporaryCloudStorageModalProps) {
  const { namespace, path } = useLegacySelector<StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );

  const settingsStorageUrl = Url.get(Url.pages.project.settings.storage, {
    namespace,
    path,
  });

  const dispatch = useAppDispatch();

  const [validateCloudStorageConfiguration, result] =
    useValidateCloudStorageConfigurationMutation();

  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    reset,
  } = useForm<AddTemporaryCloudStorageForm>({
    defaultValues: {
      configuration: "",
      name: "",
      readonly: false,
      source_path: "",
    },
  });
  const onSubmit = useCallback(
    (data: AddTemporaryCloudStorageForm) => {
      const configuration = parseCloudStorageConfiguration(data.configuration);
      validateCloudStorageConfiguration({ configuration });
    },
    [validateCloudStorageConfiguration]
  );

  useEffect(() => {
    if (result.isSuccess) {
      const data = getValues();
      const configuration = parseCloudStorageConfiguration(data.configuration);
      dispatch(
        addCloudStorageItem({
          active: true,
          configuration,
          name: data.name,
          private: false,
          project_id: "", // ! This should be adjust, or change the interface
          readonly: data.readonly,
          source_path: data.source_path,
          storage_id: "",
          storage_type: "",
          target_path: data.name,
        })
      );
      toggle();
    }
  }, [dispatch, getValues, result.isSuccess, toggle]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal centered fullscreen="lg" isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <CloudFill className={cx("bi", "me-2")} />
        Add Temporary Cloud Storage
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          <InfoAlert timeout={0} dismissible={false}>
            This cloud storage will be configured for this session only. To
            configure cloud storage permanently for this project, go to{" "}
            <Link to={settingsStorageUrl}>Project settings</Link>.
          </InfoAlert>

          <p className="mb-0">
            Temporary cloud storage uses <code>rclone</code> configurations to
            set up cloud storage.
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
              The name also determines the mount location, though it is possible
              to change it later.
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
                    (errors.configuration || result.isError) && "is-invalid"
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
          Add Temporary Cloud Storage
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface AddTemporaryCloudStorageForm {
  configuration: string;
  name: string;
  readonly: boolean;
  source_path: string;
}
