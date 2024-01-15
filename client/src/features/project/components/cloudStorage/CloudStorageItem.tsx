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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckLg,
  InfoCircleFill,
  KeyFill,
  TrashFill,
  XLg,
} from "react-bootstrap-icons";
import {
  Button,
  Card,
  CardBody,
  Col,
  Collapse,
  Modal,
  ModalBody,
  ModalFooter,
  PopoverBody,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import LazyRenkuMarkdown from "../../../../components/markdown/LazyRenkuMarkdown";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { StateModelProject } from "../../Project";
import { useDeleteCloudStorageMutation } from "./projectCloudStorage.api";
import {
  CloudStorage,
  CloudStorageConfiguration,
} from "./projectCloudStorage.types";
import { getCredentialFieldDefinitions } from "../../utils/projectCloudStorage.utils";
import AddOrEditCloudStorageButton from "./AddOrEditCloudStorageButton";

interface CloudStorageItemProps {
  children?: React.ReactNode;
  devAccess: boolean;
  disabled?: boolean;
  noEdit?: boolean;
  storageDefinition: CloudStorage;
}

export default function CloudStorageItem({
  children,
  devAccess,
  disabled,
  noEdit,
  storageDefinition,
}: CloudStorageItemProps) {
  const { storage } = storageDefinition;
  const { configuration, name, target_path } = storage;
  const sensitiveFields = storageDefinition.sensitive_fields
    ? storageDefinition.sensitive_fields?.map((f) => f.name)
    : [];
  const anySensitiveField = Object.keys(storage.configuration).some((key) =>
    sensitiveFields.includes(key)
  );

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  const storageType = configuration.provider
    ? `${configuration.type}/${configuration.provider}`
    : configuration.type;

  const credentialId = `cloud-storage-${storage.storage_id}-credentials`;
  const requiresCredentials = anySensitiveField && (
    <>
      <span id={credentialId} tabIndex={0}>
        <KeyFill className={cx("bi", "me-1")} />
      </span>
      <UncontrolledTooltip target={credentialId}>
        <PopoverBody>This cloud storage requires credentials.</PopoverBody>
      </UncontrolledTooltip>
    </>
  );

  const additionalElement = children && (
    <CardBody className={cx("border-top", "py-2")}>{children}</CardBody>
  );
  return (
    <Col>
      <Card data-cy="cloud-storage-item">
        <CardBody className="p-0">
          <h3 className={cx("fs-6", "m-0")}>
            <div
              className={cx(
                "d-flex",
                "gap-3",
                "align-items-center",
                "w-100",
                "p-3"
              )}
            >
              <div
                className={cx(
                  "fw-bold",
                  disabled && [
                    "text-decoration-line-through",
                    "text-rk-text-light",
                  ]
                )}
              >
                {requiresCredentials} {name}
              </div>
              <div className={cx("small", "d-none", "d-sm-block")}>
                <span className="text-rk-text-light">Storage type: </span>
                <span>{storageType}</span>
              </div>
              <div className={cx("small", "d-none", "d-sm-block")}>
                <span className="text-rk-text-light">Mount point: </span>
                {disabled ? (
                  <span className="fst-italic">Not mounted</span>
                ) : (
                  <span>{target_path}</span>
                )}
              </div>
            </div>
          </h3>
        </CardBody>

        {additionalElement}

        <CardBody className="p-0 border-top">
          <button
            className={cx(
              "d-flex",
              "w-100",
              "px-3",
              "py-2",
              "bg-transparent",
              "border-0"
            )}
            data-cy="cloud-storage-details-toggle"
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
            <CloudStorageDetails
              devAccess={devAccess}
              noEdit={noEdit}
              requiresCredentials={anySensitiveField}
              storageDefinition={storageDefinition}
            />
          </CardBody>
        </Collapse>
      </Card>
    </Col>
  );
}

interface CloudStorageDetailsProps {
  devAccess: boolean;
  noEdit?: boolean;
  requiresCredentials: boolean;
  storageDefinition: CloudStorage;
}

function CloudStorageDetails({
  devAccess,
  noEdit,
  requiresCredentials,
  storageDefinition,
}: CloudStorageDetailsProps) {
  const { storage } = storageDefinition;
  const { configuration, name, readonly, source_path, target_path } = storage;

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
      <section data-cy="cloud-storage-details-section">
        <div>
          <div className="text-rk-text-light">
            <small>Name</small>
          </div>
          <div>{name}</div>
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
        {Object.keys(configuration).map((key) => (
          <div className="mt-2" key={key}>
            <div className="text-rk-text-light">
              <small className="text-capitalize">{key}</small>
            </div>
            <div>{configuration[key]?.toString()}</div>
          </div>
        ))}
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Source path</small>
          </div>
          <div>{source_path}</div>
        </div>
        <div className="mt-2">
          <div className="text-rk-text-light">
            <small>Requires credentials</small>
          </div>
          <div>{requiresCredentials ? "Yes" : "No"}</div>
        </div>
        {requiresCredentials &&
          requiredCredentials &&
          requiredCredentials.length > 0 && (
            <div className="mt-2">
              <div className="text-rk-text-light">
                <small>Required crendentials</small>
              </div>
              <ul className={cx("ps-4", "mb-0")}>
                {requiredCredentials.map(({ name, help }, index) => (
                  <li key={index}>
                    {name}
                    <CredentialMoreInfo help={help} />
                  </li>
                ))}
              </ul>
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
      </section>

      {!noEdit && (
        <section
          data-cy="cloud-storage-details-buttons"
          className={cx("d-flex", "justify-content-end", "mt-3")}
        >
          <AddOrEditCloudStorageButton
            devAccess={devAccess}
            currentStorage={storageDefinition}
          />
          <DeleteCloudStorageButton
            devAccess={devAccess}
            storageDefinition={storageDefinition}
          />
        </section>
      )}
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
  devAccess,
  storageDefinition,
}: CloudStorageItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return devAccess ? (
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
  ) : (
    <div
      className="d-inline-block"
      id={`delete-storage-${storageDefinition.storage.storage_id}`}
      tabIndex={0}
      data-bs-toggle="tooltip"
    >
      <Button className="ms-2" color="outline-danger" disabled={true}>
        <TrashFill className={cx("bi", "me-1")} />
        Delete
      </Button>
      <UncontrolledTooltip
        target={`delete-storage-${storageDefinition.storage.storage_id}`}
      >
        Only developers and maintainers can delete cloud storage.
      </UncontrolledTooltip>
    </div>
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

  const projectId = useLegacySelector<StateModelProject["metadata"]["id"]>(
    (state) => state.stateModel.project.metadata.id
  );

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
        <Button className="ms-2" color="secondary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Cancel, keep configuration
        </Button>
        <Button className="ms-2" color="outline-danger" onClick={onDelete}>
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
