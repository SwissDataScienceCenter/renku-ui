import React, { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Row, Col } from "reactstrap";

import { ACCESS_LEVELS } from "../../api-client";
import "../filestreeview/treeviewstyle.css";
import { SpecialPropVal } from "../../model";
import { MarkdownTextExcerpt } from "../../utils/components/markdown/RenkuMarkdown";
import { Loader } from "../../utils/components/Loader";
import ListDisplay from "../../utils/components/List";
import { ThrottledTooltip } from "../../utils/components/Tooltip";

function datasetToDict(datasetsUrl, dataset_kg, graphStatus, gridDisplay, dataset) {
  const kgCaption =
    dataset_kg !== undefined && graphStatus === true ?
      "In the Knowledge Graph"
      : "Not in the Knowledge Graph";
  const timeCaption = (dataset.created_at != null) ?
    new Date(dataset.created_at.replace(/ /g, "T")) :
    "";
  return {
    id: dataset.name,
    url: `${datasetsUrl}/${encodeURIComponent(dataset.name)}/`,
    itemType: "dataset",
    title: dataset.title || dataset.name,
    description: dataset.description !== undefined && dataset.description !== null ?
      <Fragment>
        <MarkdownTextExcerpt markdownText={dataset.description} singleLine={gridDisplay ? false : true}
          charsLimit={gridDisplay ? 200 : 100} />
        <span className="ms-1">{dataset.description.includes("\n") ? " [...]" : ""}</span>
      </Fragment>
      : null,
    timeCaption: timeCaption,
    labelCaption: `${kgCaption}. Created `,
    creators: dataset.creators,
    mediaContent: dataset.mediaContent
  };
}


function DatasetList({ datasets, datasets_kg, datasetsUrl, graphStatus }) {
  if (datasets == null ) return <Loader />;

  const gridDisplay = true;
  const datasetItems = datasets.map((d) => {
    const dataset_kg = datasets_kg ?
      datasets_kg.find(dataset_kg => dataset_kg.name === d.name) :
      undefined;
    return datasetToDict(datasetsUrl, dataset_kg, graphStatus, gridDisplay, d);
  });
  return <ListDisplay
    itemsType="dataset"
    search={null}
    currentPage={null}
    gridDisplay={gridDisplay}
    totalItems={datasets.length}
    perPage={datasets.length}
    items={datasetItems}
  />;
}

function AddDatasetButton({ accessLevel, locked, newDatasetUrl }) {
  if (accessLevel < ACCESS_LEVELS.MAINTAINER) return null;
  if (locked) {
    return <div id="add-dataset-button">
      <Button data-cy="add-dataset-button" disabled={true}>
        <span className="arrow-right pt-2 pb-2">  </span>
        Add Dataset
      </Button>
      <ThrottledTooltip
        target="add-dataset-button"
        tooltip="Cannot add dataset until project modification finishes." />
    </div>;
  }

  return <div>
    <Link className="btn btn-sm btn-secondary" role="button" to={newDatasetUrl}>
      <span className="arrow-right pt-2 pb-2">  </span>
      Add Dataset
    </Link>
  </div>;
}

export default function DatasetsListView(props) {

  const datasets = useMemo(()=>props.datasets, [props.datasets]);

  if (props.datasets_kg === SpecialPropVal.UPDATING)
    return <Loader />;

  return [ <Row key="header" className="pt-2 pb-3">
    <Col className="d-flex mb-2 justify-content-between">
      <h3 className="me-4">Datasets List</h3>
      <AddDatasetButton
        accessLevel={props.accessLevel}
        locked={props.locked}
        newDatasetUrl={props.newDatasetUrl} />
    </Col>
  </Row>
  , <Row key="datasetsList">
    <Col xs={12}>
      <DatasetList
        datasets={datasets}
        datasets_kg={props.datasets_kg}
        datasetsUrl={props.datasetsUrl}
        graphStatus={props.graphStatus} />
    </Col>
  </Row>
  ];

}
