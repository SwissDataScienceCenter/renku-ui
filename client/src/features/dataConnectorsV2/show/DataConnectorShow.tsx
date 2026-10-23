import { Col, Row } from "reactstrap";

import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import DataConnectorCredentialsBox from "../components/DataConnectorCredentialsBox";
import { DataConnectorConnectionBox } from "../components/DataConnectorInfoBox";
import { DataConnectorIntegrationBox } from "../components/DataConnectorIntegrationBox";
import DataConnectorProjectsBox from "../components/DataConnectorProjectsBox";

export default function DataConnectorShow() {
  return (
    <Row className="g-4">
      <Col xs={12}>
        <DataConnectorIntegrationWrapper />
      </Col>
      <Col xs={12}>
        <DataConnectorInformationWrapper />
      </Col>
      <Col xs={12}>
        <DataConnectorCredentialsWrapper />
      </Col>
      <Col xs={12}>
        <DataConnectorProjectsBoxWrapper />
      </Col>
    </Row>
  );
}

function DataConnectorInformationWrapper() {
  const ctx = useNamespaceContext();
  const { kind } = ctx;
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  // ? Not that any of this should ever happen... Hence the return null.
  if (!ctx || kind !== "dataConnector" || !dataConnector) return null;

  return (
    <DataConnectorConnectionBox
      dataConnector={dataConnector}
      headerTag="h2"
      layout="two-columns"
    />
  );
}

function DataConnectorCredentialsWrapper() {
  const ctx = useNamespaceContext();
  const { kind } = ctx;
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  if (!ctx || kind !== "dataConnector" || !dataConnector) return null;

  return (
    <DataConnectorCredentialsBox
      dataConnector={dataConnector}
      headerTag="h2"
      showRequiresCredentials={false}
      layout="two-columns"
    />
  );
}

function DataConnectorProjectsBoxWrapper() {
  const ctx = useNamespaceContext();
  const { kind } = ctx;
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  if (!ctx || kind !== "dataConnector" || !dataConnector) return null;

  return (
    <DataConnectorProjectsBox dataConnector={dataConnector} headerTag="h2" />
  );
}

function DataConnectorIntegrationWrapper() {
  const ctx = useNamespaceContext();
  const { kind } = ctx;
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  if (!ctx || kind !== "dataConnector" || !dataConnector) return null;

  return (
    <DataConnectorIntegrationBox dataConnector={dataConnector} headerTag="h2" />
  );
}
