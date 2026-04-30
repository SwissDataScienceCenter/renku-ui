import cx from "classnames";
import { useCallback, useMemo, useState } from "react";
import { Pencil, Plug, Sliders } from "react-bootstrap-icons";
import { Button, Card, CardBody, CardHeader } from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import PermissionsGuard from "~/features/permissionsV2/PermissionsGuard";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import { getDataConnectorScope } from "../components/dataConnector.utils";
import DataConnectorModal from "../components/DataConnectorModal";
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

  // modals
  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(false);
  const toggleGeneralSettings = useCallback(() => {
    setIsGeneralSettingsOpen((open) => !open);
  }, []);
  const [isConnectionInformationOpen, setIsConnectionInformationOpen] =
    useState(false);
  const toggleConnectionInformation = useCallback(() => {
    setIsConnectionInformationOpen((open) => !open);
  }, []);

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
                    data-cy="data-connector-general-settings-update-button"
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
    </>
  );
}
