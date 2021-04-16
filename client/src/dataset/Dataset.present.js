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
import {
  Alert, Button, Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Row,
  Table, UncontrolledButtonDropdown,
} from "reactstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV, faExternalLinkAlt, faInfoCircle, faPen, faPlus, faSearch, faTrash
} from "@fortawesome/free-solid-svg-icons";
import { ErrorAlert, FileExplorer, InfoAlert, Loader, RenkuMarkdown } from "../utils/UIComponents";
import { ProjectsCoordinator } from "../project/shared";
import AddDataset from "./addtoproject/DatasetAdd.container";
import DeleteDataset from "../project/datasets/delete/index";
import Time from "../utils/Time";


function DisplayFiles(props) {
  if (props.files === undefined) return null;

  if (props.files.error !== undefined) {
    return <Card key="datasetDetails" className="border-rk-light mb-4">
      <CardHeader className="bg-white p-3 ps-4">Dataset files</CardHeader>
      <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
        <strong>Error fetching dataset files:</strong> {props.files.error.reason}
      </CardBody>
    </Card>;
  }

  let openFolders = props.files.length > 0 ?
    ( props.files[0].atLocation.startsWith("data/") ? 2 : 1 )
    : 0;

  return <Card key="datasetDetails" className="border-rk-light mb-4">
    <CardHeader className="bg-white p-3 ps-4">Dataset files ({props.files.length})</CardHeader>
    <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
      <FileExplorer
        files={props.files}
        lineageUrl={props.lineagesUrl}
        insideProject={props.insideProject}
        foldersOpenOnLoad={openFolders}
      />
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
            <tr key={project.name + index}>
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

function LinkToExternal(props) {
  return props.link ?
    <p>
      {props.label}: <a href={props.link} target="_blank" rel="noreferrer noopener">{props.link} </a>
    </p>
    : null;
}

function DatasetError(props) {
  const { fetchError, insideProject, location, logged } = props;

  // login helper
  let loginHelper = null;
  if (!logged) {
    const postLoginUrl = location.pathname;
    const to = { "pathname": "/login", "state": { previous: postLoginUrl } };
    const link = (<Link className="btn btn-primary btn-sm" to={to} previous={postLoginUrl}>Log in</Link>);
    loginHelper = (
      <p className="mb-0">
        <FontAwesomeIcon icon={faInfoCircle} /> You might need to be logged in to see this dataset.
        Please try to {link}
      </p>
    );
  }

  // inside project case
  if (insideProject) {
    const title = `Error ${fetchError.code ? fetchError.code : "unknown"}`;
    let errorDetails = null;
    if (fetchError.code === 404) {
      errorDetails = (
        <p>We could not find the dataset. It is possible it has been deleted by its owner.</p>
      );
    }
    else if (fetchError.message) {
      errorDetails = (<p>Error details: {fetchError.message}</p>);
    }
    const tip = logged ?
      (<p className="mb-0">You can try to select a dataset again from the list in the previous page.</p>) :
      loginHelper;

    return (
      <ErrorAlert timeout={0}>
        <h5>{title}</h5>
        {errorDetails}
        {tip}
      </ErrorAlert>
    );
  }

  // global page case
  let errorDetails = null;
  if (fetchError.code === 404) {
    const info = logged ?
      (
        <InfoAlert timeout={0}>
          <p>
            <FontAwesomeIcon icon={faInfoCircle} /> If you are sure the dataset exists,
            you may want to try the following:
          </p>
          <ul className="mb-0">
            <li>Do you have multiple accounts? Are you logged in with the right user?</li>
            <li>
              If you received this link from someone, ask that person to make sure you have access to the dataset.
            </li>
          </ul>
        </InfoAlert>
      ) :
      (<InfoAlert timeout={0}>{loginHelper}</InfoAlert>);
    errorDetails = (
      <div>
        <h3>Dataset not found <FontAwesomeIcon icon={faSearch} flip="horizontal" /></h3>
        <div>&nbsp;</div>
        <p>
          It is possible that the dataset has been deleted by its owner or you do not have permission
          to access it.
        </p>
        {info}
      </div>
    );
  }
  else if (fetchError.message) {
    errorDetails = (<p>Error details: {fetchError.message}</p>);
  }

  return (
    <div>
      <h1>Error {fetchError.code ? fetchError.code : "unknown"}</h1>
      {errorDetails}
    </div>
  );
}

export default function DatasetView(props) {

  const [addDatasetModalOpen, setAddDatasetModalOpen] = useState(false);
  const [deleteDatasetModalOpen, setDeleteDatasetModalOpen] = useState(false);
  const dataset = props.dataset;

  if (props.fetchError !== null && dataset === undefined) {
    return (
      <DatasetError
        fetchError={props.fetchError}
        insideProject={props.insideProject}
        location={props.location}
        logged={props.logged} />
    );
  }

  if (dataset === undefined)
    return (<Loader />);

  const datasetPublished = dataset.published !== undefined && dataset.published.datePublished
    !== undefined && dataset.published.datePublished !== null;

  let datasetDate = datasetPublished ? dataset.published.datePublished : dataset.created;

  return <Col>
    <Row>
      <Col md={8} sm={12}>
        { datasetDate ?
          <small style={{ display: "block", paddingBottom: "8px" }} className="font-weight-light font-italic">
            {datasetPublished ? "Published on " : "Created on "}
            {Time.getReadableDate(datasetDate.replace(/ /g, "T"))}.
          </small>
          : null
        }
        <h4 key="datasetTitle">
          {dataset.title || dataset.name}
          {dataset.url && props.insideProject ?
            <a href={dataset.url} target="_blank" rel="noreferrer noopener">
              <Button size="sm" color="link" style={{ color: "rgba(0, 0, 0, 0.5)" }}>
                <FontAwesomeIcon icon={faExternalLinkAlt} color="dark" /> Go to source
              </Button>
            </a>
            : null
          }
        </h4>
      </Col>
      <Col md={4} sm={12} className="d-flex flex-col justify-content-end mb-auto">
        { props.logged ?
          <Button disabled={dataset.insideKg === false}
            className="float-right mb-1 me-1" size="sm" color="primary" onClick={() => setAddDatasetModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} color="dark" /> Add to project
          </Button>
          : null}
        { props.insideProject && props.maintainer ?
          <Link className="float-right me-1 mb-1" id="editDatasetTooltip"
            to={{ pathname: "modify", state: { dataset: dataset } }} >
            <Button size="sm" color="primary" >
              <FontAwesomeIcon icon={faPen} color="dark" />
            </Button>
          </Link>
          : null
        }
        { props.insideProject && props.maintainer ?
          <UncontrolledButtonDropdown size="sm" className="float-right mb-1">
            <DropdownToggle caret color="primary" className="removeArrow">
              <FontAwesomeIcon icon={faEllipsisV} color="dark" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setDeleteDatasetModalOpen(true)}>
                <FontAwesomeIcon icon={faTrash} color="dark" /> Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
          : null
        }
      </Col>
    </Row>
    { dataset.published !== undefined && dataset.published.creator !== undefined ?
      <small style={{ display: "block" }} className="font-weight-light">
        {
          dataset.published.creator
            .map((creator) => creator.name + (creator.affiliation ? ` (${creator.affiliation})` : ""))
            .join("; ")
        }
      </small>
      : null
    }
    <div style={{ paddingTop: "12px" }}>
      {
        props.insideProject ?
          <RenkuMarkdown
            projectPathWithNamespace={props.projectPathWithNamespace}
            filePath={""}
            fixRelativePaths={true}
            markdownText={dataset.description}
            client={props.client}
            projectId={props.projectId}
          />
          :
          <RenkuMarkdown markdownText={dataset.description} />
      }
    </div>
    {
      dataset.url && props.insideProject ?
        <LinkToExternal link={dataset.url} label="Source" />
        : null
    }
    {
      dataset.sameAs && dataset.sameAs.includes("doi.org") ?
        <LinkToExternal link={dataset.sameAs} label="DOI" />
        : null
    }
    {
      dataset.keywords && dataset.keywords.length > 0 ?
        <p>Keywords:  {dataset.keywords.join(", ")}</p>
        : null
    }
    <DisplayFiles
      projectsUrl={props.projectsUrl}
      fileContentUrl={props.fileContentUrl}
      lineagesUrl={props.lineagesUrl}
      files={dataset.hasPart}
      insideProject={props.insideProject}
    />
    <br />
    <DisplayProjects
      projects={dataset.isPartOf}
      projectsUrl={props.projectsUrl}
    />
    {
      dataset.insideKg === false && props.projectInsideKg === true ?
        <Alert color="warning">
          <strong>This dataset is not in the Knowledge Graph;</strong> this means that some
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
        </Alert>
        : null
    }
    {
      props.logged ?
        <AddDataset
          dataset={dataset}
          modalOpen={addDatasetModalOpen}
          setModalOpen={setAddDatasetModalOpen}
          projectsCoordinator={new ProjectsCoordinator(props.client, props.model.subModel("projects"))}
          model={props.model}
          history={props.history}
          client={props.client}
          user={props.user}
          formLocation={props.location.pathname + "/add"}
        />
        : null
    }
    { props.insideProject && props.maintainer ?
      <DeleteDataset
        dataset={dataset}
        modalOpen={deleteDatasetModalOpen}
        setModalOpen={setDeleteDatasetModalOpen}
        httpProjectUrl={props.httpProjectUrl}
        projectPathWithNamespace={props.projectPathWithNamespace}
        history={props.history}
        client={props.client}
        user={props.user}
      />
      : null
    }
  </Col>;
}
