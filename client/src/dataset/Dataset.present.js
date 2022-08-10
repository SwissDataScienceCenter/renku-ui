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

import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  Button, Card, CardBody, CardHeader, Col, Table
} from "reactstrap";
import { Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen, faPlus,
} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";

import { DatasetError } from "./DatasetError";
import { getDatasetAuthors } from "./DatasetFunctions";
import DeleteDataset from "../project/datasets/delete/index";
import Time from "../utils/helpers/Time";
import FileExplorer from "../utils/components/FileExplorer";
import { RenkuMarkdown } from "../utils/components/markdown/RenkuMarkdown";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { ErrorAlert, WarnAlert } from "../utils/components/Alert";
import { Loader } from "../utils/components/Loader";
import { ThrottledTooltip } from "../utils/components/Tooltip";
import { CoreErrorAlert } from "../utils/components/errors/CoreErrorAlert";
import { CoreError } from "../utils/components/errors/CoreErrorHelpers";
import { ContainerWrap } from "../App";
import EntityHeader from "../utils/components/entityHeader/EntityHeader";
import { EntityDeleteButtonButton } from "../utils/components/entities/Buttons";


function DisplayFiles(props) {
  if (!props.files || !props.files?.hasPart) return null;
  if (props.files?.fetching || props.loadingDatasets) return "LOADING FILES...";


  if (props.files.fetchError !== null) {
    const error = props.files.fetchError;
    let errorObject;
    if (CoreError.isValid(error))
      errorObject = (<CoreErrorAlert error={error}/>);
    else
      errorObject = (<span><strong>Error fetching dataset files:</strong> {props.files.fetchError.message}</span>);

    return (
      <Card key="datasetDetails" className="border-rk-light mb-4">
        <CardHeader className="bg-white p-3 ps-4">Dataset files</CardHeader>
        <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">{errorObject}</CardBody>
      </Card>
    );
  }

  const files = props.files.hasPart;

  let openFolders = files.length > 0 ?
    (files[0].atLocation.startsWith("data/") ? 2 : 1)
    : 0;

  // ? This re-adds the name property on the datasets.
  // TODO: consider refactoring FileExplorer
  const filesWithNames = files.map(file => {
    // Add the file name
    let newFile = { ...file };
    // Skip if it's already there
    if (newFile.name && newFile.name.length)
      return newFile;
    // Skip if there is no `atLocation` property
    if (!newFile.atLocation || !newFile.atLocation.length)
      return newFile;
    // Skip if it's not possible to derive it
    const lastSlash = newFile.atLocation.lastIndexOf("/");
    if (lastSlash === -1 || newFile.atLocation.length < lastSlash + 1)
      return newFile;
    newFile.name = newFile.atLocation.substring(lastSlash + 1);
    return newFile;
  });

  return <Card key="datasetDetails" className="border-rk-light mb-4">
    <CardHeader className="bg-white p-3 ps-4" data-cy="dataset-file-title">Dataset files ({files.length})</CardHeader>
    <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
      {
        files.length === 0 ?
          <span>No files on this dataset.</span>
          :
          <FileExplorer
            files={filesWithNames}
            lineageUrl={props.lineagesUrl}
            insideProject={props.insideProject}
            foldersOpenOnLoad={openFolders}
          />
      }
    </CardBody>
  </Card>;
}

function DisplayProjects(props) {
  if (props.projects === undefined) return null;
  return <Card key="datasetProjectDetails" className="border-rk-light mb-4">
    <CardHeader className="bg-white p-3 ps-4">Projects using this dataset</CardHeader>
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
          {props.projects.map((project, index) =>
            <tr data-cy="project-using-dataset" key={project.name + index}>
              <td className="text-break">
                <Link to={`${props.projectsUrl}/${project.path}`}>
                  {project.path}
                </Link>
              </td>
              {project.created && project.created.dateCreated
                ? <td className="text-center">{Time.getReadableDate(project.created.dateCreated)}</td>
                : null}
              {project.created && project.created.agent
                ? <td className="text-center">{project.created.agent.name}</td>
                : null
              }
            </tr>
          )}
        </tbody>
      </Table>
    </CardBody>
  </Card>;
}

function DisplayDescription(props) {
  if (!props.description) return null;

  return <Card key="datasetDescription" className="border-rk-light mb-4 my-4">
    <CardHeader className="bg-white p-3 ps-4">Dataset description</CardHeader>
    <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
      {
        props.insideProject ?
          <RenkuMarkdown
            projectPathWithNamespace={props.projectPathWithNamespace}
            filePath={""}
            fixRelativePaths={true}
            markdownText={props.description}
            branch={props.defaultBranch}
            client={props.client}
            projectId={props.projectId}
          />
          :
          <RenkuMarkdown markdownText={props.description} />
      }
    </CardBody>
  </Card>;
}

function DisplayMetadata({ dataset, sameAs, insideProject }) {
  if (!dataset) return null;

  if (!dataset.mediaContent && (!dataset.sameAs || !dataset.url) && dataset.published?.creator?.length < 3)
    return null;

  return <Card key="datasetDescription" className="border-rk-light mb-4">
    <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
      {
        <div className="d-flex">
          {dataset.mediaContent ?
            <div className="flex-shrink-0 pe-3" style={{ width: "120px" }}>
              <img src={dataset.mediaContent} className=" rounded" alt=""
                style={{ objectFit: "cover", width: "100%", height: "90px" }} />
            </div>
            : null}
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
  </Card>;
}

function DisplayInfoTable(props) {
  const { dataset } = props;
  if (!dataset || !dataset?.exists) return null;

  const source = dataset.sameAs && dataset.sameAs.includes("doi.org") ?
    <ExternalLink url={dataset.sameAs} title={dataset.sameAs} role="link" /> :
    dataset.url && props.insideProject ?
      <ExternalLink url={dataset.url} title={dataset.url} role="link" />
      : null;

  const authors = getDatasetAuthors(dataset);

  // eslint-disable-next-line
  return <Table className="mb-4 table-borderless" size="sm">
    <tbody className="text-rk-text">
      {source ?
        <tr>
          <td className="text-dark fw-bold" style={{ "width": "120px" }}>
            Source
          </td>
          <td>
            {source}
          </td>
        </tr>
        : null
      }
      {dataset.published?.creator?.length >= 3 ? <tr>
        <td className="text-dark fw-bold col-auto">
          Author(s)
        </td>
        <td>
          {authors}
        </td>
      </tr>
        : null
      }
    </tbody>
  </Table>;
}

function ErrorAfterCreation(props) {
  const editButton = <Link className="float-right me-1 mb-1" id="editDatasetTooltip"
    to={{ pathname: "modify", state: { dataset: props.dataset } }} >
    <Button size="sm" color="danger" className="btn-icon-text" >
      <FontAwesomeIcon icon={faPen} color="dark" /> Edit
    </Button>
  </Link>;

  return props.location.state && props.location.state.errorOnCreation ?
    <ErrorAlert>
      <strong>Error on creation</strong><br />
      The dataset was created, but there was an error adding files to it.<br />
      Please {editButton} the dataset to add the missing files.
    </ErrorAlert>
    : null;
}

function AddToProjectButton({ insideKg, locked, logged, identifier }) {
  const history = useHistory();
  const addDatasetUrl = `/datasets/${identifier}/add`;
  const goToAddToProject = () => {
    if (history)
      history.push(addDatasetUrl);
  };

  const tooltip = (logged && locked) ?
    <ThrottledTooltip
      target="add-dataset-to-project-button"
      tooltip="Cannot add dataset to project until project modification finishes" /> :
    insideKg === false ?
      <ThrottledTooltip
        target="add-dataset-to-project-button"
        tooltip="Cannot add dataset to project, the project containing this dataset does not have kg activated" /> :
      <ThrottledTooltip
        target="add-dataset-to-project-button"
        tooltip="Import Dataset in new or existing project" />;

  return <span id="add-dataset-to-project-button">
    <Button
      data-cy="add-to-project-button"
      disabled={insideKg === false || locked}
      className="btn-rk-white text-rk-pink icon-button" size="sm" onClick={() => goToAddToProject()}>
      <FontAwesomeIcon icon={faPlus} color="dark" />
    </Button>
    {tooltip}
  </span>;
}

function EditDatasetButton({ dataset, insideProject, locked, maintainer }) {
  if (!insideProject || !maintainer) return null;
  if (locked) {
    return <span className="float-right mb-1 me-1" id="editDatasetTooltip">
      <Button className="btn-rk-white text-rk-pink icon-button"
        data-cy="edit-dataset-button" disabled={true} size="sm">
        <FontAwesomeIcon icon={faPen} color="dark" />
      </Button>
      <ThrottledTooltip
        target="editDatasetTooltip"
        tooltip="Cannot edit dataset until project modification finishes." />
    </span>;
  }
  return <Link className="float-right mb-1 me-1" id="editDatasetTooltip"
    data-cy="edit-dataset-button"
    to={{ pathname: "modify", state: { dataset: dataset } }} >
    <Button className="btn-rk-white text-rk-pink icon-button" size="sm">
      <FontAwesomeIcon icon={faPen} color="dark" />
    </Button>
    <ThrottledTooltip
      target="editDatasetTooltip"
      tooltip="Modify Dataset" />
  </Link>;
}

function getLinksDatasetHeader(projects) {
  const linksHeader = {
    data: [],
    status: "done",
    total: 0,
    linkAll: undefined
  };
  if (linksHeader.status !== "is_updating" && projects?.length > 0) {
    linksHeader.total = projects.length;
    projects.slice(0, 5).map( project => {
      linksHeader.data.push({
        title: project.name,
        url: `/projects/${project.path}`
      });
    });
  }
  return linksHeader;
}

export default function DatasetView(props) {

  const [deleteDatasetModalOpen, setDeleteDatasetModalOpen] = useState(false);
  const dataset = props.dataset;
  // We only get the locked prop if we are inside a project
  const locked = props.insideProject && (props.lockStatus?.locked === true);

  if (props.loadingDatasets)
    return <Loader />;

  if (dataset === undefined || !dataset?.exists) {
    if (!_.isEmpty(props.fetchError)) {
      return (
        <DatasetError
          fetchError={props.fetchError}
          insideProject={props.insideProject}
          logged={props.logged} />
      );
    }
  }

  const datasetTitle = dataset.title || dataset.name;
  const datasetDesc = dataset.description;
  const pageTitle = datasetDesc ?
    `${datasetTitle} • Dataset • ${datasetDesc}` :
    `${datasetTitle} • Dataset`;

  /* Header buttons */
  const modifyButton = <EditDatasetButton
    key="editDatasetButton"
    dataset={dataset}
    insideProject={props.insideProject} locked={locked} maintainer={props.maintainer} />;

  const deleteOption = !props.insideProject || !props.maintainer || locked ? null :
    <EntityDeleteButtonButton
      key="deleteDatasetButton" itemType="dataset" action={() => setDeleteDatasetModalOpen(true)}/>;

  const addToProject = <AddToProjectButton
    key="addToProjectButton"
    identifier={dataset.identifier} insideKg={dataset?.insideKg} locked={locked} logged={props.logged} />;
  /* End header buttons */

  const datasetPublished = dataset.published !== undefined && dataset.published.datePublished
    !== undefined && dataset.published.datePublished !== null;
  const datasetDate = datasetPublished ? dataset.published.datePublished : dataset.created;
  const linksHeader = getLinksDatasetHeader(dataset.usedIn);

  return (<ContainerWrap>
    <Col>
      <ErrorAfterCreation location={props.location} dataset={dataset} />
      {
        props.insideProject ? null :
          <Helmet>
            <title>{pageTitle}</title>
          </Helmet>
      }
      <div className="mb-4">
        <EntityHeader
          title={dataset.title}
          description=""
          itemType="dataset"
          tagList={dataset.keywords}
          creators={dataset?.published?.creator}
          labelCaption={datasetPublished ? "Published" : "Created"}
          timeCaption={datasetDate}
          devAccess={false}
          url={dataset.identifier}
          links={linksHeader}
          otherButtons={[deleteOption, modifyButton, addToProject]}
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
        defaultBranch={props.defaultBranch}
      />
      <DisplayFiles
        projectsUrl={props.projectsUrl}
        fileContentUrl={props.fileContentUrl}
        lineagesUrl={props.lineagesUrl}
        files={props.files}
        insideProject={props.insideProject}
        loadingDatasets={props.loadingDatasets}
      />
      {
        //here we assume that if the dataset is only in one project
        //this one project is the current project and we don't display the list
        (dataset.usedIn && dataset.usedIn.length > 1) || !props.insideProject ?
          <DisplayProjects
            projects={dataset.usedIn}
            projectsUrl={props.projectsUrl}
          />
          : null
      }
      {
        dataset.insideKg === false && props.projectInsideKg === true ?
          <WarnAlert className="not-in-kg-warning">
            <strong data-cy="not-in-kg-warning">This dataset is not in the Knowledge Graph;</strong>{" "}
            this means that some
            operations on it are not possible.
            <br /><br />
            If the dataset was created recently, and the Knowledge Graph integration for the project is active,
            the dataset should be added to the Knowledge Graph soon, you can&nbsp;
            <Button size="sm" color="warning" onClick={() => window.location.reload()}>
              refresh the page</Button> to see if the status changed.
            <br /><br />
            For more information about the Knowledge Graph status you can go to the&nbsp;
            <Button size="sm" color="warning" onClick={() => props.history.push(props.overviewStatusUrl)}>
              status page
            </Button>.
          </WarnAlert>
          : null
      }
      {props.insideProject && props.maintainer ?
        <DeleteDataset
          client={props.client}
          dataset={dataset}
          history={props.history}
          httpProjectUrl={props.httpProjectUrl}
          modalOpen={deleteDatasetModalOpen}
          projectPathWithNamespace={props.projectPathWithNamespace}
          setModalOpen={setDeleteDatasetModalOpen}
          user={props.user}
          versionUrl={props.migration.core.versionUrl}
        />
        : null
      }
    </Col>
  </ContainerWrap>);
}
