import { RootStateOrAny, useSelector } from "react-redux";

import { ACCESS_LEVELS } from "../../../api-client";
import { FileLineage, ShowFile } from "../../../file";
import { Url } from "../../../utils/helpers/url";

import type { StateModelProject } from "../Project";

type ProjectFileLineageProps = {
  client: unknown;
  fetchBranches: unknown;
  filePath: string;
  history: unknown;
  location: {
    pathname: string;
  };
  model: unknown;
  projectId?: number;
};

function ProjectFileLineage(props: ProjectFileLineageProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const defaultBranch = projectMetadata.defaultBranch;
  const externalUrl = projectMetadata.externalUrl;
  const filesTree = project.filesTree;
  const httpProjectUrl = projectMetadata.httpUrl;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;

  const forkedData = project.forkedFromProject;
  const forked =
    forkedData != null && Object.keys(forkedData).length > 0 ? true : false;

  const branches = {
    all: project.branches,
    fetch: props.fetchBranches,
  };

  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = {
    namespace: projectNamespace,
    path: projectPath,
    target: "",
  };
  const fileContentUrl = Url.get(Url.pages.project.file, projectUrlProps);
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const overviewCommitsUrl = Url.get(
    Url.pages.project.overview.commits,
    projectUrlProps
  );
  const sessionNewUrl = Url.get(Url.pages.project.session.new, projectUrlProps);
  const gitFilePath = props.location.pathname.replace(
    lineageUrl + "/files/lineage/",
    ""
  );

  return (
    <FileLineage
      key="lineage"
      accessLevel={accessLevel}
      branch={defaultBranch}
      branches={branches}
      client={props.client}
      externalUrl={externalUrl}
      fileContentUrl={fileContentUrl}
      forked={forked}
      gitFilePath={gitFilePath}
      hashElement={filesTree ? filesTree.hash[props.filePath] : undefined}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      launchNotebookUrl={sessionNewUrl}
      lineagesUrl={lineagesUrl}
      location={props.location}
      maintainer={maintainer}
      model={props.model}
      notebook="Notebook"
      overviewCommitsUrl={overviewCommitsUrl}
      projectId={props.projectId}
      projectNamespace={projectNamespace}
      projectPathOnly={projectPath}
      projectPath={projectPathWithNamespace}
      path={props.filePath}
      user={user}
    />
  );
}

interface ProjectFileViewProps extends ProjectFileLineageProps {
  params: unknown;
}

function ProjectFileView(props: ProjectFileViewProps) {
  const project = useSelector(
    (state: RootStateOrAny) => state.stateModel.project as StateModelProject
  );
  const user = useSelector((state: RootStateOrAny) => state.stateModel.user);
  const projectMetadata = project.metadata;
  const accessLevel = projectMetadata.accessLevel;
  const defaultBranch = projectMetadata.defaultBranch;
  const externalUrl = projectMetadata.externalUrl;
  const filesTree = project.filesTree;
  const httpProjectUrl = projectMetadata.httpUrl;
  const maintainer = accessLevel >= ACCESS_LEVELS.MAINTAINER ? true : false;
  const projectId = projectMetadata.id;
  const projectPathWithNamespace = projectMetadata.pathWithNamespace;

  const forkedData = project.forkedFromProject;
  const forked =
    forkedData != null && Object.keys(forkedData).length > 0 ? true : false;

  const branches = {
    all: project.branches,
    fetch: props.fetchBranches,
  };
  const projectPath = projectMetadata.path;
  const projectNamespace = projectMetadata.namespace;
  const projectUrlProps = {
    namespace: projectNamespace,
    path: projectPath,
    target: "",
  };
  const fileContentUrl = Url.get(Url.pages.project.file, projectUrlProps);
  const lineageUrl = Url.get(Url.pages.project.lineage, projectUrlProps);
  // Remove the trailing slash, since that is how downstream components expect it.
  const lineagesUrl = lineageUrl.substring(0, lineageUrl.length - 1);
  const overviewCommitsUrl = Url.get(
    Url.pages.project.overview.commits,
    projectUrlProps
  );
  const sessionNewUrl = Url.get(Url.pages.project.session.new, projectUrlProps);
  const filePath = props.location.pathname.replace(fileContentUrl, "");

  return (
    <ShowFile
      key="filePreview"
      accessLevel={accessLevel}
      branch={defaultBranch}
      branches={branches}
      client={props.client}
      defaultBranch={defaultBranch}
      externalUrl={externalUrl}
      fileContentUrl={fileContentUrl}
      filePath={filePath}
      filesTree={filesTree}
      forked={forked}
      hashElement={filesTree ? filesTree.hash[props.filePath] : undefined}
      history={props.history}
      httpProjectUrl={httpProjectUrl}
      insideProject={true}
      lineagesPath={lineagesUrl}
      lineagesUrl={lineagesUrl}
      launchNotebookUrl={sessionNewUrl}
      location={props.location}
      maintainer={maintainer}
      model={props.model}
      overviewCommitsUrl={overviewCommitsUrl}
      params={props.params}
      projectNamespace={projectNamespace}
      projectId={projectId}
      projectPath={projectPath}
      projectPathWithNamespace={projectPathWithNamespace}
      projectPathOnly={projectPath}
      user={user}
    />
  );
}

export { ProjectFileLineage, ProjectFileView };
