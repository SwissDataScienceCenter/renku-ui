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
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, PencilSquare } from "react-bootstrap-icons";
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
  Row,
} from "reactstrap";
import { ACCESS_LEVELS } from "../../../../api-client";
import { ErrorAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { Url } from "../../../../utils/helpers/url";
import { useGetCloudStorageForProjectQuery } from "../../../dataServices/dataServicesApi";
import { StateModelProject } from "../../../project/Project";
import { parseConfigContent } from "../../../project/components/AddCloudStorageButton";
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
    </>
  );
}

function CloudStorageItemAlt({ index, storage }: CloudStorageItemProps) {
  const { active, configuration, name, sensitive_fields, target_path } =
    storage;

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

        {requiredSensitiveFields != null &&
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
                  </Label>
                  <Input
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
              "pt-2",
              "bg-transparent",
              "border-0"
            )}
            onClick={toggle}
            type="button"
          >
            <div>Storage details</div>
            <div className="ms-auto">
              <ChevronDown />
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
        .filter(([, value]) => value === "<sensitive>")
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
  const configContent = `[${name}]\n${Object.entries(configWithCredentials)
    .map(([key, value]) => `${key} = ${value}`)
    .join("\n")}\n`;

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
    const value = tempConfigContent;
    const parsedConfig = parseConfigContent(value);

    const sensitiveFieldKeys =
      storage.sensitive_fields?.map(({ name }) => name) ?? [];
    const filteredConfig = Object.entries(parsedConfig)
      .filter(([key]) => !sensitiveFieldKeys.includes(key))
      .reduce(
        (prev, [key, value]) => ({ ...prev, [key]: value }),
        {} as Record<string, string>
      );
    const newSensitiveFields = Object.entries(parsedConfig)
      .filter(([key]) => sensitiveFieldKeys.includes(key))
      .map(([name, value]) => ({ name, value }));
    const oldSensitiveFields = (storage.sensitive_fields ?? []).filter(
      ({ name }) => !newSensitiveFields.map(({ name }) => name).includes(name)
    );
    const sensitiveConfig = newSensitiveFields.reduce(
      (prev, { name }) => ({ ...prev, [name]: "<sensitive>" }),
      {} as Record<string, string>
    );

    dispatch(
      updateCloudStorageV2Item({
        index,
        storage: {
          ...storage,
          configuration: { ...filteredConfig, ...sensitiveConfig },
          sensitive_fields: [...oldSensitiveFields, ...newSensitiveFields],
        },
      })
    );
  }, [dispatch, index, storage, tempConfigContent]);

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

      <div className="mb-3">
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
          // placeholder={configPlaceHolder}
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

interface CloudStorageItemProps {
  index: number;
  storage: SessionCloudStorageV2;
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