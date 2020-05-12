import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { ACCESS_LEVELS } from "../../api-client";
import "../filestreeview/treeviewstyle.css";
import { Loader, MarkdownTextExtract } from "../../utils/UIComponents";

function DatasetListRow(props) {
  const dataset = props.dataset;
  const title = <NavLink
    key={dataset.identifier}
    to={`${props.datasetsUrl}/${encodeURIComponent(dataset.identifier)}/`}
  > {dataset.name} </NavLink>;

  const projectsCountLabel = dataset.isPartOf.length > 1
    ? `In ${dataset.isPartOf.length} projects`
    : `In ${dataset.isPartOf.length} project`;

  return <ListGroupItem action style={{ border: "none" }}>
    <Row>
      <Col md={9}>
        <div className="d-flex project-list-row">
          <div className="issue-text-crop">
            <b>
              <span className="issue-title">
                {title}
              </span>
            </b><br />
            {
              dataset.published !== undefined && dataset.published.creator !== undefined ?
                <small style={{ display: "block" }} className="font-weight-light">
                  {dataset.published.creator.map((creator) => creator.name).join("; ")}
                </small>
                : null
            }
            {
              dataset.description !== undefined && dataset.description !== null ?
                <div className="datasetDescriptionText font-weight-normal">
                  <MarkdownTextExtract markdownText={dataset.description} charsLimit={500} />
                </div>
                : null
            }
          </div>
        </div>
      </Col>
      <Col sm={3} md={3} className="float-right" style={{ textAlign: "end" }}>
        <small>{projectsCountLabel}</small>
        <br />
        {
          dataset.published !== undefined && dataset.published.datePublished !== undefined ?
            <small className="font-italic">
              {"Published: " + new Date(dataset.published.datePublished).toLocaleDateString()}
            </small>
            : null
        }
      </Col>
    </Row>
  </ListGroupItem>;
}

function AddDatasetButton(props) {
  if (props.visibility.accessLevel >= ACCESS_LEVELS.MAINTAINER) {
    return <small className="float-right" mr={1}>
      <Link className="btn btn-primary" role="button" to={props.newDatasetUrl}>Add Dataset</Link>
    </small>;
  }
  return null;
}

export default function DatasetsListView(props) {
  const [datasets, setDatasets] = useState(undefined);

  useState(()=>{
    if (datasets === undefined && props.datasets !== undefined)
      setDatasets(props.datasets);
  });

  return [<Row key="header" className="pb-3">
    <Col md={3} lg={2}><h2 className="ml-3">Datasets</h2></Col>
    <Col md={3}>
      <AddDatasetButton
        visibility={props.visibility}
        newDatasetUrl={props.newDatasetUrl}/>
    </Col>
  </Row>, <Row key="datasetslist">
    <Col xs={12}>
      <ListGroup>
        {
          datasets !== undefined ?
            datasets.map((dataset)=>
              <DatasetListRow
                key={"dataset-" + dataset.identifier}
                dataset={dataset}
                datasetsUrl={props.datasetsUrl} />
            )
            : <Loader />
        }
      </ListGroup>
    </Col>
  </Row>
  ];

}
