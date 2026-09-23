import cx from "classnames";
import { ReactNode } from "react";
import { generatePath } from "react-router";
import { Col, Row } from "reactstrap";

import ContainerWrap from "~/components/container/ContainerWrap";
import EntityBreadcrumb from "~/components/entityBreadcrumb/EntityBreadcrumb";
import EntityIcon from "~/components/entityIcon/EntityIcon";
import PageNav, { PageNavOptions } from "~/components/PageNav";
import GroupNew from "~/features/groupsV2/new/GroupNew";
import ProjectV2New from "~/features/projectsV2/new/ProjectV2New";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { DataConnectorRead } from "../api/data-connectors.api";

interface DataConnectorPageLayoutProps {
  dataConnector: DataConnectorRead;
  children?: ReactNode;
  routeParams: {
    projectNamespace: string | null;
    dataConnectorNamespace: string | null;
    slug: string;
  };
}
export default function DataConnectorPageLayout({
  dataConnector,
  children,
  routeParams,
}: DataConnectorPageLayoutProps) {
  const options: PageNavOptions = {
    overviewUrl: generatePath(ABSOLUTE_ROUTES.v2.dataConnectors.show.root, {
      dataConnectorNamespace: routeParams.dataConnectorNamespace,
      projectNamespace: routeParams.projectNamespace,
      slug: routeParams.slug,
    }),
    settingsUrl: generatePath(ABSOLUTE_ROUTES.v2.dataConnectors.show.settings, {
      dataConnectorNamespace: routeParams.dataConnectorNamespace,
      projectNamespace: routeParams.projectNamespace,
      slug: routeParams.slug,
    }),
    type: "dataConnector",
  };

  return (
    <ContainerWrap>
      <ProjectV2New />
      <GroupNew />

      <Row>
        <Col xs={12} className="mb-3">
          <DataConnectorHeader dataConnector={dataConnector} />
        </Col>
        <Col xs={12} className="mb-3">
          <PageNav options={options} />
        </Col>
        <Col xs={12}>
          <main>{children}</main>
        </Col>
      </Row>
    </ContainerWrap>
  );
}

interface DataConnectorHeaderProps {
  dataConnector: DataConnectorRead;
}
function DataConnectorHeader({ dataConnector }: DataConnectorHeaderProps) {
  return (
    <div className={cx("d-flex", "flex-column", "gap-3")}>
      <EntityBreadcrumb dataConnector={dataConnector} />
      <header
        className={cx(
          "d-flex",
          "flex-column",
          "flex-md-row",
          "flex-nowrap",
          "gap-2",
        )}
      >
        <EntityIcon type="dataConnector" />
        <h1 className={cx("mb-0", "text-break")} data-cy="data-connector-name">
          {dataConnector.name}
        </h1>
      </header>
    </div>
  );
}
