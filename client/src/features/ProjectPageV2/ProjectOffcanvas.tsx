// interface DataConnectorViewProps {
//   dataConnector: DataConnectorRead;
//   dataConnectorLink?: DataConnectorToProjectLink;
//   lastDeposit?: Deposit;
//   showView: boolean;
//   toggleView: () => void;
//   toggleEdit: (initialStep?: number) => void;
//   dataConnectorPotentiallyInaccessible?: boolean;
// }

import cx from "classnames";
import { generatePath } from "react-router";
import { Offcanvas, OffcanvasBody } from "reactstrap";

import OffcanvasHeaderWithType from "~/components/offcanvas/OffcanvasHeaderWithType";
import OffcanvasTopButtons from "~/components/offcanvas/OffcanvasTopButtons";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { Project } from "../projectsV2/api/projectV2.api";
import ProjectInformation from "./ProjectPageContent/ProjectInformation/ProjectInformation";
import ProjectCopyBanner from "./ProjectPageHeader/ProjectCopyBanner";
import ProjectTemplateInfoBanner from "./ProjectPageHeader/ProjectTemplateInfoBanner";

interface ProjectInformationProps {
  isOffcanvasOpen: boolean;
  project: Project;
  toggleOffcanvas: () => void;
}
export default function ProjectOffcanvas({
  isOffcanvasOpen,
  project,
  toggleOffcanvas,
}: ProjectInformationProps) {
  const fullPageLink = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: project.namespace,
    slug: project.slug,
  });

  return (
    <Offcanvas
      toggle={toggleOffcanvas}
      isOpen={isOffcanvasOpen}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody data-cy="project-offcanvas-view">
        <OffcanvasTopButtons
          entityType="project"
          fullPageLink={fullPageLink}
          toggleView={toggleOffcanvas}
        />

        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <OffcanvasHeaderWithType
            entityType="project"
            title={project.name}
          ></OffcanvasHeaderWithType>

          {project.description && (
            <p className="mb-0" data-cy="project-description">
              {project.description}
            </p>
          )}
          {project.is_template && (
            <>
              <ProjectTemplateInfoBanner project={project} />
              <ProjectCopyBanner project={project} />
            </>
          )}

          <ProjectInformation project={project} />
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
}
