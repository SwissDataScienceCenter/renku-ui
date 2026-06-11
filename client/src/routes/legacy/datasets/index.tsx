import { redirect } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

const REDIRECT_TO_DATA_SEARCH = `${ABSOLUTE_ROUTES.v2.search}?type=DataConnector`;

export function loader() {
  throw redirect(REDIRECT_TO_DATA_SEARCH, 301);
}
