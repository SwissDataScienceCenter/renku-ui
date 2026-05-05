import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useMemo, useState } from "react";
import {
  CloudArrowUp,
  DatabaseLock,
  FileEarmarkText,
  Lock,
  Pencil,
  Plug,
  Sliders,
  Trash,
} from "react-bootstrap-icons";
import { generatePath, useNavigate } from "react-router";
import { Button, Card, CardBody, CardHeader } from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import PermissionsGuard from "~/features/permissionsV2/PermissionsGuard";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { useGetDataConnectorsByDataConnectorIdDepositsQuery } from "../api/data-connectors.enhanced-api";
import { getDataConnectorScope } from "../components/dataConnector.utils";
import { DataConnectorRemoveDeleteModal } from "../components/DataConnectorActions";
import DataConnectorCredentialsModal from "../components/DataConnectorCredentialsModal";
import DataConnectorModal from "../components/DataConnectorModal";
import { DataConnectorLastDepositBody } from "../components/DataConnectorView";
import {
  DepositLogsModal,
  DepositRemovalModal,
} from "../deposits/DepositActions";
import DepositCreationModal from "../deposits/DepositCreationModal";
import DepositEditModal from "../deposits/DepositEditModal";
import DepositFinalizationModal from "../deposits/DepositFinalizationModal";
import {
  LAST_DEPOSIT_QUERY_PARAMS,
  POLL_TIME_INACTIVE_DEPOSITS,
} from "../deposits/deposits.constants";
import useDataConnectorPermissions from "../utils/useDataConnectorPermissions.hook";

export default function DataConnectorSettings() {
  const ctx = useNamespaceContext();
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  const scope = useMemo(
    () => getDataConnectorScope(dataConnector?.namespace),
    [dataConnector?.namespace]
  );

  const { permissions } = useDataConnectorPermissions({
    dataConnectorId: dataConnector?.id,
  });

  // General and connection settings modals
  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(false);
  const toggleGeneralSettings = useCallback(() => {
    setIsGeneralSettingsOpen((open) => !open);
  }, []);
  const [isConnectionInformationOpen, setIsConnectionInformationOpen] =
    useState(false);
  const toggleConnectionInformation = useCallback(() => {
    setIsConnectionInformationOpen((open) => !open);
  }, []);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);
  const navigate = useNavigate();
  const onDelete = useCallback(() => {
    const homeUrl = generatePath(ABSOLUTE_ROUTES.v2.index);
    navigate(homeUrl);
  }, [navigate]);

  // Credentials modal
  const [isCredentialsOpen, setCredentialsOpen] = useState(false);
  const toggleCredentials = useCallback(() => {
    setCredentialsOpen((open) => !open);
  }, []);
  const sensitiveFields = dataConnector?.storage.sensitive_fields
    ? dataConnector.storage.sensitive_fields.map((f) => f.name)
    : [];
  const anySensitiveField = Object.keys(
    dataConnector?.storage.configuration ?? {}
  ).some((key) => sensitiveFields.includes(key));

  // Deposits
  const [isNewDepositOpen, setNewDepositOpen] = useState(false);
  const [isEditDepositOpen, setEditDepositOpen] = useState(false);
  const [isFinalizationDepositOpen, setFinalizationDepositOpen] =
    useState(false);
  const [isShowDepositLogsOpen, setShowDepositLogsOpen] = useState(false);
  const [isDeleteDepositOpen, setDeleteDepositOpen] = useState(false);

  const toggleNewDeposit = useCallback(() => {
    setNewDepositOpen((open) => !open);
  }, []);
  const toggleEditDeposit = useCallback(() => {
    setEditDepositOpen((open) => !open);
  }, []);
  const toggleFinalizationDepositOpen = useCallback(() => {
    setFinalizationDepositOpen((open) => !open);
  }, []);
  const toggleShowDepositLogsOpen = useCallback(() => {
    setShowDepositLogsOpen((open) => !open);
  }, []);
  const toggleDeleteDepositOpen = useCallback(() => {
    setDeleteDepositOpen((open) => !open);
  }, []);

  const deposits = useGetDataConnectorsByDataConnectorIdDepositsQuery(
    dataConnector?.id
      ? {
          dataConnectorId: dataConnector.id,
          params: LAST_DEPOSIT_QUERY_PARAMS,
        }
      : skipToken,
    { pollingInterval: POLL_TIME_INACTIVE_DEPOSITS }
  );
  const lastDeposit = useMemo(() => {
    if (!deposits.data || deposits.data.deposits.length === 0) return undefined;
    return deposits.data.deposits[0];
  }, [deposits.data]);

  if (scope === "global") {
    return (
      <Card data-cy="data-connector-general-settings">
        <CardHeader>
          <h2 className="mb-0">
            <Sliders className={cx("me-1", "bi")} />
            Settings
          </h2>
        </CardHeader>
        <CardBody>
          <InfoAlert timeout={0}>
            This data connector is imported from an external source and is
            shared across the entire Renku instance.
          </InfoAlert>
          <p className="mb-0">
            Global data connectors cannot be manually changed.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <div className={cx("d-flex", "flex-column", "gap-4")}>
        <Card data-cy="data-connector-general-settings">
          <CardHeader>
            <h2 className="mb-0">
              <Sliders className="me-1" />
              General settings
            </h2>
          </CardHeader>
          <CardBody>
            <p>
              Change generic properties like name, owner, visibility, access
              mode, keywords, and mount point.
            </p>

            <div className={cx("d-flex", "gap-2")}>
              <PermissionsGuard
                disabled={null}
                enabled={
                  <Button
                    className="ms-auto"
                    color="primary"
                    data-cy="data-connector-general-settings-update-button"
                    onClick={toggleGeneralSettings}
                  >
                    <Pencil className="me-1" />
                    Edit
                  </Button>
                }
                requestedPermission="write"
                userPermissions={permissions}
              />
            </div>
          </CardBody>
        </Card>

        <Card data-cy="data-connector-connection-settings">
          <CardHeader>
            <h2 className="mb-0">
              <Plug className="me-1" />
              Connection information
            </h2>
          </CardHeader>
          <CardBody>
            <p>
              Change fields specific to the type of data connector. Mind that
              you cannot change the type of data connector.
            </p>

            <div className={cx("d-flex", "gap-2")}>
              <PermissionsGuard
                disabled={null}
                enabled={
                  <Button
                    className="ms-auto"
                    color="primary"
                    data-cy="data-connector-connection-settings-update-button"
                    onClick={toggleConnectionInformation}
                  >
                    <Pencil className="me-1" />
                    Edit
                  </Button>
                }
                requestedPermission="write"
                userPermissions={permissions}
              />
            </div>
          </CardBody>
        </Card>

        {anySensitiveField && (
          <Card data-cy="data-connector-credentials-settings">
            <CardHeader>
              <h2 className="mb-0">
                <Lock className="me-1" />
                Credentials
              </h2>
            </CardHeader>
            <CardBody>
              <p>Manage the credentials for this data connector.</p>

              <div className={cx("d-flex", "gap-2")}>
                <PermissionsGuard
                  disabled={null}
                  enabled={
                    <Button
                      className="ms-auto"
                      color="primary"
                      data-cy="data-connector-credentials-settings-button"
                      onClick={toggleCredentials}
                    >
                      <Lock className="me-1" />
                      Manage credentials
                    </Button>
                  }
                  requestedPermission="write"
                  userPermissions={permissions}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {permissions?.write && (
          <Card data-cy="data-connector-deposits-settings">
            <CardHeader>
              <h2 className="mb-0">
                <CloudArrowUp className="me-1" />
                Data export
              </h2>
            </CardHeader>
            <CardBody>
              {lastDeposit ? (
                <>
                  <DataConnectorLastDepositBody deposit={lastDeposit} />
                </>
              ) : (
                <>
                  <p>
                    You can export data from this data connector to a supported
                    external platform.
                  </p>
                </>
              )}
              <div className="d-flex">
                <div className={cx("ms-auto", "d-flex", "gap-2")}>
                  {!lastDeposit && (
                    <Button
                      color="primary"
                      data-cy="data-connector-deposits-export-button"
                      onClick={toggleNewDeposit}
                    >
                      <CloudArrowUp className={cx("bi", "me-1")} />
                      Export data
                    </Button>
                  )}

                  {lastDeposit && (
                    <Button
                      color="outline-danger"
                      data-cy="data-connector-deposits-delete-button"
                      onClick={toggleDeleteDepositOpen}
                    >
                      <Trash className={cx("bi", "me-1")} />
                      Delete
                    </Button>
                  )}
                  {lastDeposit && lastDeposit.status !== "complete" && (
                    <Button
                      color={
                        lastDeposit.status === "upload_complete"
                          ? "outline-primary"
                          : "primary"
                      }
                      data-cy="data-connector-deposits-edit-button"
                      onClick={toggleEditDeposit}
                    >
                      <Pencil className={cx("me-1", "bi")} />
                      Edit or rerun
                    </Button>
                  )}
                  {lastDeposit && lastDeposit.status === "upload_complete" && (
                    <>
                      <Button
                        color="outline-primary"
                        data-cy="data-connector-deposits-show-logs-button"
                        onClick={toggleShowDepositLogsOpen}
                      >
                        <FileEarmarkText className={cx("bi", "me-1")} />
                        Show logs
                      </Button>
                      <Button
                        color="primary"
                        data-cy="data-connector-deposits-finalize-button"
                        onClick={toggleFinalizationDepositOpen}
                      >
                        <DatabaseLock className={cx("me-1", "bi")} />
                        Finalize
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <Card data-cy="data-connector-delete-settings">
          <CardHeader>
            <h2 className="mb-0">
              <Trash className="me-1" />
              Delete permanently
            </h2>
          </CardHeader>
          <CardBody>
            <p>
              Delete this data connector permanently. This action cannot be
              undone!
            </p>

            <div className={cx("d-flex", "gap-2")}>
              <PermissionsGuard
                disabled={null}
                enabled={
                  <Button
                    className="ms-auto"
                    color="danger"
                    data-cy="data-connector-delete-settings-button"
                    onClick={toggleDelete}
                  >
                    <Trash className="me-1" />
                    Delete
                  </Button>
                }
                requestedPermission="write"
                userPermissions={permissions}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <DataConnectorModal
        dataConnector={dataConnector}
        isOpen={isGeneralSettingsOpen || isConnectionInformationOpen}
        namespace={dataConnector?.namespace}
        toggle={
          isGeneralSettingsOpen
            ? toggleGeneralSettings
            : toggleConnectionInformation
        }
        initialStep={isGeneralSettingsOpen ? 3 : 2}
      />

      <DataConnectorRemoveDeleteModal
        dataConnector={dataConnector}
        isOpen={isDeleteOpen}
        onDelete={onDelete}
        toggleModal={toggleDelete}
      />

      <DataConnectorCredentialsModal
        dataConnector={dataConnector}
        setOpen={setCredentialsOpen}
        isOpen={isCredentialsOpen}
      />

      <DepositCreationModal
        dataConnector={dataConnector}
        isOpen={isNewDepositOpen}
        setOpen={setNewDepositOpen}
        toggleModal={toggleNewDeposit}
      />

      {lastDeposit && (
        <>
          <DepositEditModal
            deposit={lastDeposit}
            isOpen={isEditDepositOpen}
            setOpen={toggleEditDeposit}
          />

          <DepositRemovalModal
            deposit={lastDeposit}
            isOpen={isDeleteDepositOpen}
            onDelete={() => setDeleteDepositOpen(false)}
            toggleModal={toggleDeleteDepositOpen}
          />

          <DepositLogsModal
            deposit={lastDeposit}
            isOpen={isShowDepositLogsOpen}
            toggleModal={toggleShowDepositLogsOpen}
          />

          <DepositFinalizationModal
            deposit={lastDeposit}
            isOpen={isFinalizationDepositOpen}
            setOpen={() => setFinalizationDepositOpen(true)}
            toggleModal={toggleFinalizationDepositOpen}
          />
        </>
      )}
    </>
  );
}
