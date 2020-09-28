import React, { useMemo } from "react";
import { NavLink, Link } from "react-router-dom";
import { Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { ACCESS_LEVELS } from "../../api-client";
import "../filestreeview/treeviewstyle.css";
import { Loader, MarkdownTextExcerpt } from "../../utils/UIComponents";

function DatasetListRow(props) {
  const dataset = props.dataset;
  const title = <NavLink
    key={dataset.name}
    to={`${props.datasetsUrl}/${encodeURIComponent(dataset.name)}/`}
  > {dataset.title || dataset.name}</NavLink>;

  return <ListGroupItem action style={{ border: "none" }}>
    <Row>
      <Col xs={8} md={8}>
        <div className="d-flex project-list-row">
          <div className="issue-text-crop">
            <b>
              <span className="issue-title">
                {title}
              </span>
            </b><br />
            {
              dataset.creators !== undefined ?
                <small style={{ display: "block" }} className="font-weight-light">
                  {dataset.creators.map((creator) => creator.name).join("; ")}
                </small>
                : null
            }
            {
              dataset.description !== undefined && dataset.description !== null ?
                <div className="datasetDescriptionText font-weight-normal">
                  <MarkdownTextExcerpt markdownText={dataset.description} charsLimit={500} />
                </div>
                : null
            }
          </div>
        </div>
      </Col>
      <Col xs={4} md={4} className="float-right" style={{ textAlign: "end" }}>
        <small>
          {props.dataset_kg ?
            <strong>In the Knowledge Graph</strong>
            : <strong>Not in the Knowledge Graph</strong>}
        </small>
        <br />
        {
          dataset.created_at !== undefined && dataset.created_at !== null ?
            <small className="font-italic">
              {"Published: " + new Date(dataset.created_at.replace(/ /g, "T")).toLocaleDateString()}
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

  const datasets = useMemo(()=>props.datasets, [props.datasets]);

  return [<Row key="header" className="pb-3">
    <Col md={12}>
      <h2 className="ml-3">
        <span style={{ verticalAlign: "middle" }}>Datasets</span>
        <span className="pl-3" style={{ display: "inline-flex" }}>
          <AddDatasetButton
            visibility={props.visibility}
            newDatasetUrl={props.newDatasetUrl} />
        </span>
      </h2>
    </Col>
  </Row>, <Row key="datasetslist">
    <Col xs={12}>
      <ListGroup>
        {
          datasets !== undefined ?
            datasets.map((dataset)=>
              <DatasetListRow
                key={"dataset-" + dataset.name}
                dataset={dataset}
                dataset_kg={props.datasets_kg
                  ? props.datasets_kg.find(dataset_kg => dataset_kg.name === dataset.name) : undefined}
                datasetsUrl={props.datasetsUrl} />
            )
            : <Loader />
        }
      </ListGroup>
    </Col>
  </Row>
  ];

}
