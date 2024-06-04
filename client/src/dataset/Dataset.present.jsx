/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEmpty, groupBy } from "lodash-es";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useHistory } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Table,
  UncontrolledTooltip,
} from "reactstrap";

import { ErrorAlert, WarnAlert } from "../components/Alert";
import { ExternalLink } from "../components/ExternalLinks";
import FileExplorer from "../components/FileExplorer";
import { Loader } from "../components/Loader";
import { EntityDeleteButtonButton } from "../components/entities/Buttons";
import EntityHeader from "../components/entityHeader/EntityHeader";
import { CoreErrorAlert } from "../components/errors/CoreErrorAlert";
import { CoreError } from "../components/errors/CoreErrorHelpers";
import LazyRenkuMarkdown from "../components/markdown/LazyRenkuMarkdown";
import DeleteDataset from "../project/datasets/delete";
import { toHumanDateTime } from "../utils/helpers/DateTimeUtils";
import { Url } from "../utils/helpers/url";
import { DatasetError } from "./DatasetError";
import {
  cleanModifyLocation,
  getDatasetAuthors,
  getUpdatedDatasetImage,
} from "./DatasetFunctions";
import { getEntityImageUrl } from "../utils/helpers/HelperFunctions";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";

function DisplayFiles(props) {
  if (!props.files || !props.files?.hasPart) return null;
  if (props.isFilesFetching || props.loadingDatasets) return "LOADING FILES...";

  if (props.filesFetchError != null) {
    const error = props.filesFetchError;
    let errorObject;
    if (CoreError.isValid(error)) {
      errorObject = <CoreErrorAlert error={error} />;
    } else {
      errorObject = (
        <span>
          <strong>Error fetching dataset files:</strong>{" "}
          {JSON.stringify(props.filesFetchError)}
        </span>
      );
    }

    return (
      <Card key="datasetDetails" className="mb-4">
        <CardHeader className="bg-white p-3 ps-4">Dataset files</CardHeader>
        <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">{errorObject}</CardBody>
      </Card>
    );
  }

  const files = props.files.hasPart;
  const filesMap = groupBy(files, (file) => file.atLocation.split("/")[0]);
  const filesFolderLength = Object.keys(filesMap);
  const fileLengthCutoff = 5;

  const openFolders =
    files.length < 1
      ? 0
      : filesFolderLength > 1
      ? 1
      : files.length < fileLengthCutoff
      ? 2
      : 1;

  // ? This re-adds the name property on the datasets.
  // TODO: consider refactoring FileExplorer
  const filesWithNames = files.map((file) => {
    // Add the file name
    let newFile = { ...file };
    // Skip if it's already there
    if (newFile.name && newFile.name.length) return newFile;
    // Skip if there is no `atLocation` property
    if (!newFile.atLocation || !newFile.atLocation.length) return newFile;
    // Skip if it's not possible to derive it
    const lastSlash = newFile.atLocation.lastIndexOf("/");
    if (lastSlash === -1 || newFile.atLocation.length < lastSlash + 1)
      return newFile;
    newFile.name = newFile.atLocation.substring(lastSlash + 1);
    return newFile;
  });

  // see Url.pages.project.file / Url.pages.project.lineage
  const linkUrl = props.lineagesUrl?.replace("/lineage", "/blob");
  return (
    <Card key="datasetDetails" className="mb-4">
      <CardHeader className="bg-white p-3 ps-4" data-cy="dataset-file-title">
        Dataset files ({files.length})
      </CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
        {files.length === 0 ? (
          <span>No files on this dataset.</span>
        ) : (
          <FileExplorer
            files={filesWithNames}
            linkUrl={linkUrl}
            insideProject={props.insideProject}
            foldersOpenOnLoad={openFolders}
          />
        )}
      </CardBody>
    </Card>
  );
}

function DisplayProjects(props) {
  if (props.projects === undefined || !Array.isArray(props.projects))
    return null;
  return (
    <Card key="datasetProjectDetails" className="mb-4">
      <CardHeader className="bg-white p-3 ps-4">
        Projects using this dataset
      </CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
        <Table size="sm" borderless>
          <thead>
            <tr>
              <th>Name</th>
              <th className="text-center">Date Created</th>
              <th className="text-center">Created By</th>
            </tr>
          </thead>
          <tbody>
            {props.projects.map((project, index) => (
              <tr data-cy="project-using-dataset" key={project.name + index}>
                <td className="text-break">
                  <Link to={`${props.projectsUrl}/${project.path}`}>
                    {project.path}
                  </Link>
                </td>
                {project.created && project.created.dateCreated ? (
                  <td className="text-center">
                    {toHumanDateTime({
                      datetime: project.created.dateCreated,
                      format: "date",
                    })}
                  </td>
                ) : null}
                {project.created && project.created.agent ? (
                  <td className="text-center">{project.created.agent.name}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}

function DisplayDescription(props) {
  if (!props.description) return null;

  return (
    <Card key="datasetDescription" className="mb-4">
      <CardHeader className="bg-white p-3 ps-4">Dataset description</CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
        {props.insideProject ? (
          <LazyRenkuMarkdown
            projectPathWithNamespace={props.projectPathWithNamespace}
            filePath={""}
            fixRelativePaths={true}
            markdownText={props.description}
            branch={props.defaultBranch}
            client={props.client}
            projectId={props.projectId}
          />
        ) : (
          <LazyRenkuMarkdown markdownText={props.description} />
        )}
      </CardBody>
    </Card>
  );
}

function DisplayMetadata({ dataset, sameAs, insideProject }) {
  if (!dataset) return null;
  if (
    !dataset.mediaContent &&
    (!dataset.sameAs || !dataset.url || !dataset.sameAs.includes("doi.org")) &&
    dataset.published?.creator?.length < 3
  )
    return null;

  return (
    <Card key="datasetDescription" className="mb-4">
      <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
        {
          <div className="d-flex">
            <div className="flex-grow-1">
              <DisplayInfoTable
                dataset={dataset}
                insideProject={insideProject}
                sameAs={sameAs}
              />
            </div>
          </div>
        }
      </CardBody>
    </Card>
  );
}

function DisplayInfoTable(props) {
  const { dataset } = props;
  if (!dataset || !dataset?.exists) return null;

  const source =
    dataset.sameAs && dataset.sameAs.includes("doi.org") ? (
      <ExternalLink url={dataset.sameAs} title={dataset.sameAs} role="link" />
    ) : dataset.url && props.insideProject ? (
      <ExternalLink url={dataset.url} title={dataset.url} role="link" />
    ) : (
      "Not available"
    );

  const authors = getDatasetAuthors(dataset);
  const authorsText = authors ? authors : "Not available";
  const authorPluralization = dataset.published?.creator?.length > 1 ? "s" : "";

  return (
    <Table className="table-borderless mb-0" size="sm">
      <tbody className="text-rk-text">
        <tr>
          <td className="text-dark fw-bold col-auto">
            Author{authorPluralization}
          </td>
          <td>{authorsText}</td>
        </tr>
        {source ? (
          <tr>
            <td className="text-dark fw-bold" style={{ width: "120px" }}>
              Source
            </td>
            <td>{source}</td>
          </tr>
        ) : null}
      </tbody>
    </Table>
  );
}

function ErrorAfterCreation(props) {
  const editButton = (
    <Link
      className="float-right me-1 mb-1"
      id="editDatasetTooltip"
      to={(location) =>
        cleanModifyLocation(location, { dataset: props.dataset })
      }
    >
      <Button size="sm" color="danger" className="btn-icon-text">
        <FontAwesomeIcon icon={faPen} color="dark" /> Edit
      </Button>
    </Link>
  );

  return props.location.state && props.location.state.errorOnCreation ? (
    <ErrorAlert>
      <strong>Error on creation</strong>
      <br />
      The dataset was created, but there was an error adding files to it.
      <br />
      Please {editButton} the dataset to add the missing files.
    </ErrorAlert>
  ) : null;
}

function AddToProjectButton({ insideKg, locked, logged, identifier }) {
  const history = useHistory();
  const addDatasetUrl = `/datasets/${identifier}/add`;
  const goToAddToProject = () => {
    if (history) history.push(addDatasetUrl);
  };

  const tooltip =
    logged && locked ? (
      <UncontrolledTooltip target="add-dataset-to-project-button">
        Cannot add dataset to project until project modification finishes
      </UncontrolledTooltip>
    ) : insideKg === false ? (
      <UncontrolledTooltip target="add-dataset-to-project-button">
        Cannot add dataset to project, the project containing this dataset is
        not indexed
      </UncontrolledTooltip>
    ) : (
      <UncontrolledTooltip target="add-dataset-to-project-button">
        Import Dataset in new or existing project
      </UncontrolledTooltip>
    );

  return (
    <span id="add-dataset-to-project-button">
      <Button
        data-cy="add-to-project-button"
        disabled={insideKg === false || locked}
        className="btn-outline-rk-pink icon-button"
        size="sm"
        onClick={() => goToAddToProject()}
      >
        <FontAwesomeIcon icon={faPlus} color="dark" />
      </Button>
      {tooltip}
    </span>
  );
}

function EditDatasetButton({
  dataset,
  files,
  isFilesFetching,
  filesFetchError,
  insideProject,
  locked,
  maintainer,
}) {
  if (!insideProject || !maintainer) return null;
  if (locked) {
    return (
      <span className="float-right mb-1" id="editDatasetTooltip">
        <Button
          className="btn-outline-rk-pink icon-button"
          data-cy="edit-dataset-button"
          disabled={true}
          size="sm"
        >
          <FontAwesomeIcon icon={faPen} color="dark" />
        </Button>
        <UncontrolledTooltip target="editDatasetTooltip">
          Cannot edit dataset until project modification finishes.
        </UncontrolledTooltip>
      </span>
    );
  }
  return (
    <Link
      className="float-right mb-1"
      id="editDatasetTooltip"
      data-cy="edit-dataset-button"
      to={(location) =>
        cleanModifyLocation(location, {
          dataset,
          files,
          isFilesFetching,
          filesFetchError,
        })
      }
    >
      <Button
        className="btn-outline-rk-pink icon-button"
        size="sm"
        data-cy="edit-dataset-button"
      >
        <FontAwesomeIcon icon={faPen} color="dark" />
      </Button>
      <UncontrolledTooltip target="editDatasetTooltip">
        Modify Dataset
      </UncontrolledTooltip>
    </Link>
  );
}

function getLinksDatasetHeader(projects) {
  const linksHeader = {
    data: [],
    status: "done",
    total: 0,
    linkAll: undefined,
  };
  if (linksHeader.status !== "is_updating" && projects?.length > 0) {
    linksHeader.total = projects.length;
    projects.slice(0, 3).map((project) => {
      linksHeader.data.push({
        title: project.name,
        url: `/projects/${project.path}`,
        tooltip: project.path,
      });
    });
  }
  return linksHeader;
}

export default function DatasetView(props) {
  const [deleteDatasetModalOpen, setDeleteDatasetModalOpen] = useState(false);
  const { defaultBranch } = useLegacySelector(
    (state) => state.stateModel.project.metadata
  );

  const dataset = props.dataset;
  // We only get the locked prop if we are inside a project
  const locked = props.insideProject && props.lockStatus?.locked === true;

  if (props.loadingDatasets) return <Loader />;

  if (dataset === undefined || !dataset?.exists) {
    if (!isEmpty(props.fetchError)) {
      return (
        <DatasetError
          fetchError={props.fetchError}
          insideProject={props.insideProject}
          logged={props.logged}
        />
      );
    }
  }

  const datasetTitle = dataset.name;
  const datasetDesc = dataset.description;
  const pageTitle = datasetDesc
    ? `${datasetTitle} • Dataset • ${datasetDesc}`
    : `${datasetTitle} • Dataset`;

  /* Header buttons */
  const modifyButton = (
    <EditDatasetButton
      key="editDatasetButton"
      dataset={dataset}
      files={props.files}
      isFilesFetching={props.isFilesFetching}
      filesFetchError={props.filesFetchError}
      insideProject={props.insideProject}
      locked={locked}
      maintainer={props.maintainer}
    />
  );

  const deleteOption =
    !props.insideProject || !props.maintainer || locked ? null : (
      <EntityDeleteButtonButton
        key="deleteDatasetButton"
        itemType="dataset"
        action={() => setDeleteDatasetModalOpen(true)}
      />
    );

  const addToProject = (
    <AddToProjectButton
      key="addToProjectButton"
      identifier={dataset.identifier}
      insideKg={dataset?.insideKg}
      locked={locked}
      logged={props.logged}
    />
  );
  /* End header buttons */

  const datasetPublished = dataset.published?.datePublished;
  const datasetDate = datasetPublished
    ? dataset.published.datePublished
    : dataset.created;
  const linksHeader = getLinksDatasetHeader(dataset.usedIn);
  const timeCaption = datasetDate != null ? new Date(datasetDate) : "";

  const imageUrl = dataset.mediaContent
    ? getUpdatedDatasetImage(dataset.mediaContent, datasetDate)
    : dataset.images?.length > 0
    ? getUpdatedDatasetImage(getEntityImageUrl(dataset.images), datasetDate)
    : undefined;

  const settingsUrl = Url.get(Url.pages.project.settings, {
    namespace: "",
    path: props.projectPathWithNamespace,
  });

  return (
    <div
      className={
        props.insideProject ? "row" : "container-xxl renku-container py-4 mt-2"
      }
    >
      <Col>
        <ErrorAfterCreation location={props.location} dataset={dataset} />
        {props.insideProject ? null : (
          <Helmet>
            <title>{pageTitle}</title>
          </Helmet>
        )}
        <div className="mb-4">
          <EntityHeader
            creators={dataset?.published?.creator}
            devAccess={false}
            hideEmptyTags={true}
            imageUrl={imageUrl}
            itemType="dataset"
            labelCaption={datasetPublished ? "Published" : "Created"}
            links={linksHeader}
            otherButtons={[deleteOption, modifyButton, addToProject]}
            slug={dataset.slug}
            tagList={dataset.keywords}
            timeCaption={timeCaption}
            title={dataset.name}
            url={dataset.identifier}
          />
        </div>
        <DisplayMetadata
          dataset={props.dataset}
          sameAs={props.sameAs}
          insideProject={props.insideProject}
        />
        <DisplayDescription
          projectPathWithNamespace={props.projectPathWithNamespace}
          projectsUrl={props.projectsUrl}
          client={props.client}
          projectId={props.projectId}
          description={dataset.description}
          insideProject={props.insideProject}
          defaultBranch={props.defaultBranch ?? defaultBranch}
        />
        <DisplayFiles
          projectsUrl={props.projectsUrl}
          fileContentUrl={props.fileContentUrl}
          lineagesUrl={props.lineagesUrl}
          files={props.files}
          isFilesFetching={props.isFilesFetching}
          filesFetchError={props.filesFetchError}
          insideProject={props.insideProject}
          loadingDatasets={props.loadingDatasets}
        />
        {
          //here we assume that if the dataset is only in one project
          //this one project is the current project and we don't display the list
          (dataset.usedIn && dataset.usedIn.length > 1) ||
          !props.insideProject ? (
            <DisplayProjects
              projects={dataset.usedIn}
              projectsUrl={props.projectsUrl}
            />
          ) : null
        }
        {dataset.insideKg === false && props.projectInsideKg === true ? (
          <WarnAlert className="not-in-kg-warning">
            <p>
              <strong data-cy="not-in-kg-warning">
                The metadata for this dataset is being indexed.
              </strong>{" "}
              Some features will not be available until processing completes.
            </p>
            <p>
              If the dataset was created recently, indexing should complete
              soon. You can&nbsp;
              <Button
                size="sm"
                color="warning"
                onClick={() => window.location.reload()}
              >
                refresh the page
              </Button>{" "}
              to see if the status changed.
            </p>
            For more information about the indexing status you can go to
            the&nbsp;
            <Link className="btn btn-sm btn-warning" to={settingsUrl}>
              project settings page
            </Link>
            .
          </WarnAlert>
        ) : null}
        {props.insideProject && props.maintainer ? (
          <DeleteDataset
            apiVersion={props.apiVersion}
            client={props.client}
            dataset={dataset}
            externalUrl={props.externalUrl}
            history={props.history}
            metadataVersion={props.metadataVersion}
            modalOpen={deleteDatasetModalOpen}
            projectPathWithNamespace={props.projectPathWithNamespace}
            setModalOpen={setDeleteDatasetModalOpen}
            user={props.user}
            versionUrl={props.versionUrl}
            branch={defaultBranch}
          />
        ) : null}
      </Col>
    </div>
  );
}
