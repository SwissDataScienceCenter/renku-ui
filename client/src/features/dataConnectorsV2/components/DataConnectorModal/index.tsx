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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect } from "react";
import { Database } from "react-bootstrap-icons";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";

import { useGetCloudStorageSchemaQuery } from "../../../project/components/cloudStorage/projectCloudStorage.api";
import {
  CLOUD_STORAGE_TOTAL_STEPS,
  EMPTY_CLOUD_STORAGE_STATE,
} from "../../../project/components/cloudStorage/projectCloudStorage.constants";
import { AddCloudStorageState } from "../../../project/components/cloudStorage/projectCloudStorage.types";

import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type { Project } from "../../../projectsV2/api/projectV2.api";

import { useGetDataConnectorsByDataConnectorIdSecretsQuery } from "../../api/data-connectors.enhanced-api";
import type { DataConnectorRead } from "../../api/data-connectors.api";
import dataConnectorFormSlice from "../../state/dataConnectors.slice";
import useDataConnectorPermissions from "../../utils/useDataConnectorPermissions.hook";

import { dataConnectorToFlattened } from "../dataConnector.utils";

import styles from "./DataConnectorModal.module.scss";
import DataConnectorModalBody from "./DataConnectorModalBody";
import DataConnectorModalFooter from "./DataConnectorModalFooter";

export function DataConnectorModalBodyAndFooter({
  dataConnector = null,
  isOpen,
  namespace,
  project,
  toggle,
}: DataConnectorModalProps) {
  const dataConnectorId = dataConnector?.id ?? null;
  // Fetch available schema when users open the modal
  const schemaQueryResult = useGetCloudStorageSchemaQuery(
    isOpen ? undefined : skipToken
  );
  const dispatch = useAppDispatch();
  const { data: schemata } = schemaQueryResult;
  const { data: connectorSecrets } =
    useGetDataConnectorsByDataConnectorIdSecretsQuery(
      dataConnectorId ? { dataConnectorId } : skipToken
    );

  // Reset state on props change
  useEffect(() => {
    let flattened = dataConnectorToFlattened(dataConnector);
    if (dataConnector == null) {
      flattened = {
        ...flattened,
        namespace: project ? `${project.namespace}/${project.slug}` : namespace,
        visibility: project?.visibility ?? "private",
      };
    }
    const cloudStorageState: AddCloudStorageState =
      dataConnector != null
        ? {
            ...EMPTY_CLOUD_STORAGE_STATE,
            step: 2,
            completedSteps: CLOUD_STORAGE_TOTAL_STEPS,
          }
        : EMPTY_CLOUD_STORAGE_STATE;
    dispatch(
      dataConnectorFormSlice.actions.initializeCloudStorageState({
        cloudStorageState,
        flatDataConnector: flattened,
        schemata: schemata ?? [],
      })
    );
  }, [dataConnector, dispatch, namespace, project, schemata]);

  // Visual elements
  return (
    <>
      <ModalBody data-cy="data-connector-edit-body">
        {schemaQueryResult.isFetching ? (
          <Loader />
        ) : schemaQueryResult.error ? (
          <RtkOrNotebooksError error={schemaQueryResult.error} />
        ) : (
          <DataConnectorModalBody
            storageSecrets={connectorSecrets ?? []}
            project={project}
          />
        )}
      </ModalBody>

      <ModalFooter className="border-top" data-cy="data-connector-edit-footer">
        <DataConnectorModalFooter
          dataConnector={dataConnector}
          isOpen={isOpen}
          project={project}
          toggle={toggle}
        />
      </ModalFooter>
    </>
  );
}

function DataConnectorModalBodyAndFooterUnauthorized() {
  return (
    <>
      <ModalBody data-cy="data-connector-edit-body">
        <div>
          You do not have the required permissions to modify this data
          connector.
        </div>
      </ModalBody>

      <ModalFooter
        className="border-top"
        data-cy="data-connector-edit-footer"
      ></ModalFooter>
    </>
  );
}

interface DataConnectorModalProps {
  dataConnector?: DataConnectorRead | null;
  isOpen: boolean;
  namespace: string;
  project?: Project;
  toggle: () => void;
}
export default function DataConnectorModal({
  dataConnector = null,
  isOpen,
  namespace,
  project,
  toggle: originalToggle,
}: DataConnectorModalProps) {
  const dataConnectorId = dataConnector?.id ?? null;
  const { permissions, isLoading: isLoadingPermissions } =
    useDataConnectorPermissions({ dataConnectorId: dataConnectorId ?? "" });
  const dispatch = useAppDispatch();

  const toggle = useCallback(() => {
    dispatch(dataConnectorFormSlice.actions.resetTransientState());
    originalToggle();
  }, [dispatch, originalToggle]);

  return (
    <Modal
      backdrop="static"
      centered
      className={styles.modal}
      data-cy="data-connector-edit-modal"
      fullscreen="lg"
      id={dataConnector?.id ?? "new-data-connector"}
      isOpen={isOpen}
      scrollable
      size="lg"
      unmountOnClose={false}
      toggle={toggle}
    >
      <ModalHeader toggle={toggle} data-cy="data-connector-edit-header">
        <DataConnectorModalHeader dataConnectorId={dataConnectorId} />
      </ModalHeader>
      {!isLoadingPermissions && dataConnectorId != null ? (
        <PermissionsGuard
          disabled={<DataConnectorModalBodyAndFooterUnauthorized />}
          enabled={
            <DataConnectorModalBodyAndFooter
              {...{
                dataConnector,
                isOpen,
                namespace,
                project,
                toggle,
              }}
            />
          }
          requestedPermission={"write"}
          userPermissions={permissions}
        />
      ) : dataConnectorId == null ? (
        <DataConnectorModalBodyAndFooter
          {...{
            dataConnector,
            isOpen,
            namespace,
            project,
            toggle,
          }}
        />
      ) : (
        <DataConnectorModalBodyAndFooterUnauthorized />
      )}
    </Modal>
  );
}

interface DataConnectorModalHeaderProps {
  dataConnectorId: string | null;
}
export function DataConnectorModalHeader({
  dataConnectorId,
}: DataConnectorModalHeaderProps) {
  return (
    <>
      <Database className={cx("bi", "me-1")} />{" "}
      {dataConnectorId ? "Edit" : "Add"} data connector
    </>
  );
}
