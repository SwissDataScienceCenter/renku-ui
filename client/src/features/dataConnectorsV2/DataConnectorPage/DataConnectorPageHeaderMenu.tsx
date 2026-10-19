import { useCallback, useMemo, useState } from "react";
import { Pencil, ThreeDotsVertical } from "react-bootstrap-icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import CopyIdentifierMenuItem from "~/components/clipboard/CopyIdentifierMenuItem";
import { useCopyIdentifierMenu } from "~/components/clipboard/useCopyIdentifierMenu.hook";
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
  const { copyIdentifier, identifierCopied, isMenuOpen, toggleMenu } =
    useCopyIdentifierMenu(identifier);
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
            copied={identifierCopied}
            dataCy="data-connector-copy-identifier-menu-item"
            label="Copy data connector identifier"
            onCopy={copyIdentifier}
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
