import React, { useMemo } from "react";
import { NavLink, Link } from "react-router-dom";
import { Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { ACCESS_LEVELS } from "../../api-client";
import "../filestreeview/treeviewstyle.css";
import { Loader, MarkdownTextExcerpt } from "../../utils/UIComponents";
import { SpecialPropVal } from "../../model";

function DatasetListRow(props) {
  const dataset = props.dataset;
  const title = <NavLink
    key={dataset.name}
    to={`${props.datasetsUrl}/${encodeURIComponent(dataset.name)}/`}
  > {dataset.title || dataset.name}</NavLink>;

  return <ListGroupItem className="pb-0" action style={{ border: "none" }}>
    <Row>
      <Col xs={8} md={8} className="pb-0">
        <div className="d-flex project-list-row">
          <div className="issue-text-crop">
            <b>
              <span className="issue-title">
                {title}
              </span>
            </b><br />
          </div>
        </div>
        {
          dataset.creators !== undefined ?
            <small style={{ display: "block" }} className="font-weight-light issue-text-crop">
              {dataset.creators.map((creator) => creator.name).join("; ")}
            </small>
            : null
        }
      </Col>
      <Col xs={4} md={4} className="float-right" style={{ textAlign: "end" }}>
        <small>
          {props.dataset_kg !== undefined && props.graphStatus === true ?
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
      {
        dataset.description !== undefined && dataset.description !== null ?
          <Col md={12}>
            <div className="datasetDescriptionText font-weight-light">
              <MarkdownTextExcerpt markdownText={dataset.description} charsLimit={200} />
            </div></Col>
          : null
      }
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

  if (props.datasets_kg === SpecialPropVal.UPDATING)
    return <Loader />;

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
                graphStatus={props.graphStatus}
                datasetsUrl={props.datasetsUrl} />
            )
            : <Loader />
        }
      </ListGroup>
    </Col>
  </Row>
  ];

}
