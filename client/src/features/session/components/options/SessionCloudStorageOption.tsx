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
import { EyeFill, EyeSlashFill, InfoCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Input,
  InputGroup,
  Label,
  PopoverBody,
  Row,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "reactstrap";

import { ACCESS_LEVELS } from "../../../../api-client";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import LazyRenkuMarkdown from "../../../../components/markdown/LazyRenkuMarkdown";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../../utils/helpers/url";
import { StateModelProject } from "../../../project/Project";
import { useGetNotebooksVersionQuery } from "../../../versions/versions.api";
import { SessionCloudStorage } from "../../startSessionOptions.types";
import {
  setCloudStorage,
  updateCloudStorageItem,
} from "../../startSessionOptionsSlice";
import CloudStorageItem from "../../../project/components/cloudStorage/CloudStorageItem";
import { useGetCloudStorageForProjectQuery } from "../../../project/components/cloudStorage/projectCloudStorage.api";
import { CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "../../../project/components/cloudStorage/projectCloudStorage.constants";

export default function SessionCloudStorageOption() {
  const { data: notebooksVersion, isLoading } = useGetNotebooksVersionQuery();

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
    <div className={cx("form-text", "my-1")}>
      Cloud storage options can be adjusted from the{" "}
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
        supported: true,
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
    return (
      <p className={cx("mb-1", "form-text")}>
        No cloud storage configured for this project
        {devAccess
          ? ""
          : ". Only developers can add a new one; you can fork the project if you wish to attach a storage"}
        .
      </p>
    );
  }

  const storageList = cloudStorageList.map((storage, index) => {
    const { active, sensitive_fields, ...unsafeStorageProps } = storage;
    const { configuration, ...otherStorageProps } = unsafeStorageProps;

    const safeConfiguration = Object.fromEntries(
      Object.entries(configuration).map(([key, value]) => [
        key,
        sensitive_fields && sensitive_fields.find((f) => f.name === key)
          ? CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN
          : value,
      ])
    );

    const storageDefinition = {
      storage: { configuration: safeConfiguration, ...otherStorageProps },
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
            storage: {
              ...storage,
              configuration: {
                ...storage.configuration,
                [name]: value,
              },
              sensitive_fields: newSensitiveFields,
            },
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
      <CloudStorageItem
        devAccess={devAccess}
        disabled={!active}
        key={storage.name}
        noEdit={true}
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
            Mount the storage in this session
          </Label>
        </div>
        {requiredSensitiveFields}
      </CloudStorageItem>
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
