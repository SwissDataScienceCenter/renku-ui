import { Outlet } from "react-router";

import ProjectPageLayout from "~/features/ProjectPageV2/ProjectPageLayout/ProjectPageLayout";

export default function ProjectPagesRoot() {
  return (
    <ProjectPageLayout>
      <Outlet />
    </ProjectPageLayout>
  );
}
