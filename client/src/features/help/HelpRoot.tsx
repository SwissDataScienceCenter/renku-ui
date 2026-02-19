import { ReactNode, useContext } from "react";
import { Col, Row } from "reactstrap";

import ContainerWrap from "~/components/container/ContainerWrap";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import HelpNav from "./HelpNav";

interface HelpRootProps {
  children?: ReactNode;
}

export default function HelpRoot({ children }: HelpRootProps) {
  const { params } = useContext(AppContext);
  const statuspageId =
    params?.STATUSPAGE_ID ?? DEFAULT_APP_PARAMS.STATUSPAGE_ID;

  return (
    <ContainerWrap>
      <Row>
        <Col xs={12}>
          <h1>Help</h1>
        </Col>
        <Col xs={12}>
          <HelpNav statuspageId={statuspageId} />
        </Col>
        <Col xs={12}>{children}</Col>
      </Row>
    </ContainerWrap>
  );
}
