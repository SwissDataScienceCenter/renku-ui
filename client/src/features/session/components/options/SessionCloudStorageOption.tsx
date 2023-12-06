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
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CloudFill,
  ExclamationTriangleFill,
  EyeFill,
  EyeSlashFill,
  InfoCircleFill,
  PencilSquare,
  PlusLg,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Collapse,
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
import { ErrorAlert, InfoAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import LazyRenkuMarkdown from "../../../../components/markdown/LazyRenkuMarkdown";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../../utils/helpers/url";
import { StateModelProject } from "../../../project/Project";
import {
  useGetCloudStorageForProjectQuery,
  useValidateCloudStorageConfigurationMutation,
} from "../../../project/projectCloudStorage.api";
import {
  CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER,
  CLOUD_STORAGE_READWRITE_ENABLED,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
} from "../../../project/projectCloudStorage.constants";
import {
  formatCloudStorageConfiguration,
  getProvidedSensitiveFields,
  parseCloudStorageConfiguration,
} from "../../../project/utils/projectCloudStorage.utils";
import { useGetNotebooksVersionsQuery } from "../../../versions/versionsApi";
import { SessionCloudStorage } from "../../startSessionOptions.types";
import {
  addCloudStorageItem,
  removeCloudStorageItem,
  setCloudStorage,
  updateCloudStorageItem,
} from "../../startSessionOptionsSlice";

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

  return notebooksVersion?.cloudStorageEnabled.s3 ||
    notebooksVersion?.cloudStorageEnabled.azureBlob ? (
    <SessionS3CloudStorageOption />
  ) : null;
}

function SessionS3CloudStorageOption() {
  const { namespace, path } = useLegacySelector<StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );

  const settingsStorageUrl = Url.get(Url.pages.project.settings.storage, {
    namespace,
    path,
  });

  return (
    <div className="field-group">
      <div className="form-label">Cloud Storage</div>
      <div className={cx("form-text", "mt-0", "mb-1")}>
        Use data from <S3ExplanationLink /> sources like AWS S3, Google Cloud
        Storage, etc.
      </div>
      <div className={cx("form-text", "mt-0", "mb-1")}>
        It is recommended to configure cloud storage options from the{" "}
        <Link to={settingsStorageUrl}>Project&apos;s settings</Link>.
      </div>
      <CloudStorageList />
    </div>
  );
}

function CloudStorageList() {
  const { accessLevel, id: projectId } = useLegacySelector<
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);

  const devAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;

  const cloudStorageList = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.cloudStorage
  );

  const dispatch = useAppDispatch();

  const { data: notebooksVersion } = useGetNotebooksVersionsQuery();
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

  const support = useMemo(
    () => (notebooksVersion?.cloudStorageEnabled.s3 ? "s3" : "azure"),
    [notebooksVersion?.cloudStorageEnabled]
  );

  // Populate session cloud storage from project's settings
  useEffect(() => {
    if (storageForProject == null) {
      return;
    }
    const initialCloudStorage: SessionCloudStorage[] = storageForProject.map(
      ({ storage, sensitive_fields }) => ({
        active:
          (storage.storage_type === "s3" && support === "s3") ||
          (storage.storage_type === "azureblob" && support === "azure"),
        supported:
          (storage.storage_type === "s3" && support === "s3") ||
          (storage.storage_type === "azureblob" && support === "azure"),
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
  }, [dispatch, storageForProject, support]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {error && (
        <ErrorAlert>
          <p className="mb-0">
            Error: could not load this project&apos;s cloud storage settings.
          </p>
        </ErrorAlert>
      )}
      {cloudStorageList.length > 0 && (
        <Container className="p-0" fluid>
          <Row className={cx("row-cols-1", "gy-2")}>
            {cloudStorageList.map((storage, index) => (
              <CloudStorageItem
                index={index}
                key={`${storage.name}-${index}`}
                storage={storage}
              />
            ))}
          </Row>
        </Container>
      )}
      <div className="mt-2">
        <AddTemporaryCloudStorageButton />
      </div>
    </>
  );
}

interface CloudStorageItemProps {
  index: number;
  storage: SessionCloudStorage;
}

function CloudStorageItem({ index, storage }: CloudStorageItemProps) {
  const {
    active,
    configuration,
    name,
    sensitive_fields,
    supported,
    target_path,
  } = storage;

  const providedSensitiveFields = useMemo(
    () => getProvidedSensitiveFields(configuration),
    [configuration]
  );
  const requiredSensitiveFields = useMemo(
    () =>
      sensitive_fields?.filter(({ name }) =>
        providedSensitiveFields.includes(name)
      ),
    [providedSensitiveFields, sensitive_fields]
  );

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const dispatch = useAppDispatch();

  const onToggleActive = useCallback(() => {
    dispatch(
      updateCloudStorageItem({
        index,
        storage: { ...storage, active: !storage.active },
      })
    );
  }, [dispatch, index, storage]);
  const onChangeCredential = useCallback(
    (fieldIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      if (sensitive_fields == null) {
        return;
      }

      const name = sensitive_fields[fieldIndex].name;
      const value = event.target.value;
      const newSensitiveFields = [...sensitive_fields];
      newSensitiveFields.splice(fieldIndex, 1, {
        ...sensitive_fields[fieldIndex],
        name,
        value,
      });
      dispatch(
        updateCloudStorageItem({
          index,
          storage: {
            ...storage,
            sensitive_fields: newSensitiveFields,
          },
        })
      );
    },
    [dispatch, index, sensitive_fields, storage]
  );
  const onRemoveItem = useCallback(() => {
    dispatch(removeCloudStorageItem({ index: index }));
  }, [dispatch, index]);

  return (
    <Col>
      <Card>
        <CardBody className={cx("pb-2", "d-flex", "align-items-center")}>
          <div>
            <Input
              className="form-check-input"
              checked={active}
              disabled={!supported}
              id="cloudStorageItemActive"
              onChange={onToggleActive}
              type="checkbox"
            />
            <Label className="visually-hidden" for="cloudStorageItemActive">
              Mount in this session
            </Label>
          </div>
          <h3
            className={cx(
              "fs-6",
              "fw-bold",
              "m-0",
              "ms-2",
              !active && ["text-decoration-line-through", "text-rk-text-light"]
            )}
          >
            {name}
            {storage.storage_id == null && (
              <>
                {" "}
                <span
                  className={cx(
                    "fst-italic",
                    "fw-normal",
                    "text-rk-text-light"
                  )}
                >
                  (temporary)
                </span>
              </>
            )}
          </h3>
          <div className={cx("small", "d-none", "d-sm-block", "ms-3")}>
            <span className="text-rk-text-light">Mount point: </span>
            {active ? (
              <span>{target_path}</span>
            ) : (
              <span className="fst-italic">Not mounted</span>
            )}
          </div>
          {storage.storage_id == null && (
            <div className="ms-auto">
              <Button
                className={cx(
                  "btn-sm",
                  "bg-transparent",
                  "border-0",
                  "text-danger",
                  "p-0"
                )}
                onClick={onRemoveItem}
              >
                <TrashFill />
              </Button>
            </div>
          )}
        </CardBody>

        {!supported && (
          <CardBody className="py-0">
            <p className={cx("form-text", "text-danger", "mt-0", "mb-1")}>
              <ExclamationTriangleFill className={cx("bi", "me-1")} />
              This cloud storage configuration is currently not supported.
            </p>
          </CardBody>
        )}

        {supported &&
          requiredSensitiveFields != null &&
          requiredSensitiveFields.length > 0 && (
            <CardBody className="py-0">
              <h5 className={cx("fs-6", "m-0")}>Credentials</h5>
              <p className={cx("form-text", "mt-0", "mb-1")}>
                Please fill in the credentials required to use this cloud
                storage
              </p>
              {requiredSensitiveFields.map((item, fieldIndex) => (
                <CredentialField
                  key={fieldIndex}
                  active={active}
                  fieldIndex={fieldIndex}
                  index={index}
                  item={item}
                  onChangeCredential={onChangeCredential}
                />
              ))}
            </CardBody>
          )}

        <CardBody className="p-0">
          <button
            className={cx(
              "d-flex",
              "align-items-center",
              "w-100",
              "p-3",
              "py-2",
              "bg-transparent",
              "border-0",
              "border-top"
            )}
            onClick={toggle}
            type="button"
          >
            <div>More details</div>
            <div className="ms-auto">
              <ChevronFlippedIcon flipped={isOpen} />
            </div>
          </button>
        </CardBody>
        <Collapse isOpen={isOpen}>
          <CardBody className="pt-0">
            <CloudStorageDetails index={index} storage={storage} />
          </CardBody>
        </Collapse>
      </Card>
    </Col>
  );
}

interface CredentialFieldProps {
  active: boolean;
  fieldIndex: number;
  index: number;
  item: {
    name: string;
    help: string;
    value: string;
  };
  onChangeCredential: (
    fieldIndex: number
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
}

function CredentialField({
  active,
  fieldIndex,
  index,
  item,
  onChangeCredential,
}: CredentialFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const onToggleVisibility = useCallback(() => {
    setShowPassword((show) => !show);
  }, []);

  const ref = useRef<HTMLButtonElement>(null);

  const helpText = showPassword ? "Hide credential" : "Show credential";

  return (
    <div className="mb-3">
      <Label className="form-label" for={`credentials-${index}-${item.name}`}>
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
          id={`credentials-${index}-${item.name}`}
          type={showPassword ? "text" : "password"}
          value={item.value}
          onChange={onChangeCredential(fieldIndex)}
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

function CloudStorageDetails({ index, storage }: CloudStorageItemProps) {
  const { namespace, path } = useLegacySelector<StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );

  const settingsStorageUrl = Url.get(Url.pages.project.settings.storage, {
    namespace,
    path,
  });

  const { configuration, name, readonly, source_path, target_path } = storage;

  const providedSensitiveFields = useMemo(
    () => getProvidedSensitiveFields(configuration),
    [configuration]
  );
  const requiredSensitiveFields = useMemo(
    () =>
      storage.sensitive_fields?.filter(({ name }) =>
        providedSensitiveFields.includes(name)
      ),
    [providedSensitiveFields, storage.sensitive_fields]
  );
  const configCredentials = (requiredSensitiveFields ?? []).reduce(
    (prev, { name, value }) => ({ ...prev, [name]: value }),
    {} as Record<string, string>
  );
  const configWithCredentials = { ...configuration, ...configCredentials };
  const configContent = formatCloudStorageConfiguration({
    configuration: configWithCredentials,
    name,
  });

  const dispatch = useAppDispatch();

  const onChangeSourcePath = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      dispatch(
        updateCloudStorageItem({
          index,
          storage: { ...storage, source_path: value },
        })
      );
    },
    [dispatch, index, storage]
  );
  const onChangeTargetPath = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      dispatch(
        updateCloudStorageItem({
          index,
          storage: { ...storage, target_path: value },
        })
      );
    },
    [dispatch, index, storage]
  );
  const onChangeReadWriteMode = useCallback(() => {
    dispatch(
      updateCloudStorageItem({
        index,
        storage: { ...storage, readonly: !storage.readonly },
      })
    );
  }, [dispatch, index, storage]);

  const [tempConfigContent, setTempConfigContent] = useState(configContent);
  const onChangeConfiguration = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setTempConfigContent(event.target.value);
    },
    []
  );
  const onUpdateConfiguration = useCallback(() => {
    const parsedConfiguration =
      parseCloudStorageConfiguration(tempConfigContent);

    const sensitiveFieldKeys =
      storage.sensitive_fields?.map(({ name }) => name) ?? [];

    const updatedExistingConfiguration = Object.keys(configuration)
      .flatMap((key) =>
        sensitiveFieldKeys.includes(key)
          ? [[key, CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN] as const]
          : parsedConfiguration[key] != null
          ? [[key, parsedConfiguration[key]] as const]
          : []
      )
      .reduce(
        (obj, [key, value]) => ({ ...obj, [key]: value }),
        {} as Record<string, string>
      );
    const updatedNewConfiguration = Object.entries(parsedConfiguration)
      .filter(([key]) => !Object.keys(updateCloudStorageItem).includes(key))
      .map(([key, value]) =>
        sensitiveFieldKeys.includes(key)
          ? ([key, CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN] as const)
          : ([key, value] as const)
      )
      .reduce(
        (obj, [key, value]) => ({ ...obj, [key]: value }),
        {} as Record<string, string>
      );

    const updatedSensitiveFields = storage.sensitive_fields?.map(
      ({ name, help }) =>
        parsedConfiguration[name] != null
          ? { name, help, value: parsedConfiguration[name] }
          : { name, help, value: "" }
    );

    dispatch(
      updateCloudStorageItem({
        index,
        storage: {
          ...storage,
          configuration: {
            ...updatedExistingConfiguration,
            ...updatedNewConfiguration,
          },
          sensitive_fields: updatedSensitiveFields,
        },
      })
    );
  }, [configuration, dispatch, index, storage, tempConfigContent]);

  useEffect(() => {
    setTempConfigContent(configContent);
  }, [configContent]);

  return (
    <div className="form-rk-green">
      <FormText>
        Changes made here will apply only for this session. Use the{" "}
        <Link to={settingsStorageUrl}>project&apos;s settings</Link> to
        permanently change cloud storage settings.
      </FormText>

      <div className="mb-3">
        <Label
          className="form-label"
          for={`updateCloudStorageSourcePath-${index}`}
        >
          Source Path
        </Label>
        <Input
          className="form-control"
          id={`updateCloudStorageSourcePath-${index}`}
          placeholder="bucket/folder"
          type="text"
          value={source_path}
          onChange={onChangeSourcePath}
        />
      </div>

      <div className="mb-3">
        <Label
          className="form-label"
          for={`updateCloudStorageTargetPath-${index}`}
        >
          Mount Point
        </Label>
        <Input
          className="form-control"
          id={`updateCloudStorageTargetPath-${index}`}
          placeholder="folder"
          type="text"
          value={target_path}
          onChange={onChangeTargetPath}
        />
      </div>

      {!CLOUD_STORAGE_READWRITE_ENABLED ? null : (
        <div className="mb-3">
          <div className="form-label">Mode</div>
          <div className="form-check">
            <Input
              type="radio"
              className="form-check-input"
              name={`updateCloudStorageReadOnlyRadio-${index}`}
              id={`updateCloudStorageReadOnly-${index}`}
              autoComplete="off"
              checked={!!readonly}
              onChange={onChangeReadWriteMode}
            />
            <Label
              className={cx("form-check-label", "ms-2")}
              for={`updateCloudStorageReadOnly-${index}`}
            >
              Read-only
            </Label>
          </div>
          <div className="form-check">
            <Input
              type="radio"
              className="form-check-input"
              name={`updateCloudStorageReadOnlyRadio-${index}`}
              id={`updateCloudStorageReadWrite-${index}`}
              autoComplete="off"
              checked={!readonly}
              onChange={onChangeReadWriteMode}
            />
            <Label
              className={cx("form-check-label", "ms-2")}
              for={`updateCloudStorageReadWrite-${index}`}
            >
              Read/Write
            </Label>
          </div>
        </div>
      )}
      <div>
        <Label className="form-label" for={`updateCloudStorageConfig-${index}`}>
          Configuration
        </Label>
        <FormText id={`updateCloudStorageConfigHelp-${index}`} tag="div">
          You can paste here the output of{" "}
          <code className="user-select-all">
            rclone config show &lt;name&gt;
          </code>
          .
        </FormText>
        <textarea
          aria-describedby={`updateCloudStorageConfigHelp-${index}`}
          className="form-control"
          id={`updateCloudStorageConfig-${index}`}
          rows={Object.keys(storage.configuration).length + 2}
          value={tempConfigContent}
          onChange={onChangeConfiguration}
        />
        <div className={cx("d-flex", "justify-content-end", "mt-1")}>
          <Button
            className="btn-sm"
            disabled={configContent === tempConfigContent}
            type="button"
            onClick={onUpdateConfiguration}
          >
            <PencilSquare className={cx("bi", "me-1")} />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddTemporaryCloudStorageButton() {
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
      readonly: true,
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
          readonly: data.readonly,
          source_path: data.source_path,
          storage_id: null,
          storage_type: "",
          supported: true,
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

          {!CLOUD_STORAGE_READWRITE_ENABLED ? null : (
            <div className="mb-3">
              <div className="form-label">Mode</div>
              <Controller
                control={control}
                name="readonly"
                render={({ field }) => (
                  <>
                    <div className="form-check">
                      <Input
                        type="radio"
                        className="form-check-input"
                        name="readonlyRadio"
                        id="addCloudStorageReadOnly"
                        autoComplete="off"
                        checked={field.value}
                        onBlur={field.onBlur}
                        onChange={() => field.onChange(true)}
                      />
                      <Label
                        className={cx("form-check-label", "ms-2")}
                        for="addCloudStorageReadOnly"
                      >
                        Read-only
                      </Label>
                    </div>
                    <div className="form-check">
                      <Input
                        type="radio"
                        className="form-check-input"
                        name="readonlyRadio"
                        id="addCloudStorageReadWrite"
                        autoComplete="off"
                        checked={!field.value}
                        onBlur={field.onBlur}
                        onChange={() => field.onChange(false)}
                      />
                      <Label
                        className={cx("form-check-label", "ms-2")}
                        for="addCloudStorageReadWrite"
                      >
                        Read/Write
                      </Label>
                    </div>
                  </>
                )}
              />
            </div>
          )}
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

function S3ExplanationLink() {
  return (
    <ExternalLink
      role="text"
      title="S3-compatible storage"
      url="https://en.wikipedia.org/wiki/Amazon_S3#S3_API_and_competing_services"
    />
  );
}
