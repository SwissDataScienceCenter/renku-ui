import { Outlet } from "react-router";

import HelpRoot from "~/features/help/HelpRoot";

export default function HelpPagesLayout() {
  return (
    <HelpRoot>
      <Outlet />
    </HelpRoot>
  );
}
