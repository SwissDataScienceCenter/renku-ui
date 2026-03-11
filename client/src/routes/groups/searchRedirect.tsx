import { redirect } from "react-router";

import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

const GROUP_SEARCH = `${ABSOLUTE_ROUTES.v2.search}?type=Group`;

export async function loader() {
  throw redirect(GROUP_SEARCH);
}

export async function clientLoader() {
  throw redirect(GROUP_SEARCH);
}
