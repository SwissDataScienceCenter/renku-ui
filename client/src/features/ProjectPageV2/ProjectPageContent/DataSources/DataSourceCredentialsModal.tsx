/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { useCallback, useEffect } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { XLg } from "react-bootstrap-icons";

import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import {
  useDeleteStoragesV2ByStorageIdSecretsMutation,
  usePostStoragesV2ByStorageIdSecretsMutation,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import type { CloudStorageGetRead } from "../../../projectsV2/api/storagesV2.api";
import type { SessionStartCloudStorageConfiguration } from "../../../sessionsV2/startSessionOptionsV2.types";
import SessionStartCloudStorageSecretsModal from "../../../sessionsV2/SessionStartCloudStorageSecretsModal";

import useDataSourceConfiguration from "./useDataSourceConfiguration.hook";
import { Loader } from "../../../../components/Loader";

interface DataSourceCredentialsModalProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  storage: CloudStorageGetRead;
}
export default function DataSourceCredentialsModal({
  isOpen,
  storage: cloudStorage,
  setOpen,
}: DataSourceCredentialsModalProps) {
  const { cloudStorageConfigs } = useDataSourceConfiguration({
    storages: [cloudStorage],
  });

  const [saveCredentials, saveCredentialsResult] =
    usePostStoragesV2ByStorageIdSecretsMutation();
  const [deleteCredentials, deleteCredentialsResult] =
    useDeleteStoragesV2ByStorageIdSecretsMutation();

  const onSave = useCallback(
    (configs: SessionStartCloudStorageConfiguration[]) => {
      const activeConfigs = configs.filter((c) => c.active);
      if (activeConfigs.length === 0) {
        if (!deleteCredentialsResult.isUninitialized) return;
        deleteCredentials({ storageId: cloudStorage.storage.storage_id });
        return;
      }
      if (!saveCredentialsResult.isUninitialized) return;
      const config = configs[0];
      saveCredentials({
        storageId: config.cloudStorage.storage.storage_id,
        cloudStorageSecretPostList: Object.entries(
          config.sensitiveFieldValues
        ).map(([key, value]) => ({
          name: key,
          value,
        })),
      });
    },
    [
      deleteCredentials,
      deleteCredentialsResult,
      cloudStorage,
      saveCredentials,
      saveCredentialsResult,
    ]
  );

  useEffect(() => {
    if (deleteCredentialsResult.isSuccess || saveCredentialsResult.isSuccess) {
      setOpen(false);
    }
  }, [deleteCredentialsResult, saveCredentialsResult.isSuccess, setOpen]);
  if (!isOpen) return null;

  if (
    cloudStorage.sensitive_fields == null ||
    cloudStorage.sensitive_fields.length === 0
  ) {
    return (
      <Modal
        centered
        data-cy="cloud-storage-credentials-not-needed-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          No credentials required
        </ModalHeader>
        <ModalBody>
          This data source does not require any credentials.
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn-outline-rk-green"
            onClick={() => setOpen(false)}
          >
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  if (
    (!saveCredentialsResult.isUninitialized &&
      saveCredentialsResult.error != null) ||
    (!deleteCredentialsResult.isUninitialized &&
      deleteCredentialsResult.error != null)
  ) {
    const error = saveCredentialsResult.error || deleteCredentialsResult.error;
    return (
      <Modal
        centered
        data-cy="cloud-storage-credentials-error-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          Cloud Storage Credentials Update Error
        </ModalHeader>
        <ModalBody>
          <RtkErrorAlert error={error} />
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn-outline-rk-green"
            onClick={() => setOpen(false)}
          >
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  if (saveCredentialsResult.isLoading) {
    return (
      <Modal
        centered
        data-cy="cloud-storage-credentials-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          Saving Cloud Storage Credentials
        </ModalHeader>
        <ModalBody>
          <Loader />
        </ModalBody>
      </Modal>
    );
  }

  if (deleteCredentialsResult.isLoading) {
    return (
      <Modal
        centered
        data-cy="cloud-storage-credentials-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          Clearing Cloud Storage Credentials
        </ModalHeader>
        <ModalBody>
          <Loader />
        </ModalBody>
      </Modal>
    );
  }

  return (
    <SessionStartCloudStorageSecretsModal
      cloudStorageConfigs={cloudStorageConfigs}
      context="storage"
      isOpen={isOpen}
      onCancel={() => setOpen(false)}
      onStart={onSave}
    />
  );
}
