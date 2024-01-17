import DatasetImport from "../../../project/datasets/import";
import type { DatasetImportProps } from "../../../project/datasets/import/DatasetImport";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import type { StateModelProject } from "../Project";

type ProjectDatasetImportProps = {
  client: DatasetImportProps["client"];
  fetchDatasets: DatasetImportProps["fetchDatasets"];
  history: DatasetImportProps["history"];
  location: DatasetImportProps["location"];
  model: unknown;
  notifications: unknown;
  params: unknown;
  toggleNewDataset: DatasetImportProps["toggleNewDataset"];
};

function ProjectDatasetImport(props: ProjectDatasetImportProps) {
  const project = useLegacySelector<StateModelProject>(
    (state) => state.stateModel.project
  );
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const externalUrl = projectMetadata.externalUrl;

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectPathWithNamespace = `${projectNamespace}/${projectPath}`;

  return (
    <DatasetImport
      key="datasetImport"
      accessLevel={accessLevel}
      client={props.client}
      externalUrl={externalUrl}
      fetchDatasets={props.fetchDatasets}
      history={props.history}
      location={props.location}
      projectPathWithNamespace={projectPathWithNamespace}
      toggleNewDataset={props.toggleNewDataset}
    />
  );
}

export default ProjectDatasetImport;
