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
import { Row, Col, Card, CardHeader, CardBody, Table, Alert, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { Loader, FileExplorer, RenkuMarkdown } from "../utils/UIComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import Time from "../utils/Time";
import AddDataset from "./addtoproject/DatasetAdd.container";
import { ProjectsCoordinator } from "../project/shared";

function DisplayFiles(props) {
  if (props.files === undefined) return null;

  if (props.files.error) {
    return <Card key="datasetDetails">
      <CardHeader className="align-items-baseline">
        <span className="caption align-baseline">Dataset files</span>
      </CardHeader>
      <CardBody>
        <strong>Error fetching dataset files:</strong> {props.files.error.reason}
      </CardBody>
    </Card>;
  }

  let openFolders = props.files.length > 0 ?
    ( props.files[0].atLocation.startsWith("data/") ? 2 : 1 )
    : 0;

  return <Card key="datasetDetails">
    <CardHeader className="align-items-baseline">
      <span className="caption align-baseline">Dataset files ({props.files.length})</span>
    </CardHeader>
    <CardBody>
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
  return <Card key="datasetDetails">
    <CardHeader className="align-items-baseline">
      <span className="caption align-baseline">Projects using this dataset</span>
    </CardHeader>
    <CardBody>
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

export default function DatasetView(props) {

  const [addDatasetModalOpen, setAddDatasetModalOpen] = useState(false);
  const dataset = props.dataset;

  if (props.fetchError !== null && dataset === undefined)
    return <Alert color="danger">{props.fetchError}</Alert>;
  if (dataset === undefined) return <Loader />;
  if (dataset === null) {
    return (
      <Alert color="danger">
        The dataset that was selected does not exist or could notbe accessed.<br /> <br />
        If you just created or imported the dataset
        try <Button color="danger" size="sm" onClick={
          () => window.location.reload()
        }>reloading</Button> the page.</Alert>
    );
  }

  const datasetPublished = dataset.published !== undefined && dataset.published.datePublished
    !== undefined && dataset.published.datePublished !== null;

  return <Col>
    <Row>
      <Col md={8} sm={12}>
        { datasetPublished ?
          <small style={{ display: "block", paddingBottom: "8px" }} className="font-weight-light font-italic">
            Uploaded on {Time.getReadableDate(dataset.published.datePublished.replace(/ /g, "T"))}.
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
      <Col md={4} sm={12}>
        { props.logged ?
          <Button disabled={dataset.insideKg === false}
            className="float-right mb-1" size="sm" color="primary" onClick={() => setAddDatasetModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} color="dark" /> Add to project
          </Button>
          : null}
        { props.insideProject && props.maintainer ?
          <Link className="float-right mr-1 mb-1" to={{ pathname: "modify", state: { dataset: dataset } }} >
            <Button size="sm" color="primary" >
              <FontAwesomeIcon icon={faPen} color="dark" /> Modify
            </Button>
          </Link>
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
      dataset.insideKg === false ?
        <Alert color="primary">
          <strong>This dataset is not in the Knowledge Graph;</strong> this means that some
          operations on it are not possible.<br /><br />
          If the dataset was created recently, and the Knowledge Graph integration for the project is active,
          the dataset should be added to the Knowledge Graph soon. Otherwise, you need to
          activate the Knowlede Graph to be able to use the full set of dataset features.
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
        />
        : null
    }

  </Col>;
}
