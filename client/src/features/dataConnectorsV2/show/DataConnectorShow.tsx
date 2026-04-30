import { Col, Row } from "reactstrap";

import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import DataConnectorCredentialsBox from "../components/DataConnectorCredentialsBox";
import DataConnectorInfoBox from "../components/DataConnectorInfoBox";
import DataConnectorProjectsBox from "../components/DataConnectorProjectsBox";

export default function DataConnectorShow() {
  return (
    <Row className="g-4">
      <Col xs={12} md={8} xl={9}>
        <Row className="g-4">
          <Col xs={12}>
            <DataConnectorInformationWrapper />
          </Col>
          <Col xs={12}>
            <DataConnectorProjectsBoxWrapper />
          </Col>
        </Row>
      </Col>
      <Col xs={12} md={4} xl={3}>
        <DataConnectorCredentialsWrapper />
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

  return <DataConnectorInfoBox dataConnector={dataConnector} headerTag="h2" />;
}

function DataConnectorCredentialsWrapper() {
  const ctx = useNamespaceContext();
  const { kind } = ctx;
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  if (!ctx || kind !== "dataConnector" || !dataConnector) return null;

  return (
    <DataConnectorCredentialsBox dataConnector={dataConnector} headerTag="h2" />
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
