import cx from "classnames";
import { useMemo } from "react";
import { Key, Lock, PersonBadge } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader } from "reactstrap";

import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import { CredentialMoreInfo } from "~/features/cloudStorage/CloudStorageItem";
import { CLOUD_STORAGE_SENSITIVE_FIELD_TOKEN } from "~/features/cloudStorage/projectCloudStorage.constants";
import { getCredentialFieldDefinitions } from "~/features/cloudStorage/projectCloudStorage.utils";
import { storageSecretNameToFieldName } from "~/features/secretsV2/secrets.utils";
import { DataConnectorRead } from "../api/data-connectors.api";
import { useGetDataConnectorsByDataConnectorIdSecretsQuery } from "../api/data-connectors.enhanced-api";
import { InfoEntry } from "./DataConnectorInfoBox";

interface DataConnectorCredentialsBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: "h2" | "h3" | "h4";
}
export default function DataConnectorCredentialsBox({
  dataConnector,
  headerTag = "h2",
}: DataConnectorCredentialsBoxProps) {
  // Sensitive fields
  const sensitiveFields = dataConnector.storage.sensitive_fields
    ? dataConnector.storage.sensitive_fields.map((f) => f.name)
    : [];
  const anySensitiveField = Object.keys(
    dataConnector.storage.configuration
  ).some((key) => sensitiveFields.includes(key));

  // Fields requiring credentials and their status
  const credentialFieldDefinitions = useMemo(
    () =>
      getCredentialFieldDefinitions({
        storage: dataConnector.storage,
        sensitive_fields: dataConnector.storage.sensitive_fields,
      }),
    [dataConnector]
  );
  const requiredCredentials = useMemo(
    () =>
      credentialFieldDefinitions?.filter((field) => field.requiredCredential),
    [credentialFieldDefinitions]
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

  return (
    <Card data-cy="data-connector-credentials-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <PersonBadge className="me-1" />
          Credentials
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        <InfoEntry title="Requires credentials" dataCy="requires-credentials">
          {anySensitiveField ? "Yes" : "No"}
        </InfoEntry>
        {requiredCredentials &&
          requiredCredentials.length > 0 &&
          requiredCredentials.map(({ name, help }) => {
            if (!name) return null;
            const title = (
              <>
                Field <span className="fst-italic">{name}</span>{" "}
                {help && <CredentialMoreInfo help={help} />}
              </>
            );
            return (
              <>
                <InfoEntry title={title} dataCy={name}>
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
