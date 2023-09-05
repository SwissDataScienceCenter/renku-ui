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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ExclamationTriangleFill,
  PencilSquare,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
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
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../../../api-client";
import { ErrorAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { Url } from "../../../../utils/helpers/url";
import { useGetCloudStorageForProjectQuery } from "../../../dataServices/dataServicesApi";
import { StateModelProject } from "../../../project/Project";
import { useGetNotebooksVersionsQuery } from "../../../versions/versionsApi";
import { SessionCloudStorageV2 } from "../../startSessionOptions.types";
import {
  setCloudStorageV2,
  updateCloudStorageV2Item,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";

export default function SessionCloudStorageOptionV2() {
  const { data, isLoading } = useGetNotebooksVersionsQuery();

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

  return data?.cloudStorageEnabled.s3 ? <SessionS3CloudStorageOption /> : null;
}

function SessionS3CloudStorageOption() {
  const { namespace, path } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);

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
  const { accessLevel, id: projectId } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);

  const devAccess = accessLevel >= ACCESS_LEVELS.DEVELOPER;

  const cloudStorageList = useStartSessionOptionsSelector(
    ({ cloudStorageV2 }) => cloudStorageV2
  );

  const dispatch = useDispatch();

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
    const initialCloudStorage: SessionCloudStorageV2[] = storageForProject.map(
      ({ storage, sensitive_fields }) => ({
        active: true,
        ...(sensitive_fields
          ? {
              sensitive_fields: sensitive_fields.map(({ name }) => ({
                name,
                value: "",
              })),
            }
          : {}),
        ...storage,
      })
    );
    dispatch(setCloudStorageV2(initialCloudStorage));
  }, [dispatch, storageForProject]);

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
              <CloudStorageItemAlt
                index={index}
                key={`${storage.name}-${index}`}
                storage={storage}
              />
            ))}
          </Row>
        </Container>
      )}
      {cloudStorageList.length > 0 && (
        <Row
          className="d-none" // TODO: remove these components
        >
          <Col className="table-responsive">
            <Table className="table-hover">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Mount Point</th>
                  <th scope="col">Enabled</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {cloudStorageList.map((storage, index) => (
                  <CloudStorageItem
                    index={index}
                    key={storage.name}
                    storage={storage}
                  />
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}
    </>
  );
}

function CloudStorageItemAlt({ index, storage }: CloudStorageItemProps) {
  const {
    active,
    configuration,
    name,
    sensitive_fields,
    source_path,
    storage_type,
    target_path,
  } = storage;

  const providedSensitiveFields = useMemo(
    () =>
      Object.entries(configuration)
        .filter(([, value]) => value === "<sensitive>")
        .map(([key]) => key),
    [configuration]
  );
  const requiredSensitiveFields = useMemo(
    () =>
      sensitive_fields?.filter(({ name }) =>
        providedSensitiveFields.includes(name)
      ),
    [providedSensitiveFields, sensitive_fields]
  );

  const configContent = `[${name}]
${Object.entries(configuration)
  .map(([key, value]) => `${key} = ${value}`)
  .join("\n")}`;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const dispatch = useDispatch();

  const onToggleActive = useCallback(() => {
    dispatch(
      updateCloudStorageV2Item({
        index,
        storage: { ...storage, active: !storage.active },
      })
    );
  }, [dispatch, index, storage]);

  return (
    <Col>
      <Card>
        <CardBody className={cx("p-0", "d-flex", "align-items-center")}>
          <div className={cx("ps-3", "py-3")}>
            <Input
              className="form-check-input"
              checked={active}
              id="cloudStorageItemActive"
              onChange={onToggleActive}
              type="checkbox"
            />
            <Label className="visually-hidden" for="cloudStorageItemActive">
              Mount in this session
            </Label>
          </div>
          <h3 className={cx("fs-6", "m-0", "w-100")}>
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
              <div
                className={cx(
                  "fw-bold",
                  !active && [
                    "text-decoration-line-through",
                    "text-rk-text-light",
                  ]
                )}
              >
                {name}
              </div>
              <div className={cx("small", "d-none", "d-sm-block")}>
                <span className="text-rk-text-light">Mount Point: </span>
                {active ? (
                  <span>{target_path}</span>
                ) : (
                  <span className="fst-italic">Not mounted</span>
                )}
              </div>
              <div className="ms-auto">
                <ChevronDown />
              </div>
            </button>
          </h3>
        </CardBody>
        {requiredSensitiveFields != null &&
          requiredSensitiveFields.length > 0 && (
            <CardBody className="pt-0">
              <h5 className={cx("fs-6", "m-0")}>Credentials</h5>
              <p className={cx("form-text", "mt-0", "mb-1")}>
                Please fill in the credentials required to use this cloud
                storage
              </p>
              {requiredSensitiveFields.map((item, index) => (
                <div className="mb-3" key={index}>
                  <Label
                    className="form-label"
                    for={`credentials-${item.name}`}
                  >
                    {item.name}
                  </Label>
                  <Input
                    id={`credentials-${item.name}`}
                    type="text"
                    value={item.value}
                  />
                </div>
              ))}
            </CardBody>
          )}
        <Collapse isOpen={isOpen}>
          <CardBody className="pt-0">Storage details</CardBody>
        </Collapse>
      </Card>
    </Col>
  );
}

interface CloudStorageItemProps {
  index: number;
  storage: SessionCloudStorageV2;
}

function CloudStorageItem({ index, storage }: CloudStorageItemProps) {
  const { active, name, target_path } = storage;

  const dispatch = useDispatch();

  const onToggleActive = useCallback(() => {
    dispatch(
      updateCloudStorageV2Item({
        index,
        storage: { ...storage, active: !storage.active },
      })
    );
  }, [dispatch, index, storage]);

  return (
    <tr>
      <th scope="row">{name}</th>
      <td>
        <code>{target_path}</code>
      </td>
      <td>
        <Input
          className="form-check-input"
          type="checkbox"
          checked={active}
          onChange={onToggleActive}
        />
      </td>
      <td className="text-end">
        <span
          className={cx("d-inline-flex", "flex-row", "flex-no-wrap")}
          style={{ width: "max-content" }}
        >
          <ConfigureCloudStorageButton index={index} storage={storage} />
        </span>
      </td>
    </tr>
  );
}

function ConfigureCloudStorageButton({ storage }: CloudStorageItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const hasSensitiveFields =
    storage.sensitive_fields != null && storage.sensitive_fields.length > 0;

  return (
    <>
      <Button color="outline-secondary" onClick={toggle}>
        {hasSensitiveFields && (
          <ExclamationTriangleFill
            className={cx("bi", "me-1", "text-warning")}
          />
        )}
        Configure
      </Button>
      <ConfigureCloudStorageModal
        isOpen={isOpen}
        storage={storage}
        toggle={toggle}
      />
    </>
  );
}

interface ConfigureCloudStorageModalProps {
  isOpen: boolean;
  storage: SessionCloudStorageV2;
  toggle: () => void;
}

function ConfigureCloudStorageModal({
  isOpen,
  storage,
  toggle,
}: ConfigureCloudStorageModalProps) {
  const {
    active,
    configuration,
    name,
    sensitive_fields,
    source_path,
    target_path,
  } = storage;

  const configContent = `[${name}]
${Object.entries(configuration)
  .map(([key, value]) => `${key} = ${value}`)
  .join("\n")}`;

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ConfigureCloudStorageForm>({
    defaultValues: {
      active,
      configContent,
      name,
      sensitive_fields,
      source_path,
      target_path,
    },
  });
  const { fields: sensitiveFields } = useFieldArray({
    control,
    name: "sensitive_fields",
  });

  return (
    <Modal
      className="modal-dialog-centered"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Configure Cloud Storage</ModalHeader>
      <Form
        className="form-rk-green"
        noValidate
        // onSubmit={handleSubmit(onSubmit)}
      >
        <ModalBody>
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

          {sensitiveFields.length > 0 && (
            <div>
              <h5>Credentials</h5>
              {sensitiveFields.map((item, index) => (
                <div className="mb-3" key={item.id}>
                  <Label
                    className="form-label"
                    for={`configureCloudStorage-${item.id}`}
                  >
                    {item.name}
                  </Label>
                  <Controller
                    control={control}
                    name={`sensitive_fields.${index}.value`}
                    render={({ field }) => (
                      <Input
                        className="form-control"
                        id={`configureCloudStorage-${item.id}`}
                        type="text"
                        {...field}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button className="ms-2" color="outline-secondary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Discard
          </Button>
          <Button
            className="ms-2"
            // disabled={!isDirty}
            // onClick={handleSubmit(onSubmit)}
          >
            <PencilSquare className={cx("bi", "me-1")} type="submit" />
            Save changes
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface ConfigureCloudStorageForm {
  active: boolean;
  configContent: string;
  name: string;
  source_path: string;
  sensitive_fields: { name: string; value: string }[];
  target_path: string;
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
