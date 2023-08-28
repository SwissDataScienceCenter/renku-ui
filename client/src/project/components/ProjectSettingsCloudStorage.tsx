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

import React, { ReactNode, useCallback, useState } from "react";
import cx from "classnames";
import { RootStateOrAny, useSelector } from "react-redux";
import { ACCESS_LEVELS } from "../../api-client";
import { ErrorAlert } from "../../components/Alert";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import {
  useAddCloudStorageForProjectMutation,
  useGetCloudStorageForProjectQuery,
} from "../../features/dataServices/dataServicesApi";
import { StateModelProject } from "../../features/project/Project";
import { User } from "../../model/RenkuModels";
import {
  Button,
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
import { PlusLg, CloudFill } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../../components/Loader";

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
    project_id: projectId,
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
      <pre>{JSON.stringify(storageForProject, null, 2)}</pre>
      <pre>{JSON.stringify(error, null, 2)}</pre>
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
    <Modal fullscreen="lg" isOpen={isOpen} size="lg" toggle={toggle}>
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

function AdvancedAddCloudStorage({ toggle }: FormAddCloudStorageProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: "",
      config: "",
    },
  });
  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  const configPlaceHolder =
    "[example]\n\
type = s3\n\
provider = AWS\n\
access_key_id = ACCESS_KEY_ID\n\
secret_access_key = SECRET_ACCESS_KEY\n\
region = us-east-1";

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

function SimpleAddCloudStorage({ toggle }: FormAddCloudStorageProps) {
  const projectId = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]["id"]
  >((state) => state.stateModel.project.metadata.id);

  const [addCloudStorageForProject] = useAddCloudStorageForProjectMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SimpleAddCloudStorageForm>({
    defaultValues: {
      name: "",
      endpointUrl: "",
    },
  });
  const onSubmit = useCallback(
    (data: SimpleAddCloudStorageForm) => {
      console.log(data);
      addCloudStorageForProject({
        project_id: `${projectId}`,
        storage_url: data.endpointUrl,
        target_path: data.name,
      });
    },
    [addCloudStorageForProject, projectId]
  );

  return (
    <Form
      className="form-rk-green"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <ModalBody>
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

interface SimpleAddCloudStorageForm {
  name: string;
  endpointUrl: string;
}
