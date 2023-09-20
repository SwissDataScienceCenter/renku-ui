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
  // ChevronDown,
  ExclamationTriangleFill,
  InfoCircleFill,
  PencilSquare,
} from "react-bootstrap-icons";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Collapse,
  Container,
  FormText,
  Input,
  Label,
  PopoverBody,
  Row,
  UncontrolledPopover,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../../../api-client";
import { ErrorAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { Url } from "../../../../utils/helpers/url";
import { StateModelProject } from "../../../project/Project";
import CredentialsHelpText from "../../../project/components/CredentialsHelpText";
import { useGetCloudStorageForProjectQuery } from "../../../project/projectCloudStorage.api";
import { CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "../../../project/projectCloudStorage.constants";
import {
  formatCloudStorageConfiguration,
  parseCloudStorageConfiguration,
} from "../../../project/utils/projectCloudStorage.utils";
import { useGetNotebooksVersionsQuery } from "../../../versions/versionsApi";
import { SessionCloudStorageV2 } from "../../startSessionOptions.types";
import {
  setCloudStorageV2,
  updateCloudStorageV2Item,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";

export default function SessionCloudStorageOptionV2() {
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
    const initialCloudStorage: SessionCloudStorageV2[] = storageForProject.map(
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
    dispatch(setCloudStorageV2(initialCloudStorage));
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
    </>
  );
}

interface CloudStorageItemProps {
  index: number;
  storage: SessionCloudStorageV2;
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
    () =>
      Object.entries(configuration)
        .filter(([, value]) => value === CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN)
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
        updateCloudStorageV2Item({
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
          </h3>
          <div className={cx("small", "d-none", "d-sm-block", "ms-3")}>
            <span className="text-rk-text-light">Mount point: </span>
            {active ? (
              <span>{target_path}</span>
            ) : (
              <span className="fst-italic">Not mounted</span>
            )}
          </div>
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
                <div className="mb-3" key={fieldIndex}>
                  <Label
                    className="form-label"
                    for={`credentials-${index}-${item.name}`}
                  >
                    {item.name}
                    <span className={cx("fw-bold", "text-danger")}>*</span>
                    <CredentialMoreInfo help={item.help} />
                  </Label>
                  <Input
                    className={cx(!item.value && active && "is-invalid")}
                    disabled={!active}
                    id={`credentials-${index}-${item.name}`}
                    type="text"
                    value={item.value}
                    onChange={onChangeCredential(fieldIndex)}
                  />
                </div>
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

function CredentialMoreInfo({ help }: { help: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={ref}>
        <InfoCircleFill className={cx("bi", "ms-1")} tabIndex={0} />
      </span>
      <UncontrolledPopover target={ref} placement="right" trigger="hover focus">
        <PopoverBody>
          <CredentialsHelpText help={help} />
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

function CloudStorageDetails({ index, storage }: CloudStorageItemProps) {
  const { namespace, path } = useSelector<
    RootStateOrAny,
    StateModelProject["metadata"]
  >((state) => state.stateModel.project.metadata);

  const settingsStorageUrl = Url.get(Url.pages.project.settings.storage, {
    namespace,
    path,
  });

  const { configuration, name, source_path, target_path } = storage;

  const providedSensitiveFields = useMemo(
    () =>
      Object.entries(configuration)
        .filter(([, value]) => value === CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN)
        .map(([key]) => key),
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

  const dispatch = useDispatch();

  const onChangeSourcePath = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      dispatch(
        updateCloudStorageV2Item({
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
        updateCloudStorageV2Item({
          index,
          storage: { ...storage, target_path: value },
        })
      );
    },
    [dispatch, index, storage]
  );

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
      .filter(([key]) => !Object.keys(updateCloudStorageV2Item).includes(key))
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
      updateCloudStorageV2Item({
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

function S3ExplanationLink() {
  return (
    <ExternalLink
      role="text"
      title="S3-compatible storage"
      url="https://en.wikipedia.org/wiki/Amazon_S3#S3_API_and_competing_services"
    />
  );
}
