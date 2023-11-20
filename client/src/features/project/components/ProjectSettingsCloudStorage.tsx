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
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckLg,
  InfoCircleFill,
  PencilSquare,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { RootStateOrAny, useSelector } from "react-redux";
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
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  PopoverBody,
  Row,
  UncontrolledPopover,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../../api-client";
import { ErrorAlert, InfoAlert, WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import ChevronFlippedIcon from "../../../components/icons/ChevronFlippedIcon";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import LazyRenkuMarkdown from "../../../components/markdown/LazyRenkuMarkdown";
import { User } from "../../../model/RenkuModels";
import { NotebooksVersion } from "../../versions/versions";
import { useGetNotebooksVersionsQuery } from "../../versions/versionsApi";
import { StateModelProject } from "../Project";
import {
  useDeleteCloudStorageMutation,
  useGetCloudStorageForProjectQuery,
  useUpdateCloudStorageMutation,
} from "../projectCloudStorage.api";
import {
  CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
} from "../projectCloudStorage.constants";
import {
  CloudStorage,
  CloudStorageConfiguration,
  CloudStorageCredential,
} from "../projectCloudStorage.types";
import {
  formatCloudStorageConfiguration,
  getCredentialFieldDefinitions,
  parseCloudStorageConfiguration,
} from "../utils/projectCloudStorage.utils";
import AddCloudStorageButton from "./AddCloudStorageButton";

export default function ProjectSettingsCloudStorage() {
  const logged = useSelector<RootStateOrAny, User["logged"]>(
    (state) => state.stateModel.user.logged
  );

  // Project options
  const { accessLevel, id: projectId } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);

  const devAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;

  const {
    data: storageForProject,
    error: storageError,
    isFetching: storageIsFetching,
    isLoading: storageIsLoading,
  } = useGetCloudStorageForProjectQuery({
    project_id: `${projectId}`,
  });
  const {
    data: notebooksVersion,
    error: versionError,
    isFetching: versionIsFetching,
    isLoading: versionIsLoading,
  } = useGetNotebooksVersionsQuery();

  const error = storageError || versionError;
  const isFetching = storageIsFetching || versionIsFetching;
  const isLoading = storageIsLoading || versionIsLoading;

  if (!logged) {
    const textIntro =
      "Only authenticated users can access cloud storage setting.";
    const textPost = "to view cloud storage settings.";
    return (
      <CloudStorageSection>
        <LoginAlert logged={logged} textIntro={textIntro} textPost={textPost} />
      </CloudStorageSection>
    );
  }

  if (!devAccess) {
    return (
      <CloudStorageSection>
        <p>Settings can be changed only by developers and maintainers.</p>
      </CloudStorageSection>
    );
  }

  if (isLoading) {
    return (
      <CloudStorageSection>
        <Loader />
      </CloudStorageSection>
    );
  }

  if (!storageForProject || !notebooksVersion || error) {
    return (
      <CloudStorageSection>
        <ErrorAlert dismissible={false}>
          <h3 className={cx("fs-6", "fw-bold")}>
            Error on loading cloud storage settings
          </h3>
        </ErrorAlert>
      </CloudStorageSection>
    );
  }

  return (
    <CloudStorageSection isFetching={isFetching}>
      <CloudStorageSupportNotice notebooksVersion={notebooksVersion} />

      <Row>
        <Col>
          <AddCloudStorageButton />
        </Col>
      </Row>

      <CloudStorageList storageForProject={storageForProject} />
    </CloudStorageSection>
  );
}

function CloudStorageSection({
  isFetching,
  children,
}: {
  isFetching?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mt-2">
      <h3>
        Cloud storage settings
        {isFetching && <Loader className="ms-1" inline size={20} />}
      </h3>
      <p>Here you can configure cloud storage to be used during sessions.</p>
      <div>{children}</div>
    </div>
  );
}

interface CloudStorageSupportNoticeProps {
  notebooksVersion: NotebooksVersion;
}

function CloudStorageSupportNotice({
  notebooksVersion,
}: CloudStorageSupportNoticeProps) {
  const support = useMemo(
    () =>
      notebooksVersion.cloudStorageEnabled.s3
        ? "s3"
        : notebooksVersion.cloudStorageEnabled.azureBlob
        ? "azure"
        : "none",
    [notebooksVersion.cloudStorageEnabled]
  );

  if (support === "none") {
    return (
      <WarnAlert dismissible={false}>
        <p>
          This instance of RenkuLab does not support mounting cloud storage in
          sessions.
        </p>
      </WarnAlert>
    );
  }

  if (support === "azure") {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p>
          This instance of RenkuLab currently only supports starting sessions
          with Azure Blob Store cloud storage.
        </p>
      </InfoAlert>
    );
  }

  return (
    <InfoAlert dismissible={false} timeout={0}>
      <p>
        This instance of RenkuLab currently only supports starting sessions with
        S3 or S3-compatible cloud storage.
      </p>
    </InfoAlert>
  );
}

interface CloudStorageListProps {
  storageForProject: CloudStorage[];
}

function CloudStorageList({ storageForProject }: CloudStorageListProps) {
  if (storageForProject.length == 0) {
    return null;
  }

  return (
    <Container className={cx("p-0", "mt-2")} fluid>
      <Row className={cx("row-cols-1", "gy-2")}>
        {storageForProject.map((storageDefinition) => (
          <CloudStorageItem
            key={storageDefinition.storage.name}
            storageDefinition={storageDefinition}
          />
        ))}
      </Row>
    </Container>
  );
}

interface CloudStorageItemProps {
  storageDefinition: CloudStorage;
}

function CloudStorageItem({ storageDefinition }: CloudStorageItemProps) {
  const { storage } = storageDefinition;
  const { configuration, name, source_path, target_path } = storage;

  const formattedConfiguration = formatCloudStorageConfiguration({
    configuration,
    name,
  });

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Col>
      <Card>
        <CardBody className="p-0">
          <h3 className={cx("fs-6", "m-0")}>
            <button
              className={cx(
                "d-flex",
                "gap-3",
                "align-items-center",
                "w-100",
                "p-3",
                "bg-transparent",
                "border-0"
              )}
              onClick={toggle}
              type="button"
            >
              <div className="fw-bold">{name}</div>
              <div className={cx("small", "d-none", "d-sm-block")}>
                <span className="text-rk-text-light">Source path: </span>
                <span>{source_path}</span>
              </div>
              <div className={cx("small", "d-none", "d-sm-block")}>
                <span className="text-rk-text-light">Mount point: </span>
                <span>{target_path}</span>
              </div>
              <div className="ms-auto">
                <ChevronFlippedIcon flipped={isOpen} />
              </div>
            </button>
          </h3>
        </CardBody>
        <Collapse isOpen={isOpen}>
          <CloudStorageItemCollapsibleContent
            formattedConfiguration={formattedConfiguration}
            storageDefinition={storageDefinition}
          />
        </Collapse>
      </Card>
    </Col>
  );
}

interface CloudStorageItemCollapsibleContentProps {
  formattedConfiguration: string;
  storageDefinition: CloudStorage;
}

function CloudStorageItemCollapsibleContent({
  formattedConfiguration,
  storageDefinition,
}: CloudStorageItemCollapsibleContentProps) {
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = useCallback(() => {
    setEditMode((editMode) => !editMode);
  }, []);

  return (
    <CardBody className="pt-0">
      {editMode ? (
        <EditCloudStorage
          formattedConfiguration={formattedConfiguration}
          storageDefinition={storageDefinition}
          toggleEditMode={toggleEditMode}
        />
      ) : (
        <CloudStorageDetails
          formattedConfiguration={formattedConfiguration}
          storageDefinition={storageDefinition}
          toggleEditMode={toggleEditMode}
        />
      )}
    </CardBody>
  );
}

interface CloudStorageDetailsProps {
  formattedConfiguration: string;
  storageDefinition: CloudStorage;
  toggleEditMode: () => void;
}

function EditCloudStorage({
  formattedConfiguration,
  storageDefinition,
  toggleEditMode,
}: CloudStorageDetailsProps) {
  const { storage } = storageDefinition;
  const {
    configuration,
    name,
    readonly,
    source_path,
    storage_id,
    target_path,
  } = storage;

  const credentialFieldDefinitions = useMemo(
    () => getCredentialFieldDefinitions(storageDefinition),
    [storageDefinition]
  );

  const projectId = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]["id"]
  >((state) => state.stateModel.project.metadata.id);

  const [updateCloudStorage, result] = useUpdateCloudStorageMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
  } = useForm<UpdateCloudStorageForm>({
    defaultValues: {
      formattedConfiguration,
      name,
      private: storage.private,
      readonly,
      source_path,
      target_path,
      requiredCredentials: credentialFieldDefinitions ?? [],
    },
  });
  const { fields: requiredCredentialsFields } = useFieldArray({
    control,
    name: "requiredCredentials",
  });
  const onSubmit = useCallback(
    (data: UpdateCloudStorageForm) => {
      const nameUpdate = name !== data.name ? { name: data.name } : {};
      const sourcePathUpdate =
        source_path !== data.source_path
          ? { source_path: data.source_path }
          : {};
      const targetPathUpdate =
        target_path !== data.target_path
          ? { target_path: data.target_path }
          : {};
      const privateUpdate =
        storage.private !== data.private ? { private: data.private } : {};
      const readonlyUpdate =
        readonly !== data.readonly ? { readonly: data.readonly } : {};
      const credentialsUpdate = data.private
        ? data.requiredCredentials
            .filter(({ requiredCredential }) => requiredCredential)
            .reduce(
              (obj, { name }) => ({
                ...obj,
                [name]: CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
              }),
              {} as Record<string, string>
            )
        : {};
      const parsedConfiguration =
        formattedConfiguration !== data.formattedConfiguration
          ? parseCloudStorageConfiguration(data.formattedConfiguration)
          : storage.configuration;
      const sensitiveFields =
        credentialFieldDefinitions?.map(({ name }) => name) ?? [];
      const filteredConfiguration = Object.entries(parsedConfiguration)
        .filter(([key]) => !sensitiveFields.includes(key))
        .reduce(
          (obj, [key, value]) => ({ ...obj, [key]: value }),
          {} as Record<string, string | undefined>
        );
      const removedKeysConfiguration = Object.keys(configuration)
        .filter((key) => !sensitiveFields.includes(key))
        .filter((key) => !Object.keys(filteredConfiguration).includes(key))
        .reduce(
          (obj, key) => ({ ...obj, [key]: null }),
          {} as Record<string, string | undefined | null>
        );
      const configurationUpdate = {
        configuration: {
          ...filteredConfiguration,
          ...credentialsUpdate,
          ...removedKeysConfiguration,
        },
      };

      updateCloudStorage({
        storage_id,
        project_id: `${projectId}`,
        ...nameUpdate,
        ...sourcePathUpdate,
        ...targetPathUpdate,
        ...privateUpdate,
        ...readonlyUpdate,
        ...configurationUpdate,
      });
    },
    [
      configuration,
      credentialFieldDefinitions,
      formattedConfiguration,
      name,
      projectId,
      readonly,
      source_path,
      storage.configuration,
      storage.private,
      storage_id,
      target_path,
      updateCloudStorage,
    ]
  );

  const watchPrivateToggle = watch("private");

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggleEditMode();
    }
  }, [result.isError, result.isSuccess, toggleEditMode]);

  return (
    <Form
      className="form-rk-green"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="form-rk-green">
        <div className="mb-3">
          <Label className="form-label" for={`updateCloudStorageName-${name}`}>
            Name
          </Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                className={cx("form-control", errors.name && "is-invalid")}
                id={`updateCloudStorageName-${name}`}
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
          <Label
            className="form-label"
            for={`updateCloudStorageSourcePath-${name}`}
          >
            Source path
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
                id={`updateCloudStorageSourcePath-${name}`}
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

        <div className="mb-3">
          <Label
            className="form-label"
            for={`updateCloudStorageTargetPath-${name}`}
          >
            Mount point
          </Label>
          <Controller
            control={control}
            name="target_path"
            render={({ field }) => (
              <Input
                className={cx(
                  "form-control",
                  errors.target_path && "is-invalid"
                )}
                id={`updateCloudStorageTargetPath-${name}`}
                placeholder="folder"
                type="text"
                {...field}
              />
            )}
            rules={{ required: true }}
          />
          <div className="invalid-feedback">
            Please provide a valid mount point
          </div>
        </div>

        <div className="mb-3">
          <Controller
            control={control}
            name="private"
            render={({ field }) => (
              <Input
                aria-describedby={`updateCloudStoragePrivateHelp-${name}`}
                className="form-check-input"
                id={`updateCloudStoragePrivate-${name}`}
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
            for={`updateCloudStoragePrivate-${name}`}
          >
            Requires credentials
          </Label>
          <FormText id={`updateCloudStoragePrivateHelp-${name}`} tag="div">
            Check this box if this cloud storage requires credentials to be
            used.
          </FormText>
        </div>

        {watchPrivateToggle && requiredCredentialsFields.length > 0 && (
          <div className="mb-3">
            <div className="form-label">Required credentials</div>
            <div>
              {requiredCredentialsFields.map((item, index) => (
                <div key={index}>
                  <Controller
                    control={control}
                    name={`requiredCredentials.${index}.requiredCredential`}
                    render={({ field }) => (
                      <Input
                        className="form-check-input"
                        id={`updateCloudStorageCredentials-${name}-${item.id}`}
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
                    for={`updateCloudStorageCredentials-${name}-${item.id}`}
                  >
                    {item.name}
                    <CredentialMoreInfo help={item.help} />
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <Controller
            control={control}
            name="readonly"
            render={({ field }) => (
              <Input
                aria-describedby="updateCloudStorageReadOnlyHelp"
                className="form-check-input"
                id={`updateCloudStorageReadOnly-${name}`}
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
            for={`updateCloudStorageReadOnly-${name}`}
          >
            Read-only
          </Label>
          <FormText id="updateCloudStorageReadOnlyHelp" tag="div">
            This will mount the storage in read-only mode, regardless of write
            permissions on the account used to access.
          </FormText>
        </div>

        <div className="mb-3">
          <Label
            className="form-label"
            for={`updateCloudStorageConfig-${name}`}
          >
            Configuration
          </Label>
          <FormText id={`updateCloudStorageConfigHelp-${name}`} tag="div">
            You can paste here the output of{" "}
            <code className="user-select-all">
              rclone config show &lt;name&gt;
            </code>
            .
          </FormText>
          <Controller
            control={control}
            name="formattedConfiguration"
            render={({ field }) => (
              <textarea
                aria-describedby={`updateCloudStorageConfigHelp-${name}`}
                className={cx(
                  "form-control",
                  errors.formattedConfiguration && "is-invalid"
                )}
                id={`updateCloudStorageConfig-${name}`}
                placeholder={CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER}
                rows={Object.keys(storage.configuration).length + 2}
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

      <section className={cx("d-flex", "justify-content-end", "mt-3")}>
        <Button
          className={cx("btn-outline-rk-green", "ms-2")}
          onClick={toggleEditMode}
          type="button"
        >
          <XLg className={cx("bi", "me-1")} />
          Discard
        </Button>
        <Button className="ms-2" disabled={!isDirty} type="submit">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PencilSquare className={cx("bi", "me-1")} />
          )}
          Save changes
        </Button>
        <DeleteCloudStorageButton storageDefinition={storageDefinition} />
      </section>
    </Form>
  );
}

interface UpdateCloudStorageForm {
  formattedConfiguration: string;
  name: string;
  private: boolean;
  readonly: boolean;
  source_path: string;
  target_path: string;
  requiredCredentials: CloudStorageCredential[];
}

function CloudStorageDetails({
  formattedConfiguration,
  storageDefinition,
  toggleEditMode,
}: CloudStorageDetailsProps) {
  const { storage } = storageDefinition;
  const {
    configuration,
    name,
    readonly,
    source_path,
    storage_type,
    target_path,
  } = storage;

  const credentialFieldDefinitions = useMemo(
    () => getCredentialFieldDefinitions(storageDefinition),
    [storageDefinition]
  );
  const requiredCredentials = useMemo(
    () =>
      credentialFieldDefinitions?.filter(
        ({ requiredCredential }) => requiredCredential
      ),
    [credentialFieldDefinitions]
  );

  return (
    <>
      <section>
        <div>
          <div className="text-rk-text-light">
            <small>Name</small>
          </div>
          <div>{name}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Storage type</small>
          </div>
          <div>{storage_type}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>
              Source path {"("}usually &lt;bucket&gt; or
              &lt;bucket&gt;/&lt;folder&gt;{")"}
            </small>
          </div>
          <div>{source_path}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>
              Mount point {"("}this is where the storage will be mounted during
              sessions{")"}
            </small>
          </div>
          <div>{target_path}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Requires credentials</small>
          </div>
          <div>{storage.private ? "Yes" : "No"}</div>
        </div>
        {storage.private && (
          <div className="mt-2">
            <div className="text-rk-text-light">
              <small>Required crendentials</small>
            </div>
            {requiredCredentials != null && requiredCredentials.length > 0 ? (
              <ul className="ps-4">
                {requiredCredentials.map(({ name, help }, index) => (
                  <li key={index}>
                    {name}
                    <CredentialMoreInfo help={help} />
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <span className="fst-italic">None</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Access mode</small>
          </div>
          <div>
            {readonly
              ? "Force Read-only"
              : "Allow Read-Write (requires adequate privileges on the storage)"}
          </div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>
              Configuration (uses <code>rclone config</code>)
            </small>
          </div>
          <div>
            <textarea
              className="form-control"
              readOnly
              rows={Object.keys(configuration).length + 2}
              tabIndex={-1}
              value={formattedConfiguration}
            />
          </div>
        </div>
      </section>

      <section className={cx("d-flex", "justify-content-end", "mt-3")}>
        <Button color="outline-secondary" onClick={toggleEditMode}>
          <PencilSquare className={cx("bi", "me-1")} />
          Edit
        </Button>
        <DeleteCloudStorageButton storageDefinition={storageDefinition} />
      </section>
    </>
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

function DeleteCloudStorageButton({
  storageDefinition,
}: CloudStorageItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="ms-2" color="outline-danger" onClick={toggle}>
        <TrashFill className={cx("bi", "me-1")} />
        Delete
      </Button>
      <DeleteCloudStorageModal
        isOpen={isOpen}
        storage={storageDefinition.storage}
        toggle={toggle}
      />
    </>
  );
}

interface DeleteCloudStorageModalProps {
  isOpen: boolean;
  storage: CloudStorageConfiguration;
  toggle: () => void;
}

function DeleteCloudStorageModal({
  isOpen,
  storage,
  toggle,
}: DeleteCloudStorageModalProps) {
  const { name, storage_id } = storage;

  const projectId = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]["id"]
  >((state) => state.stateModel.project.metadata.id);

  const [deleteCloudStorage, result] = useDeleteCloudStorageMutation();
  const onDelete = useCallback(() => {
    deleteCloudStorage({
      project_id: `${projectId}`,
      storage_id,
    });
  }, [deleteCloudStorage, projectId, storage_id]);

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal
      className="modal-dialog-centered"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalBody>
        <h3 className={cx("fs-6", "lh-base", "text-danger", "fw-bold")}>
          Are you sure?
        </h3>
        <p className="mb-0">
          Please confirm that you want to delete the <strong>{name}</strong>{" "}
          storage configuration.
        </p>
      </ModalBody>
      <ModalFooter className="pt-0">
        <Button className="ms-2" color="outline-secondary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep configuration
        </Button>
        <Button className="ms-2" color="danger" onClick={onDelete}>
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete this configuration
        </Button>
      </ModalFooter>
    </Modal>
  );
}
