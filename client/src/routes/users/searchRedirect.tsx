import { redirect } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

const USER_SEARCH = `${ABSOLUTE_ROUTES.v2.search}?type=User`;

export async function loader() {
  throw redirect(USER_SEARCH);
}

export async function clientLoader() {
  throw redirect(USER_SEARCH);
}
