import { useMemo } from "react";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";

import CopyIdentifierMenuItem from "~/components/clipboard/CopyIdentifierMenuItem";
import { useCopyIdentifierMenu } from "~/components/clipboard/useCopyIdentifierMenu.hook";
import { DataConnectorRead } from "~/features/dataConnectorsV2/api/data-connectors.api";
import { getDataConnectorIdentifier } from "~/features/dataConnectorsV2/components/dataConnector.utils";

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
  const { copyIdentifier, identifierCopied, isMenuOpen, toggleMenu } =
    useCopyIdentifierMenu(identifier);
  return (
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
        <CopyIdentifierMenuItem
          clipboardText={identifier}
          copied={identifierCopied}
          dataCy="data-connector-copy-identifier-menu-item"
          label="Copy data connector identifier"
          onCopy={copyIdentifier}
        />
      </DropdownMenu>
    </Dropdown>
  );
}
