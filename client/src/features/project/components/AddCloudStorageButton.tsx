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
import { CheckLg, CloudFill, PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { RootStateOrAny, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
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
} from "reactstrap";
import { Loader } from "../../../components/Loader";
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import { RenkuMarkdown } from "../../../components/markdown/RenkuMarkdown";
import { StateModelProject } from "../Project";
import {
  useAddCloudStorageForProjectMutation,
  useUpdateCloudStorageMutation,
} from "../projectCloudStorage.api";
import {
  CLOUD_STORAGE_CONFIGURATION_PLACEHOLDER,
  CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN,
} from "../projectCloudStorage.constants";
import {
  CloudStorage,
  CloudStorageCredential,
} from "../projectCloudStorage.types";
import {
  getCredentialFieldDefinitions,
  parseCloudStorageConfiguration,
} from "../utils/projectCloudStorage.utils";

import styles from "./AddCloudStorageButton.module.scss";

export default function AddCloudStorageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Cloud Storage
      </Button>
      <AddCloudStorageModal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddCloudStorageModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddCloudStorageModal({ isOpen, toggle }: AddCloudStorageModalProps) {
  const [state, setState] = useState<AddCloudStorageModalState>({
    step: "configuration",
    mode: "simple",
  });
  const toggleAdvanced = useCallback(() => {
    setState((prevState) => {
      if (prevState.step === "credentials") {
        return prevState;
      }
      return {
        ...prevState,
        mode: prevState.mode === "advanced" ? "simple" : "advanced",
      };
    });
  }, []);
  const goToCredentialsStep = useCallback((storageDefinition: CloudStorage) => {
    setState({ step: "credentials", storageDefinition });
  }, []);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setState({ step: "configuration", mode: "simple" });
    }
  }, [isOpen]);

  return (
    <Modal
      centered
      className={styles.modal}
      fullscreen="lg"
      isOpen={isOpen}
      // scrollable
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        <CloudFill className={cx("bi", "me-2")} />
        Add Cloud Storage
      </ModalHeader>
      {state.step === "configuration" && (
        <ModalBody>
          <div className="form-rk-green">
            <div className={cx("form-check", "form-switch")}>
              <Input
                className={cx("form-check-input", "rounded-pill")}
                checked={state.mode === "advanced"}
                id="addCloudStorageAdvancedSwitch"
                onChange={toggleAdvanced}
                role="switch"
                type="checkbox"
              />
              <Label
                className="form-check-label"
                for="addCloudStorageAdvancedSwitch"
              >
                Advanced mode
              </Label>
            </div>
          </div>
        </ModalBody>
      )}
      {state.step === "credentials" ? (
        <AddCloudStorageCredentialsStep
          storageDefinition={state.storageDefinition}
          toggle={toggle}
        />
      ) : state.mode === "advanced" ? (
        <AdvancedAddCloudStorage
          goToCredentialsStep={goToCredentialsStep}
          toggle={toggle}
        />
      ) : (
        <SimpleAddCloudStorage
          goToCredentialsStep={goToCredentialsStep}
          toggle={toggle}
        />
      )}
    </Modal>
  );
}

type AddCloudStorageModalState =
  | {
      step: "configuration";
      mode: "simple" | "advanced";
    }
  | {
      step: "credentials";
      storageDefinition: CloudStorage;
    };

interface AddCloudStorageProps {
  goToCredentialsStep: (storageDefinition: CloudStorage) => void;
  toggle: () => void;
}

function AdvancedAddCloudStorage({
  goToCredentialsStep,
  toggle,
}: AddCloudStorageProps) {
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
      configuration: "",
      name: "",
      private: true,
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
      result.data.sensitive_fields == null ||
      result.data.sensitive_fields.length == 0
    ) {
      toggle();
      return;
    }
    goToCredentialsStep(result.data);
  }, [goToCredentialsStep, result.data, result.isSuccess, toggle]);

  return (
    <Form
      className="form-rk-green"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <ModalBody>
        {result.error && <RtkErrorAlert error={result.error} />}

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

interface AdvancedAddCloudStorageForm {
  configuration: string;
  name: string;
  private: boolean;
  source_path: string;
}

function SimpleAddCloudStorage({
  goToCredentialsStep,
  toggle,
}: AddCloudStorageProps) {
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

  // Handle picking required credentials if necessary
  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    if (
      result.data.sensitive_fields == null ||
      result.data.sensitive_fields.length == 0
    ) {
      toggle();
      return;
    }
    goToCredentialsStep(result.data);
  }, [goToCredentialsStep, result.data, result.isSuccess, toggle]);

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
                  className={cx(errors.name && "is-invalid")}
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
                  className={cx(errors.endpointUrl && "is-invalid")}
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

interface AddCloudStorageCredentialsStepProps {
  storageDefinition: CloudStorage;
  toggle: () => void;
}

function AddCloudStorageCredentialsStep({
  storageDefinition,
  toggle,
}: AddCloudStorageCredentialsStepProps) {
  const { storage } = storageDefinition;
  const { configuration, name, project_id, storage_id } = storage;

  const [updateCloudStorage, result] = useUpdateCloudStorageMutation();

  const { control, handleSubmit } = useForm<AddCloudStorageCredentialsForm>({
    defaultValues: {
      requiredCredentials: getCredentialFieldDefinitions(storageDefinition),
    },
  });
  const { fields: credentialFields } = useFieldArray({
    control,
    name: "requiredCredentials",
  });
  const onSubmit = useCallback(
    (data: AddCloudStorageCredentialsForm) => {
      const updateConfig = data.requiredCredentials.reduce(
        (prev, { name, requiredCredential }) => ({
          ...prev,
          ...(requiredCredential
            ? { [name]: CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN }
            : {}),
        }),
        {} as Record<string, string>
      );

      updateCloudStorage({
        project_id,
        storage_id,
        configuration: {
          ...configuration,
          ...updateConfig,
        },
      });
    },
    [configuration, project_id, storage_id, updateCloudStorage]
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
        <h5>Credentials</h5>
        <p>
          Please select which credentials are required for the{" "}
          <strong>{name}</strong> cloud storage.
        </p>

        <Container className={cx("form-rk-green", "p-0")} fluid>
          <Row className={cx("row-cols-1", "gy-2")}>
            {credentialFields.map((item, index) => (
              <Col>
                <Card key={item.id}>
                  <CardBody className="pb-0">
                    <Controller
                      control={control}
                      name={`requiredCredentials.${index}.requiredCredential`}
                      render={({ field }) => (
                        <Input
                          aria-describedby={`configureCloudStorageCredentialsHelp-${item.id}`}
                          className="form-check-input"
                          id={`configureCloudStorageCredentials-${item.id}`}
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
                      for={`configureCloudStorageCredentials-${item.id}`}
                    >
                      {item.name}
                    </Label>
                    <FormText
                      id={`configureCloudStorageCredentialsHelp-${item.id}`}
                      tag="div"
                    >
                      <RenkuMarkdown markdownText={item.help} />
                    </FormText>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </ModalBody>
      <ModalFooter>
        <Button disabled={result.isLoading} type="submit">
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Finish cloud storage setup
        </Button>
      </ModalFooter>
    </Form>
  );
}

interface AddCloudStorageCredentialsForm {
  requiredCredentials: CloudStorageCredential[];
}
