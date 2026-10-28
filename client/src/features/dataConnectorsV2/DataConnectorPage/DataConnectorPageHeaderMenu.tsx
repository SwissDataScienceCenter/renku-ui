import { useCallback, useMemo, useState } from "react";
import { Pencil, ThreeDotsVertical } from "react-bootstrap-icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import CopyIdentifierMenuItem from "~/components/clipboard/CopyIdentifierMenuItem";
import { DataConnectorRead } from "~/features/dataConnectorsV2/api/data-connectors.api";
import {
  getDataConnectorIdentifier,
  getDataConnectorScope,
} from "~/features/dataConnectorsV2/components/dataConnector.utils";
import DataConnectorModal from "~/features/dataConnectorsV2/components/DataConnectorModal";
import useDataConnectorPermissions from "~/features/dataConnectorsV2/utils/useDataConnectorPermissions.hook";

interface DataConnectorPageHeaderMenuProps {
  dataConnector: DataConnectorRead;
}

export default function DataConnectorPageHeaderMenu({
  dataConnector,
}: DataConnectorPageHeaderMenuProps) {
  const identifier = useMemo(
    () => getDataConnectorIdentifier(dataConnector),
    [dataConnector],
  );
  const scope = useMemo(
    () => getDataConnectorScope(dataConnector.namespace),
    [dataConnector.namespace],
  );
  const { permissions } = useDataConnectorPermissions({
    dataConnectorId: dataConnector.id,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);
  const {
    initialStep,
    isOpen,
    toggle,
    toggleConnectionInformation,
    toggleGeneralSettings,
  } = useDataConnectorSettingsModal();
  const canEdit = scope !== "global" && permissions.write;

  return (
    <>
      <Dropdown isOpen={isMenuOpen} toggle={toggleMenu}>
        <DropdownToggle
          aria-label="Data connector actions"
          caret={false}
          color="outline-primary"
          data-cy="data-connector-actions-menu"
          size="sm"
        >
          <ThreeDotsVertical className="bi" />
        </DropdownToggle>

        <DropdownMenu container="body" end flip={false} strategy="fixed">
          {canEdit && (
            <>
              <DropdownItem
                data-cy="data-connector-edit-general-settings-menu-item"
                onClick={toggleGeneralSettings}
              >
                <Pencil aria-hidden="true" className="bi" /> Edit general
                settings
              </DropdownItem>
              <DropdownItem
                data-cy="data-connector-edit-connection-information-menu-item"
                onClick={toggleConnectionInformation}
              >
                <Pencil aria-hidden="true" className="bi" /> Edit connection
                information
              </DropdownItem>
            </>
          )}
          <CopyIdentifierMenuItem
            clipboardText={identifier}
            dataCy="data-connector-copy-identifier-menu-item"
            isMenuOpen={isMenuOpen}
            label="Copy data connector identifier"
            confirmationText="Copied data connector identifier"
            onClose={closeMenu}
          />
        </DropdownMenu>
      </Dropdown>
      {scope !== "global" && (
        <DataConnectorModal
          dataConnector={dataConnector}
          initialStep={initialStep}
          isOpen={isOpen}
          namespace={dataConnector.namespace}
          toggle={toggle}
        />
      )}
    </>
  );
}

function useDataConnectorSettingsModal() {
  const [isGeneralSettingsOpen, setIsGeneralSettingsOpen] = useState(false);
  const toggleGeneralSettings = useCallback(() => {
    setIsGeneralSettingsOpen((open) => !open);
  }, []);
  const [isConnectionInformationOpen, setIsConnectionInformationOpen] =
    useState(false);
  const toggleConnectionInformation = useCallback(() => {
    setIsConnectionInformationOpen((open) => !open);
  }, []);

  return {
    initialStep: isGeneralSettingsOpen ? 3 : 2,
    isOpen: isGeneralSettingsOpen || isConnectionInformationOpen,
    toggle: isGeneralSettingsOpen
      ? toggleGeneralSettings
      : toggleConnectionInformation,
    toggleConnectionInformation,
    toggleGeneralSettings,
  };
}
