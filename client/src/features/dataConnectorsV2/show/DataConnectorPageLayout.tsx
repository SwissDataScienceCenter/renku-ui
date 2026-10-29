import cx from "classnames";
import { ReactNode } from "react";
import { generatePath } from "react-router";
import { Col, Row } from "reactstrap";

import ContainerWrap from "~/components/container/ContainerWrap";
import PageNav, { PageNavOptions } from "~/components/PageNav";
import DataConnectorPageHeader from "~/features/dataConnectorsV2/DataConnectorPage/DataConnectorPageHeader";
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

      <Row className="my-3">
        <Col className={cx("mb-3", "min-w-0")}>
          <DataConnectorPageHeader dataConnector={dataConnector} />
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
