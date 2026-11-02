import cx from "classnames";
import { useMemo } from "react";
import { Cloud } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader } from "reactstrap";

import { IntegrationAlert } from "~/features/cloudStorage/AddOrEditCloudStorage";
import { useGetStorageSchemaQuery } from "~/features/cloudStorage/api/projectCloudStorage.api";
import { getSchema } from "~/features/cloudStorage/projectCloudStorage.utils";
import { DataConnectorRead } from "../api/data-connectors.api";

interface DataConnectorIntegrationBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: "h2" | "h3" | "h4";
}

export function useDataConnectorIntegrationSchema(
  dataConnector: DataConnectorRead | null | undefined,
) {
  const { data: schemata } = useGetStorageSchemaQuery();
  const storageType = dataConnector?.storage.storage_type;

  return useMemo(
    () => (schemata ? getSchema(schemata, storageType) : undefined),
    [schemata, storageType],
  );
}

export function DataConnectorIntegrationBox({
  dataConnector,
  headerTag = "h3",
}: DataConnectorIntegrationBoxProps) {
  const schema = useDataConnectorIntegrationSchema(dataConnector);

  if (!schema?.usesIntegration) {
    return null;
  }

  return (
    <Card data-cy="data-connector-info-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <Cloud className="me-1" />
          Integration
        </span>
      </CardHeader>
      <CardBody>
        <IntegrationAlert schema={schema} />
      </CardBody>
    </Card>
  );
}
