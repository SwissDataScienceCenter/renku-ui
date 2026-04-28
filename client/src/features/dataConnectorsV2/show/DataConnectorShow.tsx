import cx from "classnames";
import { useMemo } from "react";
import {
  Globe2,
  InfoCircle,
  Journals,
  Lock,
  PersonBadge,
} from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import { Clipboard } from "~/components/clipboard/Clipboard";
import ExternalLink from "~/components/ExternalLink";
import KeywordBadge from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
import { useNamespaceContext } from "~/features/searchV2/hooks/useNamespaceContext.hook";
import {
  getDataConnectorScope,
  parseDoi,
  useGetDataConnectorSource,
} from "../components/dataConnector.utils";

export default function DataConnectorShow() {
  // APIs to use:
  // 3-segments: /namespaces/{namespace}/projects/{project}/data_connectors/{slug}
  // 2-segments: /namespaces/{namespace}/data_connectors/{slug}
  // 1-segment:  /data_connectors/global/{slug}

  return (
    <Row className="g-4">
      <Col xs={12} md={8} xl={9}>
        <Row className="g-4">
          <Col xs={12}>
            <DataConnectorInformation />
          </Col>
        </Row>
      </Col>
      <Col xs={12} md={4} xl={3}>
        <DataConnectorCredentials />
      </Col>
    </Row>
  );
}

function DataConnectorInformation() {
  const ctx = useNamespaceContext();
  const { kind } = ctx;
  const dataConnector = ctx.kind === "dataConnector" ? ctx.dataConnector : null;

  const scope = useMemo(
    () => getDataConnectorScope(dataConnector?.namespace),
    [dataConnector]
  );

  const identifier = useMemo(
    () =>
      scope === "global"
        ? `${dataConnector?.slug}`
        : `${dataConnector?.namespace}/${dataConnector?.slug}`,
    [dataConnector?.namespace, dataConnector?.slug, scope]
  );

  const dataConnectorSource = useGetDataConnectorSource(
    dataConnector ?? undefined
  );

  const doiReference = useMemo(() => {
    if (!dataConnector) return null;
    const doi =
      scope === "global" &&
      dataConnector.storage.configuration["doi"] &&
      typeof dataConnector.storage.configuration["doi"] === "string"
        ? parseDoi(dataConnector.storage.configuration["doi"])
        : null;
    if (doi) {
      return doi;
    }
    if (dataConnector.doi) {
      return parseDoi(dataConnector.doi);
    }
    return null;
  }, [dataConnector, scope]);

  const sortedKeywords = useMemo(() => {
    if (!dataConnector?.keywords) return [];
    return dataConnector.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [dataConnector]);

  if (!ctx || kind !== "dataConnector" || !dataConnector) return null;

  return (
    <Card data-cy="group-info-card">
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <h2 className="mb-0">
            <InfoCircle className={cx("me-1", "bi")} />
            Info
          </h2>
        </div>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-4")}>
        <InfoEntry title="Identifier">
          <div className={cx("align-items-center", "d-flex", "gap-2")}>
            {identifier}
            <Clipboard
              className={cx("border-0", "btn", "p-0", "shadow-none")}
              clipboardText={identifier}
            />
          </div>
        </InfoEntry>
        {dataConnector.description && (
          <InfoEntry title="Description">
            <LazyMarkdown>{dataConnector.description}</LazyMarkdown>
          </InfoEntry>
        )}
        <InfoEntry title="Visibility">
          {dataConnector.visibility === "private" ? (
            <>
              <Lock className={cx("bi", "me-1")} />
              Private
            </>
          ) : (
            <>
              <Globe2 className={cx("bi", "me-1")} />
              Public
            </>
          )}

          {/* //! TODO: dataConnectorPotentiallyInaccessible */}
        </InfoEntry>

        {scope === "global" ? (
          <>
            <InfoEntry title="Source">
              <div className={cx("align-items-center", "d-flex", "gap-1")}>
                <Journals className={cx("me-1", "flex-shrink-0")} />
                DOI from {dataConnectorSource}
              </div>
            </InfoEntry>
            <InfoEntry title="DOI">
              <div className={cx("align-items-center", "d-flex", "gap-2")}>
                <ExternalLink href={`https://doi.org/${doiReference}`}>
                  {doiReference}
                </ExternalLink>
                <Clipboard
                  className={cx("border-0", "btn", "p-0", "shadow-none")}
                  clipboardText={
                    dataConnector.storage.configuration["doi"] as string
                  }
                />
              </div>
            </InfoEntry>
          </>
        ) : null}

        {dataConnector.keywords && dataConnector.keywords.length > 0 && (
          <InfoEntry title="Keywords">
            <KeywordContainer>
              {sortedKeywords.map((keyword, index) => (
                <KeywordBadge key={index} searchKeyword={keyword}>
                  {keyword}
                </KeywordBadge>
              ))}
            </KeywordContainer>
          </InfoEntry>
        )}
      </CardBody>
    </Card>
  );
}

function DataConnectorCredentials() {
  return (
    <Card data-cy="group-credentials-card">
      <CardHeader>
        <h2 className="mb-0">
          <PersonBadge className="me-1" />
          Credentials
        </h2>
      </CardHeader>
      <CardBody>
        <p>WIP</p>
        {/* <DataConnectorPropertyValue title="Requires credentials">
                <span data-cy="requires-credentials-section">
                  {anySensitiveField ? "Yes" : "No"}
                </span>
              </DataConnectorPropertyValue> */}
      </CardBody>
    </Card>
  );
}

interface InfoEntryProps {
  children: React.ReactNode;
  title: string;
}
function InfoEntry({ children, title }: InfoEntryProps) {
  return (
    <div>
      <p className={cx("mb-1", "fw-semibold")}>{title}</p>
      <div data-cy={title.toLocaleLowerCase().replace(/\s/g, "-")}>
        {children}
      </div>
    </div>
  );
}
