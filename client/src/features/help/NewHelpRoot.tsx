// import { ToastContainer } from "react-toastify";

import { Provider } from "react-redux";
import { Outlet, useOutletContext } from "react-router";
import { Col, Row } from "reactstrap";

import ContainerWrap from "~/components/container/ContainerWrap";
import { RootOutletContext } from "~/root";
import { store } from "~/store/store";
import { Maintenance } from "../maintenance/Maintenance";
import HelpNav from "./HelpNav";

export default function NewHelpRoot() {
  const { params } = useOutletContext<RootOutletContext>();

  // show maintenance page when necessary
  const maintenance = params.MAINTENANCE;
  if (maintenance) {
    return (
      <Provider store={store}>
        <Maintenance info={maintenance} />
      </Provider>
    );
  }

  const statuspageId = params.STATUSPAGE_ID;

  return (
    <ContainerWrap>
      <Row>
        <Col xs={12}>
          <h1>Help</h1>
        </Col>
        <Col xs={12}>
          <HelpNav statuspageId={statuspageId} />
        </Col>
        <Col xs={12}>
          <Outlet />
        </Col>
      </Row>
    </ContainerWrap>
  );
}
