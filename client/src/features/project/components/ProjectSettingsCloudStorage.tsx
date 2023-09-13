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
  ChevronDown,
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
import { ErrorAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { User } from "../../../model/RenkuModels";
import {
  CloudStorage,
  CloudStorageConfiguration,
  CloudStorageSensitiveFieldDefinition,
} from "../../dataServices/dataServices.types";
import {
  useDeleteCloudStorageMutation,
  useGetCloudStorageForProjectQuery,
  useUpdateCloudStorageMutation,
} from "../../dataServices/dataServicesApi";
import { StateModelProject } from "../Project";
import { CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER } from "../projectCloudStorage.constants";
import {
  formatCloudStorageConfiguration,
  getSensitiveFieldDefinitions,
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
    error,
    isFetching,
    isLoading,
  } = useGetCloudStorageForProjectQuery({
    project_id: `${projectId}`,
  });

  if (!logged) {
    const textIntro =
      "Only authenticated users can access cloud storage setting.";
    const textPost = "to visualize sessions settings.";
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

  if (!storageForProject || error) {
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
      <div className="form-rk-green">{children}</div>
    </div>
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
        {storageForProject.map((storageDefinition, index) => (
          <CloudStorageItem
            key={`${storageDefinition.storage.name}-${index}`}
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
                <ChevronDown />
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

function CloudStorageDetails({
  formattedConfiguration,
  storageDefinition,
  toggleEditMode,
}: CloudStorageDetailsProps) {
  const { storage } = storageDefinition;
  const { configuration, name, source_path, storage_type, target_path } =
    storage;

  const sensitiveFieldDefinitions = useMemo(
    () => getSensitiveFieldDefinitions(storageDefinition),
    [storageDefinition]
  );
  const requiredCredentials = useMemo(
    () =>
      sensitiveFieldDefinitions?.filter(
        ({ requiredCredential }) => requiredCredential
      ),
    [sensitiveFieldDefinitions]
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
                    {/* <button type="button">
                      <InfoCircleFill className={cx("bi", "ms-1")} />
                    </button> */}
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
          {help
            .trim()
            .split("\n")
            .map((line) => (
              <>
                {line}
                <br />
              </>
            ))}
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

interface CloudStorageModalProps {
  isOpen: boolean;
  storage: CloudStorageConfiguration;
  toggle: () => void;
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
  const { sensitive_fields, storage } = storageDefinition;
  const { configuration, name, source_path, storage_id, target_path } = storage;

  const sensitiveFieldDefinitions = useMemo(
    () => getSensitiveFieldDefinitions(storageDefinition),
    [storageDefinition]
  );
  const requiredCredentials = useMemo(
    () =>
      sensitiveFieldDefinitions
        ?.filter(({ requiredCredential }) => requiredCredential)
        .map(({ name }) => name) ?? [],
    [sensitiveFieldDefinitions]
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
      source_path,
      target_path,

      requiredCredentials: sensitiveFieldDefinitions ?? [],
    },
  });
  const { fields: requiredCredentialsFields } = useFieldArray({
    control,
    name: "requiredCredentials",
  });
  const onSubmit = useCallback(
    (data: UpdateCloudStorageForm) => {
      console.log({ data });

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
      const credentialsUpdate = data.requiredCredentials
        .filter(({ requiredCredential }) => requiredCredential)
        .reduce(
          (obj, { name }) => ({ ...obj, [name]: "<sensitive>" }),
          {} as Record<string, string>
        );
      const configUpdate =
        formattedConfiguration !== data.formattedConfiguration
          ? {
              configuration: {
                ...parseCloudStorageConfiguration(data.formattedConfiguration),
                ...credentialsUpdate,
              },
            }
          : { configuration: credentialsUpdate };

      updateCloudStorage({
        storage_id,
        project_id: `${projectId}`,
        ...nameUpdate,
        ...sourcePathUpdate,
        ...targetPathUpdate,
        ...privateUpdate,
        ...configUpdate,
      });
    },
    [
      formattedConfiguration,
      name,
      projectId,
      source_path,
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
          <Label className="form-label" for="updateCloudStorageName">
            Name
          </Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                className={cx("form-control", errors.name && "is-invalid")}
                id="updateCloudStorageName"
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
          <Label className="form-label" for="updateCloudStorageSourcePath">
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
                id="updateCloudStorageSourcePath"
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
          <Label className="form-label" for="updateCloudStorageTargetPath">
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
                id="updateCloudStorageTargetPath"
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
                aria-describedby="updateCloudStoragePrivateHelp"
                className="form-check-input"
                id="updateCloudStoragePrivate"
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
            for="updateCloudStoragePrivate"
          >
            Requires credentials
          </Label>
          <FormText id="updateCloudStoragePrivateHelp" tag="div">
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
                        id={`updateCloudStorageCredentials-${item.id}`}
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
                    for={`updateCloudStorageCredentials-${item.id}`}
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
          <Label className="form-label" for="updateCloudStorageConfig">
            Configuration
          </Label>
          <FormText id="updateCloudStorageConfigHelp" tag="div">
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
                aria-describedby="updateCloudStorageConfigHelp"
                className={cx(
                  "form-control",
                  errors.formattedConfiguration && "is-invalid"
                )}
                id="updateCloudStorageConfig"
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
          <PencilSquare className={cx("bi", "me-1")} />
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
  source_path: string;
  target_path: string;

  requiredCredentials: (CloudStorageSensitiveFieldDefinition & {
    requiredCredential: boolean;
  })[];
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

function DeleteCloudStorageModal({
  isOpen,
  storage,
  toggle,
}: CloudStorageModalProps) {
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
          Cancel, keep configuration
        </Button>
        <Button className="ms-2" color="danger" onClick={onDelete}>
          Yes, delete this configuration
        </Button>
      </ModalFooter>
    </Modal>
  );
}
