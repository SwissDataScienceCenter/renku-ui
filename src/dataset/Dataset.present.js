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

import React from 'react';
import { Col, Card, CardHeader, CardBody, Table } from 'reactstrap';
import { Loader } from '../utils/UIComponents';
import faDownload from '@fortawesome/fontawesome-free-solid/faDownload'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

function DatasetTableRow({dataset, label, prop, propFunc=null, type=null}) {
  if (dataset[prop] == null) return null;
  let propVal = (propFunc) ? propFunc(dataset[prop]).toString() : dataset[prop].toString();
  propVal = type==="link" ? 
    <a rel="noopener noreferrer" target="_blank" href={propVal}>{propVal}</a> 
    : propVal;
  return (
    <tr>
      <td><strong>{label}:</strong></td>
      <td>{propVal}</td>
    </tr>
  )
}

function DisplayDetails(props){
  return <Card key="datasetFiles">
    <CardHeader className="align-items-baseline">
      <span className="caption align-baseline">Dataset Info</span>
    </CardHeader>
    <CardBody>
      <Table size="sm" borderless>
        <tbody>
          <DatasetTableRow dataset={props.dataset} label="Created" prop="created" />
          <DatasetTableRow dataset={props.dataset} label="Added" prop="added" />
          <DatasetTableRow dataset={props.dataset} label="Published" prop="date_published" propFunc={(val)=>val["@value"]} />
          <DatasetTableRow dataset={props.dataset} label="Keywords" prop="keywords" propFunc={(val)=>val.join(", ")} />
          <DatasetTableRow dataset={props.dataset} label="Language" prop="in_language" propFunc={(val)=>val.name}/>
          <DatasetTableRow dataset={props.dataset} label="URL" prop="url" type="link"/>
          <DatasetTableRow dataset={props.dataset} label="Label" prop="_label" />
        </tbody>
      </Table>
    </CardBody>
  </Card>
}

function DisplayFiles(props){
  if (props.files === undefined) return null;

  return <Card key="datasetDetails">
    <CardHeader className="align-items-baseline">
      <span className="caption align-baseline">Dataset Files</span>
    </CardHeader>
    <CardBody>
      <Table size="sm" borderless>
        <thead>
          <tr>
            <th>Path</th>
            <th className="text-center" >Download</th>
          </tr>
        </thead>
        <tbody>
          { props.files.map((file)=>
            <tr key={file._id}>
              <td>{file.path}</td>
              <td className="text-center">
                <a href={file.url}>
                  <FontAwesomeIcon className="icon-grey" icon={faDownload}>
                  </FontAwesomeIcon>
                </a>
              </td>
            </tr>  
          )}
        </tbody>
      </Table>
    </CardBody>
  </Card>
}


export default function DatasetView(props){
  
  if(props.dataset === undefined)
    return <Loader />;
  
  if(props.dataset === null)
    return "The dataset that was selected could not be found."

  const dataset = props.dataset;

  return  <Col>
    <div style={{paddingLeft:"4px"}}>
      <h4 key="datasetTitle">
        {dataset.name}
      </h4>
      {
        dataset.creator !== undefined ?  
          <small style={{ display: 'block'}} className="font-weight-light">
            {dataset.creator.map((creator) => creator.name).join("; ")}
          </small>
          : null  
      }
      <br />
      <p dangerouslySetInnerHTML={{__html: dataset.description}}>
      </p>
    </div>
    <DisplayDetails dataset={dataset} />
    <br />
    <DisplayFiles files={dataset.files} />
  </Col>

}
