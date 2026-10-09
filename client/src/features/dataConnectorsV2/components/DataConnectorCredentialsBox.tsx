import cx from "classnames";
import { useMemo } from "react";
import { Key, Lock, PersonBadge } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import { CredentialMoreInfo } from "~/features/cloudStorage/CloudStorageItem";
import { CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "~/features/cloudStorage/projectCloudStorage.constants";
import { getCredentialFieldDefinitions } from "~/features/cloudStorage/projectCloudStorage.utils";
import { storageSecretNameToFieldName } from "~/features/secretsV2/secrets.utils";
import { DataConnectorRead } from "../api/data-connectors.api";
import { useGetDataConnectorsByDataConnectorIdSecretsQuery } from "../api/data-connectors.enhanced-api";
import { hasSensitiveFields } from "./dataConnector.utils";
import { InfoEntry, type InfoEntryLayout } from "./DataConnectorInfoBox";

interface DataConnectorCredentialsBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: "h2" | "h3" | "h4";
  showRequiresCredentials?: boolean;
  layout?: InfoEntryLayout;
}
export default function DataConnectorCredentialsBox({
  dataConnector,
  headerTag = "h2",
  showRequiresCredentials = true,
  layout = "one-column",
}: DataConnectorCredentialsBoxProps) {
  const anySensitiveField = hasSensitiveFields(dataConnector.storage);

  // Fields requiring credentials and their status
  const credentialFieldDefinitions = useMemo(
    () =>
      getCredentialFieldDefinitions({
        storage: dataConnector.storage,
        sensitive_fields: dataConnector.storage.sensitive_fields,
      }),
    [dataConnector.storage],
  );
  const requiredCredentials = useMemo(
    () =>
      credentialFieldDefinitions?.filter((field) => field.requiredCredential),
    [credentialFieldDefinitions],
  );
  const { data: connectorSecrets } =
    useGetDataConnectorsByDataConnectorIdSecretsQuery({
      dataConnectorId: dataConnector.id,
    });
  const savedCredentialFields =
    connectorSecrets?.reduce((acc: Record<string, string>, s) => {
      acc[storageSecretNameToFieldName(s)] = s.name;
      return acc;
    }, {}) ?? {};

  const hasCredentialFields = !!requiredCredentials?.length;

  if (!hasCredentialFields && !showRequiresCredentials) return null;

  return (
    <Card data-cy="data-connector-credentials-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <PersonBadge className="me-1" />
          Credentials
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {showRequiresCredentials && (
          <InfoEntry
            title="Requires credentials"
            dataCy="requires-credentials"
            layout={layout}
          >
            {anySensitiveField ? "Yes" : "No"}
          </InfoEntry>
        )}
        {hasCredentialFields && layout === "two-columns" && (
          <Row className={cx("d-none", "d-md-flex")}>
            <Col md={4} lg={3} className="text-muted">
              Field
            </Col>
            <Col className="text-muted">Status</Col>
          </Row>
        )}
        {hasCredentialFields &&
          requiredCredentials?.map(({ name, help }) => {
            if (!name) return null;
            const title = (
              <>
                {name} {help && <CredentialMoreInfo help={help} />}
              </>
            );
            return (
              <>
                <InfoEntry title={title} dataCy={name} layout={layout}>
                  {savedCredentialFields[name] ? (
                    <RenkuBadge color="success">
                      <Key className="me-1" />
                      Credentials saved
                    </RenkuBadge>
                  ) : dataConnector.storage.configuration[name]?.toString() ==
                    CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN ? (
                    <RenkuBadge color="warning">
                      <Lock className="me-1" />
                      Requires credentials
                    </RenkuBadge>
                  ) : (
                    dataConnector.storage.configuration[name]?.toString()
                  )}
                </InfoEntry>
              </>
            );
          })}
      </CardBody>
    </Card>
  );
}
