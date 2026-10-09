import { useMemo } from "react";
import { CheckLg, Clipboard, ThreeDotsVertical } from "react-bootstrap-icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

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
        <DropdownItem
          data-cy="data-connector-copy-identifier-menu-item"
          onClick={copyIdentifier}
          toggle={false}
        >
          {identifierCopied ? (
            <>
              <CheckLg className="bi" /> Identifier copied
            </>
          ) : (
            <>
              <Clipboard className="bi" /> Copy data connector identifier
            </>
          )}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
