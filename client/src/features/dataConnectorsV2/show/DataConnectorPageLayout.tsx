import cx from "classnames";
import { ReactNode } from "react";
import { generatePath } from "react-router";
import { Col, Row } from "reactstrap";

import ContainerWrap from "~/components/container/ContainerWrap";
import {
  EntityWatermark,
  EntityWatermarkPlaceholder,
} from "~/components/entityWatermark/EntityWatermark";
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

      <Row className="my-3">
        <Col xs={12}>
          <Row>
            <Col className="mb-3">
              <DataConnectorHeader name={dataConnector.name} />
            </Col>
            <Col className={cx("d-md-block", "d-none")} md="auto">
              <div className="position-relative">
                <EntityWatermarkPlaceholder />
                <EntityWatermark
                  className={cx("end-0", "position-absolute", "top-0")}
                  type="dataConnector"
                />
              </div>
            </Col>
          </Row>
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
  name: string;
}
function DataConnectorHeader({ name }: DataConnectorHeaderProps) {
  return <h1 data-cy="data-connector-name">{name}</h1>;
}
