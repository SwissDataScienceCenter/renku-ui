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

import { ReactNode, useCallback, useEffect, useState } from "react";
import cx from "classnames";
import {
  ChevronDown,
  CloudFill,
  PencilSquare,
  PlusLg,
  Trash3Fill,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { RootStateOrAny, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../api-client";
import { ErrorAlert } from "../../components/Alert";
import { Loader } from "../../components/Loader";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import {
  CloudStorage,
  CloudStorageListItem,
} from "../../features/dataServices/dataServices.types";
import {
  useAddCloudStorageForProjectMutation,
  useDeleteCloudStorageMutation,
  useGetCloudStorageForProjectQuery,
  useUpdateCloudStorageMutation,
} from "../../features/dataServices/dataServicesApi";
import { StateModelProject } from "../../features/project/Project";
import { User } from "../../model/RenkuModels";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";

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
    <CloudStorageSection>
      <AddCloudStorageButton />
      <CloudStorageListAlt storageForProject={storageForProject} />
      <CloudStorageList storageForProject={storageForProject} />
    </CloudStorageSection>
  );
}

function CloudStorageSection({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-2">
      <h3>Cloud storage settings</h3>
      <p>Here you can configure cloud storage to be used during sessions.</p>
      <div className="form-rk-green">{children}</div>
    </div>
  );
}

function AddCloudStorageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    console.log("source toggle()");
    setIsOpen((open) => !open);
  }, []);

  return (
    <Row>
      <Col>
        <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
          <PlusLg className={cx("bi", "me-1")} />
          Add Cloud Storage
        </Button>
        <AddCloudStorageModal isOpen={isOpen} toggle={toggle} />
      </Col>
    </Row>
  );
}

interface AddCloudStorageModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddCloudStorageModal({ isOpen, toggle }: AddCloudStorageModalProps) {
  const [advanced, setAdvanced] = useState(false);
  const toggleAdvanced = useCallback(() => {
    setAdvanced((advanced) => !advanced);
  }, []);

  return (
    <Modal
      className="modal-dialog-centered"
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        <CloudFill className={cx("bi", "me-2")} />
        Add Cloud Storage
      </ModalHeader>
      <ModalBody>
        <div className="form-rk-green">
          <div className={cx("form-check", "form-switch")}>
            <Input
              className={cx(
                "form-check-input",
                "rounded-pill",
                "cursor-pointer"
              )}
              checked={advanced}
              id="addCloudStorageAdvancedSwitch"
              onChange={toggleAdvanced}
              role="switch"
              type="checkbox"
            />
            <Label
              className={cx("form-check-label", "cursor-pointer")}
              for="addCloudStorageAdvancedSwitch"
            >
              Advanced mode
            </Label>
          </div>
        </div>
      </ModalBody>
      {advanced ? (
        <AdvancedAddCloudStorage toggle={toggle} />
      ) : (
        <SimpleAddCloudStorage toggle={toggle} />
      )}
    </Modal>
  );
}

interface FormAddCloudStorageProps {
  toggle: () => void;
}

const configPlaceHolder =
  "[example]\n\
type = s3\n\
provider = AWS\n\
region = us-east-1";

function AdvancedAddCloudStorage({ toggle }: FormAddCloudStorageProps) {
  const projectId = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]["id"]
  >((state) => state.stateModel.project.metadata.id);

  const [addCloudStorageForProject, result] =
    useAddCloudStorageForProjectMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<AdvancedAddCloudStorageForm>({
    defaultValues: {
      config: "",
      name: "",
      private: false,
      source_path: "",
    },
  });
  const onSubmit = useCallback(
    (data: AdvancedAddCloudStorageForm) => {
      console.log(data);

      const configuration = parseConfigContent(data.config);

      addCloudStorageForProject({
        configuration,
        name: data.name,
        private: data.private,
        project_id: `${projectId}`,
        source_path: data.source_path,
        target_path: data.name,
      });
    },
    [addCloudStorageForProject, projectId]
  );

  useEffect(() => {
    if (result.isSuccess) {
      toggle();
    }
  }, [result.isSuccess, toggle]);

  return (
    <Form
      className="form-rk-green"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <ModalBody>
        <div className="form-rk-green">
          <p className="mb-3">
            Advanded mode uses <code>rclone</code> configurations to set up
            cloud storage.
          </p>

          <div className="mb-3">
            <Label className="form-label" for="addCloudStorageName">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
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

          <div className="mb-3">
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
              name="config"
              render={({ field }) => (
                <textarea
                  aria-describedby="addCloudStorageConfigHelp"
                  className={cx("form-control", errors.config && "is-invalid")}
                  id="addCloudStorageConfig"
                  placeholder={configPlaceHolder}
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
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          Close
        </Button>
        <Button type="submit">Next</Button>
      </ModalFooter>
    </Form>
  );
}

interface AdvancedAddCloudStorageForm {
  config: string;
  name: string;
  private: boolean;
  source_path: string;
}

function SimpleAddCloudStorage({ toggle }: FormAddCloudStorageProps) {
  const projectId = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]["id"]
  >((state) => state.stateModel.project.metadata.id);

  const [addCloudStorageForProject, result] =
    useAddCloudStorageForProjectMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SimpleAddCloudStorageForm>({
    defaultValues: {
      name: "",
      endpointUrl: "",
      private: true,
    },
  });
  const onSubmit = useCallback(
    (data: SimpleAddCloudStorageForm) => {
      console.log(data);
      addCloudStorageForProject({
        name: data.name,
        private: data.private,
        project_id: `${projectId}`,
        storage_url: data.endpointUrl,
        target_path: data.name,
      });
    },
    [addCloudStorageForProject, projectId]
  );

  useEffect(() => {
    if (result.isSuccess && !result.data.storage.private) {
      console.log("Toggle!");
      toggle();
    }
  }, [result.data?.storage.private, result.isSuccess, toggle]);

  if (result.isSuccess && result.data.storage.private) {
    return <AddCloudStorageCredentialsForm />;
  }

  return (
    <Form
      className="form-rk-green"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <ModalBody>
        {result.error && <RtkErrorAlert error={result.error} />}

        <div className="form-rk-green">
          <div className="mb-3">
            <Label className="form-label" for="addCloudStorageName">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
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
            <Label className="form-label" for="addCloudStorageUrl">
              Endpoint URL
            </Label>
            <Controller
              control={control}
              name="endpointUrl"
              render={({ field }) => (
                <Input
                  className={cx(
                    "form-control",
                    errors.endpointUrl && "is-invalid"
                  )}
                  id="addCloudStorageUrl"
                  placeholder="s3://bucket.endpoint.example.com/"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a valid URL</div>
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
        </div>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button disabled={result.isLoading} type="submit">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PlusLg className={cx("bi", "me-1")} />
          )}
          Add Storage
        </Button>
      </ModalFooter>
    </Form>
  );
}

interface SimpleAddCloudStorageForm {
  name: string;
  endpointUrl: string;
  private: boolean;
}

function AddCloudStorageCredentialsForm() {
  return (
    <div>
      <h5>Ask for creds</h5>
    </div>
  );
}

interface CloudStorageListProps {
  storageForProject: CloudStorageListItem[];
}

function CloudStorageListAlt({ storageForProject }: CloudStorageListProps) {
  if (storageForProject.length == 0) {
    return null;
  }

  return (
    <Container className={cx("p-0", "mt-2")} fluid>
      <Row className={cx("row-cols-1", "gy-2")}>
        {storageForProject.map(({ storage }, index) => (
          <CloudStorageItemAlt
            key={`${storage.name}-${index}`}
            storage={storage}
          />
        ))}
      </Row>
    </Container>
  );
}

function CloudStorageItemAlt({ storage }: CloudStorageItemProps) {
  const { configuration, name, source_path, target_path } = storage;

  const configContent = `[${name}]
${Object.entries(configuration)
  .map(([key, value]) => `${key} = ${value}`)
  .join("\n")}`;

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
                <span className="text-rk-text-light">Source Path: </span>
                <span>{source_path}</span>
              </div>
              <div className={cx("small", "d-none", "d-sm-block")}>
                <span className="text-rk-text-light">Mount Point: </span>
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
            configContent={configContent}
            storage={storage}
          />
        </Collapse>
      </Card>
    </Col>
  );
}

function CloudStorageItemCollapsibleContent({
  configContent,
  storage,
}: CloudStorageDetailsAltProps) {
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = useCallback(() => {
    setEditMode((editMode) => !editMode);
  }, []);

  return (
    <CardBody className="pt-0">
      {editMode ? (
        <EditCloudStorage
          configContent={configContent}
          storage={storage}
          toggleEditMode={toggleEditMode}
        />
      ) : (
        <CloudStorageDetailsAlt
          configContent={configContent}
          storage={storage}
        />
      )}

      <section className={cx("d-flex", "justify-content-end", "mt-3")}>
        <Button color="outline-secondary" onClick={toggleEditMode}>
          <PencilSquare className={cx("bi", "me-1")} />
          Edit
        </Button>
        <DeleteCloudStorageButton storage={storage} />
      </section>
    </CardBody>
  );
}

interface CloudStorageDetailsAltProps {
  configContent: string;
  storage: CloudStorage;
}

function CloudStorageDetailsAlt({
  configContent,
  storage,
}: CloudStorageDetailsAltProps) {
  const { configuration, name, source_path, storage_type, target_path } =
    storage;

  return (
    <section>
      <div>
        <div className="text-rk-text-light">
          <small>Name</small>
        </div>
        <div>{name}</div>
      </div>
      <div className="mt-2">
        <div className="text-rk-text-light">
          <small>Storage Type</small>
        </div>
        <div>{storage_type}</div>
      </div>
      <div className="mt-2">
        <div className="text-rk-text-light">
          <small>
            Source Path {"("}usually &lt;bucket&gt; or
            &lt;bucket&gt;/&lt;folder&gt;{")"}
          </small>
        </div>
        <div>
          <code>{source_path}</code>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-rk-text-light">
          <small>
            Target Path {"("}this is where the storage will be mounted during
            sessions{")"}
          </small>
        </div>
        <div>
          <code>{target_path}</code>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-rk-text-light">
          <small>Requires credentials</small>
        </div>
        <div>{storage.private ? "Yes" : "No"}</div>
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
            value={configContent}
          />
        </div>
      </div>
    </section>
  );
}

function CloudStorageList({ storageForProject }: CloudStorageListProps) {
  if (storageForProject.length == 0) {
    return null;
  }

  return (
    <Row
      className={cx(
        "mt-4",
        "d-none" // TODO: remove these components
      )}
    >
      <Col className="table-responsive">
        <Table className="table-hover">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Source Path</th>
              <th scope="col">Mount Point</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {storageForProject.map(({ storage }) => (
              <CloudStorageItem key={storage.name} storage={storage} />
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}

interface CloudStorageItemProps {
  storage: CloudStorage;
}

function CloudStorageItem({ storage }: CloudStorageItemProps) {
  const { name, source_path, target_path } = storage;

  return (
    <tr>
      <th scope="row">{name}</th>
      <td>
        <code>{source_path}</code>
      </td>
      <td>
        <code>{target_path}</code>
      </td>
      <td className="text-end">
        <span
          className={cx("d-inline-flex", "flex-row", "flex-no-wrap")}
          style={{ width: "max-content" }}
        >
          <ViewCloudStorageButton storage={storage} />
          <DeleteCloudStorageButton storage={storage} />
        </span>
      </td>
    </tr>
  );
}

function ViewCloudStorageButton({ storage }: CloudStorageItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-secondary" onClick={toggle}>
        View Details
      </Button>
      <ViewCloudStorageModal
        isOpen={isOpen}
        storage={storage}
        toggle={toggle}
      />
    </>
  );
}

interface CloudStorageModalProps {
  isOpen: boolean;
  storage: CloudStorage;
  toggle: () => void;
}

function ViewCloudStorageModal({
  isOpen,
  storage,
  toggle,
}: CloudStorageModalProps) {
  const { configuration, name } = storage;

  const configContent = `[${name}]
${Object.entries(configuration)
  .map(([key, value]) => `${key} = ${value}`)
  .join("\n")}`;

  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = useCallback(() => {
    setEditMode((editMode) => !editMode);
  }, []);

  // Reset `editMode` when closing modal
  useEffect(() => {
    if (!isOpen) {
      setEditMode(false);
    }
  }, [isOpen]);

  return (
    <Modal
      className="modal-dialog-centered"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Cloud Storage Details</ModalHeader>
      {editMode ? (
        <EditCloudStorage
          configContent={configContent}
          storage={storage}
          toggleEditMode={toggleEditMode}
        />
      ) : (
        <CloudStorageDetails
          configContent={configContent}
          storage={storage}
          toggleEditMode={toggleEditMode}
        />
      )}
    </Modal>
  );
}

interface CloudStorageDetailsProps {
  configContent: string;
  storage: CloudStorage;
  toggleEditMode: () => void;
}

function EditCloudStorage({
  configContent,
  storage,
  toggleEditMode,
}: CloudStorageDetailsProps) {
  const { name, source_path, storage_id, target_path } = storage;

  const projectId = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]["id"]
  >((state) => state.stateModel.project.metadata.id);

  const [updateCloudStorage, result] = useUpdateCloudStorageMutation();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<UpdateCloudStorageForm>({
    defaultValues: {
      configContent,
      name,
      private: storage.private,
      source_path,
      target_path,
    },
  });
  const onSubmit = useCallback(
    (data: UpdateCloudStorageForm) => {
      console.log(data);

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
      const configUpdate =
        configContent !== data.configContent
          ? {
              configuration: parseConfigContent(data.configContent),
            }
          : {};

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
      configContent,
      name,
      projectId,
      source_path,
      storage.private,
      storage_id,
      target_path,
      updateCloudStorage,
    ]
  );

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
      <ModalBody>
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
              Target Path
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
              Please provide a valid target path
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
              name="configContent"
              render={({ field }) => (
                <textarea
                  aria-describedby="updateCloudStorageConfigHelp"
                  className={cx(
                    "form-control",
                    errors.configContent && "is-invalid"
                  )}
                  id="updateCloudStorageConfig"
                  placeholder={configPlaceHolder}
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
      </ModalBody>
      <ModalFooter>
        <Button
          className="ms-2"
          color="outline-secondary"
          onClick={toggleEditMode}
        >
          <XLg className={cx("bi", "me-1")} />
          Discard
        </Button>
        <Button
          className="ms-2"
          disabled={!isDirty}
          // onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          <PencilSquare className={cx("bi", "me-1")} />
          Save changes
        </Button>
      </ModalFooter>
    </Form>
  );
}

interface UpdateCloudStorageForm {
  configContent: string;
  name: string;
  private: boolean;
  source_path: string;
  target_path: string;
}

function parseConfigContent(configContent: string): Record<string, string> {
  // Parse lines of rclone configuration
  const configLineRegex = /^(?<key>[^=]+)=(?<value>.*)$/;

  const entries = configContent.split("\n").flatMap((line) => {
    const match = line.match(configLineRegex);
    if (!match) {
      return [];
    }

    const key = match.groups?.["key"]?.trim() ?? "";
    const value = match.groups?.["value"]?.trim() ?? "";
    if (!key) {
      return [];
    }
    return [{ key, value }];
  });

  return entries.reduce(
    (obj, { key, value }) => ({ ...obj, [key]: value }),
    {}
  );
}

function CloudStorageDetails({
  configContent,
  storage,
  toggleEditMode,
}: CloudStorageDetailsProps) {
  const { configuration, name, source_path, storage_type, target_path } =
    storage;

  return (
    <>
      <ModalBody>
        <div>
          <div className="text-rk-text-light">
            <small>Name</small>
          </div>
          <div>{name}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Storage Type</small>
          </div>
          <div>{storage_type}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>
              Source Path {"("}usually &lt;bucket&gt; or
              &lt;bucket&gt;/&lt;folder&gt;{")"}
            </small>
          </div>
          <div>
            <code>{source_path}</code>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>
              Target Path {"("}this is where the storage will be mounted during
              sessions{")"}
            </small>
          </div>
          <div>
            <code>{target_path}</code>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Requires credentials</small>
          </div>
          <div>{storage.private ? "Yes" : "No"}</div>
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
              value={configContent}
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className="ms-2"
          color="outline-secondary"
          onClick={toggleEditMode}
        >
          <PencilSquare className={cx("bi", "me-1")} />
          Edit
        </Button>
      </ModalFooter>
    </>
  );
}

function DeleteCloudStorageButton({ storage }: CloudStorageItemProps) {
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
        storage={storage}
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
