import { Col, Row } from "reactstrap";

import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import DataConnectorCredentialsBox, {
  getDataConnectorRequiredCredentials,
} from "../components/DataConnectorCredentialsBox";
import { DataConnectorConnectionBox } from "../components/DataConnectorInfoBox";
import {
  DataConnectorIntegrationBox,
  useDataConnectorIntegrationSchema,
} from "../components/DataConnectorIntegrationBox";
import DataConnectorProjectsBox from "../components/DataConnectorProjectsBox";

export default function DataConnectorShow() {
  return (
    <Row className="g-4">
      <DataConnectorIntegrationWrapper />
      <DataConnectorInformationWrapper />
      <DataConnectorCredentialsWrapper />
      <DataConnectorProjectsBoxWrapper />
    </Row>
  );
}

function useShowDataConnector() {
  const ctx = useNamespaceContext();
  return ctx.kind === "dataConnector" ? ctx.dataConnector : null;
}

function DataConnectorInformationWrapper() {
  const dataConnector = useShowDataConnector();
  if (!dataConnector) return null;

  return (
    <Col xs={12}>
      <DataConnectorConnectionBox
        dataConnector={dataConnector}
        headerTag="h2"
        layout="two-columns"
      />
    </Col>
  );
}

function DataConnectorCredentialsWrapper() {
  const dataConnector = useShowDataConnector();
  if (
    !dataConnector ||
    getDataConnectorRequiredCredentials(dataConnector).length === 0
  )
    return null;

  return (
    <Col xs={12}>
      <DataConnectorCredentialsBox
        dataConnector={dataConnector}
        headerTag="h2"
        showRequiresCredentials={false}
        layout="two-columns"
      />
    </Col>
  );
}

function DataConnectorProjectsBoxWrapper() {
  const dataConnector = useShowDataConnector();
  if (!dataConnector) return null;

  return (
    <Col xs={12}>
      <DataConnectorProjectsBox dataConnector={dataConnector} headerTag="h2" />
    </Col>
  );
}

function DataConnectorIntegrationWrapper() {
  const dataConnector = useShowDataConnector();
  const schema = useDataConnectorIntegrationSchema(dataConnector);
  if (!dataConnector || !schema?.usesIntegration) return null;

  return (
    <Col xs={12}>
      <DataConnectorIntegrationBox
        dataConnector={dataConnector}
        headerTag="h2"
      />
    </Col>
  );
}
