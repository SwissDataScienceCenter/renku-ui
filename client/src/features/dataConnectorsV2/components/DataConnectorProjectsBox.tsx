import cx from "classnames";
import { Folder } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, ListGroup } from "reactstrap";

import { Loader } from "~/components/Loader";
import ProjectShortHandDisplay from "~/features/projectsV2/show/ProjectShortHandDisplay";
import { DataConnectorRead } from "../api/data-connectors.api";
import useDataConnectorProjects from "./useDataConnectorProjects.hook";

interface DataConnectorProjectsBoxProps {
  dataConnector: DataConnectorRead;
  headerTag?: "h2" | "h3" | "h4";
}
export default function DataConnectorProjectsBox({
  dataConnector,
  headerTag = "h2",
}: DataConnectorProjectsBoxProps) {
  const { projects, isLoading } = useDataConnectorProjects({ dataConnector });

  return (
    <Card data-cy="data-connector-projects-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <Folder className={cx("bi", "me-1")} />
          Linked projects
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {isLoading ? (
          <Loader />
        ) : projects.length > 0 ? (
          <ListGroup flush data-cy="dashboard-project-list">
            {projects.map((project) => (
              <ProjectShortHandDisplay
                displayRows={["description", "namespace"]}
                key={project.id}
                project={project}
              />
            ))}
          </ListGroup>
        ) : (
          <p className="mb-0">
            This data connector is not used in any project you can access.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
