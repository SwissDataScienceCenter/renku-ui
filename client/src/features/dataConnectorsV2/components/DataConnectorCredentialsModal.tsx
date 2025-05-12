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
import { XLg } from "react-bootstrap-icons";
import { Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import DataConnectorSecretsModal from "../../sessionsV2/DataConnectorSecretsModal";
import type { DataConnectorRead } from "../api/data-connectors.api";
import {
  useDeleteDataConnectorsByDataConnectorIdSecretsMutation,
  usePatchDataConnectorsByDataConnectorIdSecretsMutation,
} from "../api/data-connectors.enhanced-api";
import useDataConnectorConfiguration, {
  type DataConnectorConfiguration,
} from "./useDataConnectorConfiguration.hook";

interface DataConnectorCredentialsModalProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  dataConnector: DataConnectorRead;
}
export default function DataConnectorCredentialsModal({
  isOpen,
  dataConnector,
  setOpen,
}: DataConnectorCredentialsModalProps) {
  const { dataConnectorConfigs } = useDataConnectorConfiguration({
    dataConnectors: [dataConnector],
  });

  const [saveCredentials, saveCredentialsResult] =
    usePatchDataConnectorsByDataConnectorIdSecretsMutation();
  const [deleteCredentials, deleteCredentialsResult] =
    useDeleteDataConnectorsByDataConnectorIdSecretsMutation();

  const onSave = useCallback(
    (configs: DataConnectorConfiguration[]) => {
      const activeConfigs = configs.filter((c) => c.active);
      if (activeConfigs.length === 0) {
        if (!deleteCredentialsResult.isUninitialized) return;
        deleteCredentials({ dataConnectorId: dataConnector.id });
        return;
      }
      if (!saveCredentialsResult.isUninitialized) return;
      const config = configs[0];
      saveCredentials({
        dataConnectorId: dataConnector.id,
        dataConnectorSecretPatchList: Object.entries(
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
      dataConnector,
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
    dataConnector.storage.sensitive_fields == null ||
    dataConnector.storage.sensitive_fields.length === 0
  ) {
    return (
      <ScrollableModal
        centered
        data-cy="data-connector-credentials-not-needed-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          No credentials required
        </ModalHeader>
        <ModalBody>
          This data connector does not require any credentials.
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setOpen(false)}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
        </ModalFooter>
      </ScrollableModal>
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
      <ScrollableModal
        centered
        data-cy="data-connector-credentials-error-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          Data Connector Credentials Update Error
        </ModalHeader>
        <ModalBody>
          <RtkErrorAlert error={error} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setOpen(false)}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
        </ModalFooter>
      </ScrollableModal>
    );
  }

  if (saveCredentialsResult.isLoading) {
    return (
      <ScrollableModal
        centered
        data-cy="data-connector-credentials-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          Saving Data Connector Credentials
        </ModalHeader>
        <ModalBody>
          <Loader />
        </ModalBody>
      </ScrollableModal>
    );
  }

  if (deleteCredentialsResult.isLoading) {
    return (
      <ScrollableModal
        centered
        data-cy="data-connector-credentials-modal"
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader className={cx("fw-bold")}>
          Clearing Data Connector Credentials
        </ModalHeader>
        <ModalBody>
          <Loader />
        </ModalBody>
      </ScrollableModal>
    );
  }

  return (
    <DataConnectorSecretsModal
      dataConnectorConfigs={dataConnectorConfigs}
      context="storage"
      isOpen={isOpen}
      onCancel={() => setOpen(false)}
      onStart={onSave}
    />
  );
}
