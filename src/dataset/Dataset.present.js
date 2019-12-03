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

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, CardHeader, CardBody, Table, Alert, Button } from 'reactstrap';
import { Link }  from 'react-router-dom';
import { Loader } from '../utils/UIComponents';
import DOMPurify from 'dompurify';
import { API_ERRORS } from '../api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faProjectDiagram, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { GraphIndexingStatus } from '../project/Project';
import KnowledgeGraphStatus from '../file/KnowledgeGraphStatus.container';
import Time from '../utils/Time';

function DisplayFiles(props){
  if (props.files === undefined) return null;

  return <Card key="datasetDetails">
    <CardHeader className="align-items-baseline">
      <span className="caption align-baseline">Dataset files</span>
    </CardHeader>
    <CardBody>
      <Table size="sm" borderless>
        <thead>
          <tr>
            <th>Name</th>
            { props.insideProject ? <th className="text-center">File</th> : null }
            { props.insideProject ? <th className="text-center">Lineage</th> : null }
          </tr>
        </thead>
        <tbody>
          { props.files.map((file)=>
            <tr key={file.atLocation}>
              <td className="text-break">{file.name}</td>
              { props.insideProject ?
                <td className="text-center">
                  <Link to={`${props.fileContentUrl}/${file.atLocation}`}>
                    <FontAwesomeIcon icon={faFile} />
                  </Link>
                </td> : null }
              { props.insideProject ?
                <td className="text-center">
                  <Link to={`${props.lineagesUrl}/${file.atLocation}`}>
                    <FontAwesomeIcon icon={faProjectDiagram} />
                  </Link>
                </td> : null }
            </tr>
          )}
        </tbody>
      </Table>
    </CardBody>
  </Card>
}

function DisplayProjects(props){
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
          { props.projects.map((project, index)=>
            <tr key={project.name+index}>
              <td className="text-break">
                <Link to={`${props.projectsUrl}/${project.path}`}>
                  {project.path}
                </Link>
              </td>
              { project.created && project.created.dateCreated
                ? <td className="text-center">{Time.getReadableDate(project.created.dateCreated)}</td>
                : null }
              { project.created && project.created.agent
                ? <td className="text-center">{project.created.agent.name}</td>
                : null
              }
            </tr>
          )}
        </tbody>
      </Table>
    </CardBody>
  </Card>
}

function LinkToExternal(props){
  return props.link ? 
    <p>
      {props.label}: <a href={props.link} target="_blank" rel="noreferrer noopener">{ props.link } </a>
    </p>
    : null
}

export default function DatasetView(props){

  const [dataset, setDataset] = useState(undefined);
  const [fetchError, setFetchError] = useState(null);

  useEffect(()=> {
    let unmounted = false;
    if( props.insideProject && props.datasets!== undefined && dataset === undefined ){
      const selectedDataset = props.datasets.filter(d => props.selectedDataset === encodeURIComponent(d.identifier))[0];
      if(selectedDataset !== undefined){
        props.client.fetchDatasetFromKG(selectedDataset._links[0].href)
          .then((datasetInfo) => {
            if(!unmounted && dataset === undefined && datasetInfo !== undefined){
              setDataset(datasetInfo)
            }
          }).catch(error => {
            if(fetchError === null){
              if (!unmounted && error.case === API_ERRORS.notFoundError){
                setFetchError("Error 404: The dataset that was selected doesn't exist or couldn't be accessed.");}
              else if(!unmounted && error.case === API_ERRORS.internalServerError){
                setFetchError("Error 500: The dataset that was selected couldn't be fetched.");}
            }
          });
      } else if(!unmounted) setDataset(null);
    } else {
      if(dataset === undefined && props.identifier !== undefined){
        props.client.fetchDatasetFromKG(props.client.baseUrl.replace('api','knowledge-graph/datasets/')+props.identifier)
          .then((datasetInfo) => {
            if(!unmounted && dataset === undefined && datasetInfo !== undefined){
              setDataset(datasetInfo)
            }
          }).catch(error => {
            if(fetchError === null){
              if (!unmounted && error.case === API_ERRORS.notFoundError){
                setFetchError("Error 404: The dataset that was selected doesn't exist or couldn't be accessed.");}
              else if(!unmounted && error.case === API_ERRORS.internalServerError){
                setFetchError("Error 500: The dataset that was selected couldn't be fetched.");}
            }
          });
      }
    }
    return () => {
      unmounted=true;
    };
  }, [dataset, props, fetchError]);

  if(props.insideProject){
    const {progress, webhookJustCreated} = props;

    if(progress == null
      || progress === GraphIndexingStatus.NO_WEBHOOK
      || progress === GraphIndexingStatus.NO_PROGRESS
      || (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE)
    )
      return <KnowledgeGraphStatus
        insideDatasets={true}
        fetchGraphStatus={props.fetchGraphStatus}
        retrieveGraph={props.retrieveGraph}
        progress={progress}
        webhookJustCreated={webhookJustCreated}
        maintainer={props.maintainer}
        createGraphWebhook={props.createGraphWebhook}
        forked={props.forked}
      />;
  }

  if(fetchError !== null && dataset === undefined)
    return <Alert color="danger">{fetchError}</Alert>;
  if(dataset === undefined) return <Loader />;
  if(dataset === null)
    return <Alert color="danger">Error 404: The dataset that was selected doesn't exist or couldn't be accessed</Alert>

  return <Col>
    <Row>
      <Col md={10} sm={12}>
        {
          dataset.published !== undefined && dataset.published.datePublished !== undefined ?
            <small style={{ display: 'block', paddingBottom:'8px'}} className="font-weight-light font-italic">
            Uploaded on { Time.getReadableDate(dataset.published.datePublished) }.
            </small>
            : null
        }
        <h4 key="datasetTitle">
          {dataset.name}
        </h4> 
      </Col>
      { dataset.url ? 
        <Col md={2} sm={12}>
          <a className="float-right" href={dataset.url} target="_blank" rel="noreferrer noopener">
            <Button outline color="dark" >
              <FontAwesomeIcon icon={faExternalLinkAlt} color="dark" /> Go to source
            </Button>
          </a>
        </Col>
        : null  
      }
    </Row>
    {
      dataset.published !== undefined && dataset.published.creator !== undefined ?
        <small style={{ display: 'block'}} className="font-weight-light">
          {
            dataset.published.creator
              .map((creator) => creator.name + (creator.affiliation ? `(${creator.affiliation})`:"") )
              .join("; ")
          }
        </small>
        : null
    }
    <p  style={{paddingTop:'12px'}} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(dataset.description)}}>
    </p>
    <LinkToExternal link={dataset.url} label="Source" />
    <LinkToExternal link={dataset.sameAs} label="DOI" />
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
  </Col>
}
