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
import { Col, Card, CardHeader, CardBody, Table, Alert } from 'reactstrap';
import { Link }  from 'react-router-dom';
import { Loader } from '../utils/UIComponents';
import DOMPurify from 'dompurify';
import { API_ERRORS } from '../api-client';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFile from '@fortawesome/fontawesome-free-solid/faFile';
import faProjectDiagram from '@fortawesome/fontawesome-free-solid/faProjectDiagram';
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
            <th className="text-center">File</th>
            <th className="text-center">Lineage</th>
          </tr>
        </thead>
        <tbody>
          { props.files.map((file)=>
            <tr key={file.atLocation}>
              <td className="text-break">{file.name}</td>
              <td className="text-center">
                <Link to={`${props.fileContentUrl}/${file.atLocation}`}>
                  <FontAwesomeIcon icon={faFile} />
                </Link>
              </td>
              <td className="text-center">
                <Link to={`${props.lineagesUrl}/${file.atLocation}`}>
                  <FontAwesomeIcon icon={faProjectDiagram} />
                </Link>
              </td>
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
                  {project.name}
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

export default function DatasetView(props){
  
  const [dataset, setDataset] = useState(undefined);
  const [fetchError, setFetchError] = useState(null);

  useEffect(()=> { 
    let unmounted = false;
    if( props.datasets!== undefined && dataset === undefined ){
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
                setFetchError("Error 404: The dataset that was selected doesn't exist or coudln't be accessed.");}
              else if(!unmounted && error.case === API_ERRORS.internalServerError){
                setFetchError("Error 500: The dataset that was selected couldn't be fetched.");}
            }
          });
      } else if(!unmounted) setDataset(null);
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
    <div style={{paddingLeft:"4px"}}>
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
      {
        dataset.published !== undefined && dataset.published.creator !== undefined ?  
          <small style={{ display: 'block'}} className="font-weight-light">
            {dataset.published.creator.map((creator) => creator.name).join("; ")}
          </small>
          : null  
      }
      <p  style={{paddingTop:'12px'}} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(dataset.description)}}>
      </p>
    </div>
    <br />
    <DisplayFiles 
      projectsUrl={props.projectsUrl} 
      fileContentUrl={props.fileContentUrl} 
      lineagesUrl={props.lineagesUrl} 
      files={dataset.hasPart} 
    />
    <br />
    <DisplayProjects 
      projects={dataset.isPartOf} 
      projectsUrl={props.projectsUrl} 
    />
  </Col>
}
