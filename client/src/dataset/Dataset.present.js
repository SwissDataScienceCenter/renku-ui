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
  Table, UncontrolledButtonDropdown, Badge
} from "reactstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV, faInfoCircle, faPen, faPlus, faSearch, faTrash
} from "@fortawesome/free-solid-svg-icons";
import { ErrorAlert, FileExplorer, InfoAlert, Loader, RenkuMarkdown, ExternalLink } from "../utils/UIComponents";
import { ProjectsCoordinator } from "../project/shared";
import AddDataset from "./addtoproject/DatasetAdd.container";
import DeleteDataset from "../project/datasets/delete/index";
import Time from "../utils/Time";
import { Url } from "../utils/url";
import _ from "lodash";

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
      {
        props.files.length === 0 ?
          <span>No files on this dataset.</span>
          :
          <FileExplorer
            files={props.files}
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

function DisplayDescription(props) {
  if (!props.description) return null;

  return <Card key="datasetDescription" className="border-rk-light mb-4">
    <CardHeader className="bg-white p-3 ps-4">Dataset description</CardHeader>
    <CardBody className="p-4 pt-3 pb-3 lh-lg pb-2">
      {
        props.insideProject ?
          <RenkuMarkdown
            projectPathWithNamespace={props.projectPathWithNamespace}
            filePath={""}
            fixRelativePaths={true}
            markdownText={props.description}
            defaultBranch={props.defaultBranch}
            client={props.client}
            projectId={props.projectId}
          />
          :
          <RenkuMarkdown markdownText={props.description} />
      }
    </CardBody>
  </Card>;
}

function DisplayInfoTable(props) {

  const { dataset } = props;

  const datasetPublished = dataset.published !== undefined && dataset.published.datePublished
    !== undefined && dataset.published.datePublished !== null;
  const datasetDate = datasetPublished ? dataset.published.datePublished : dataset.created;


  const source = dataset.sameAs && dataset.sameAs.includes("doi.org") ?
    <ExternalLink url={dataset.sameAs} title={dataset.sameAs} role="link" /> :
    dataset.url && props.insideProject ?
      <ExternalLink url={dataset.url} title={dataset.url} role="link" />
      : null;

  const authors = dataset.published !== undefined && dataset.published.creator !== undefined ?
    dataset.published.creator
      .map((creator) => creator.name + (creator.affiliation ? ` (${creator.affiliation})` : ""))
      .join("; ")
    : null;

  const keywords = dataset.keywords && dataset.keywords.length > 0 ?
    dataset.keywords.map(keyword=>
      <span key={keyword}><Badge color="rk-text">{keyword}</Badge>&nbsp;</span>)
    : null;

  // eslint-disable-next-line
  return <Table className="mb-4 table-borderless" size="sm">
    <tbody className="text-rk-text">
      { source ?
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
      { authors ? <tr>
        <td className="text-dark fw-bold col-auto">
          Author(s)
        </td>
        <td>
          {authors}
        </td>
      </tr>
        : null
      }
      { datasetDate ?
        <tr>
          <td className="text-dark fw-bold col-auto">
            {datasetPublished ? "Published on " : "Created on "}
          </td>
          <td>
            {Time.getReadableDate(datasetDate.replace(/ /g, "T"))}
          </td>
        </tr>
        : null
      }
      { keywords ? <tr>
        <td className="text-dark fw-bold col-auto">
          Keywords
        </td>
        <td>
          {keywords}
        </td>
      </tr>
        : null
      }
    </tbody>
  </Table>;
}


function DatasetError(props) {
  const { fetchError, insideProject, location, logged } = props;

  // login helper
  let loginHelper = null;
  if (!logged) {
    const to = Url.get(Url.pages.login.link, { pathname: location.pathname });
    const link = (<Link className="btn btn-primary btn-sm" to={to}>Log in</Link>);
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

  if (!_.isEmpty(props.fetchError) && dataset === undefined) {
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

  return <Col>
    <Row>
      <Col md={8} sm={12}>
        {props.insideProject ?
          <h3 key="datasetTitle" className="mb-4">
            {dataset.title || dataset.name}
          </h3>
          :
          <h2 key="datasetTitle" className="mb-4">
            {dataset.title || dataset.name}
          </h2>
        }
      </Col>
      <Col md={4} sm={12} className="d-flex flex-col justify-content-end mb-auto">
        { props.logged ?
          <Button disabled={dataset.insideKg === false}
            className="float-right mb-1 me-1" size="sm" color="secondary" onClick={() => setAddDatasetModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} color="dark" /> Add to project
          </Button>
          : null}
        { props.insideProject && props.maintainer ?
          <Link className="float-right me-1 mb-1" id="editDatasetTooltip"
            to={{ pathname: "modify", state: { dataset: dataset } }} >
            <Button size="sm" color="secondary" >
              <FontAwesomeIcon icon={faPen} color="dark" />
            </Button>
          </Link>
          : null
        }
        { props.insideProject && props.maintainer ?
          <UncontrolledButtonDropdown size="sm" className="float-right mb-1">
            <DropdownToggle caret color="secondary" className="removeArrow">
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
    <div className="d-flex">
      { dataset.mediaContent ?
        <div className="flex-shrink-0 pe-3" style={{ width: "120px" }}>
          <img src={dataset.mediaContent} className=" rounded" alt=""
            style={{ objectFit: "cover", width: "100%", height: "90px" }}/>
        </div>
        : null }
      <div className="flex-grow-1">
        <DisplayInfoTable
          dataset={dataset}
          insideProject={props.insideProject}
          sameAs={props.sameAs}
        />
      </div>
    </div>
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
      files={dataset.hasPart}
      insideProject={props.insideProject}
    />
    {
      //here we assume that if the dataset is only in one project
      //this one project is the current project and we don't display the list
      (dataset.isPartOf && dataset.isPartOf.length > 1) || !props.insideProject ?
        <DisplayProjects
          projects={dataset.isPartOf}
          projectsUrl={props.projectsUrl}
        />
        : null
    }
    {
      dataset.insideKg === false && props.projectInsideKg === true ?
        <Alert color="warning" id="notInKGWarning">
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
