import { redirect } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

const DATA_CONNECTOR_SEARCH = `${ABSOLUTE_ROUTES.v2.search}?type=DataConnector`;

export async function loader() {
  throw redirect(DATA_CONNECTOR_SEARCH);
}

export async function clientLoader() {
  throw redirect(DATA_CONNECTOR_SEARCH);
}
